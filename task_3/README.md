# Задача 3: Контейнеризация тестирования сайта ИнфоТеКС с использованием Docker

## Требования к заданию

- **Контейнеризация**: Контейнер должен запускать тесты в автоматическом режиме (без ручного вмешательства)
- **Размещение**: Файл `Dockerfile` должен быть размещен в корне проекта (в директории `task_3/`)
- **Документация**: Процесс сборки образа и запуска контейнера должен быть описан в инструкции `README.md`

## Описание задания

Данная задача является продолжением **Задачи 2** (автоматизация тестирования сайта ИнфоТеКС с использованием Playwright).

Необходимо реализовать контейнеризацию проекта для автоматического запуска тестов в Docker-контейнере.

### Требования к Dockerfile:

#### 1. Базовый образ
Образ должен включать **Node.js** или **Bun** и все зависимости проекта для запуска Playwright тестов.

#### 2. Автоматический запуск тестов
По завершении инициализации контейнер должен автоматически выполнять все сценарии тестов без ручного вмешательства.

#### 3. HTML-отчет
По завершении тестов должен формироваться HTML-отчёт. Результат необходимо:
- Сохранять в volume Docker, или
- Копироваться из контейнера на хост-машину

#### 4. Exit-код
Контейнер должен завершаться с exit-кодом, отражающим успех или провал тестов:
- `0` — все тесты пройдены успешно
- `1` — обнаружены ошибки при выполнении тестов

#### 5. Логирование
Логи выполнения тестов должны выводиться в `stdout/stderr` для отслеживания процесса выполнения.

## Структура проекта

```
task_3/
├── Dockerfile                # Конфигурация Docker-образа
├── README.md                 # Этот файл (инструкция по использованию)
└── [внешние файлы проекта]   # Источники из task_2/
```

## Установка и подготовка

### Предварительные требования

Убедитесь, что на вашей машине установлены:

```bash
# Проверка установки Docker
docker --version

# Проверка установки Node.js (если используется локально)
node --version
npm --version
```

## Сборка Docker-образа

### Шаг 1: Переход в директорию task_3

```bash
cd /task_3
```

### Шаг 2: Сборка образа

```bash
docker build -f ./Dockerfile -t infotecs-playwright-tests:latest ..
```

**Параметры команды:**
- `-f task_3/Dockerfile` — путь к Dockerfile относительно контекста сборки
- `-t infotecs-playwright-tests:latest` — присвоение тега образу
- `..` — использование корневой директории проекта как контекста сборки (это важно для доступа к файлам из task_2)

### Шаг 3: Проверка сборки

```bash
docker images | grep infotecs-playwright-tests
```

## Запуск контейнера

### Вариант 1: Запуск с выводом логов в консоль (без сохранения отчета на хост)

```bash
docker run --rm \
  --init \
  --ipc=host \
  infotecs-playwright-tests:latest
```

**Описание:**
- `--rm` — автоматическое удаление контейнера после завершения
- Логи тестов выводятся в консоль
- HTML-отчет остается внутри контейнера

### Вариант 2: Запуск с сохранением HTML-отчета на хост (через volume)

```bash
mkdir -p "$(pwd)/playwright-report" && \
docker run --rm \
  --init \
  --ipc=host \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  infotecs-playwright-tests:latest
```

**Описание:**
- `-v $(pwd)/playwright-report:/app/playwright-report` — монтирование volume для сохранения отчета
- Путь `/app/playwright-report` должен соответствовать пути в контейнере (см. Dockerfile)
- После завершения контейнера отчет будет доступен в папке `playwright-report/` на хост-машине

### Вариант 3: Копирование отчета из контейнера вручную

```bash
# Запуск контейнера (без --rm для сохранения контейнера)
docker run -d --name infotecs-test infotecs-playwright-tests:latest

# Ожидание завершения тестов
docker wait infotecs-test

# Копирование отчета из контейнера
docker cp infotecs-test:/app/playwright-report ./playwright-report-output

# Удаление контейнера
docker rm infotecs-test
```

### Вариант 4: Запуск с сохранением отчета и проверкой exit-кода

```bash
mkdir -p "$(pwd)/playwright-report" && \
docker run --rm \
  --init \
  --ipc=host \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  infotecs-playwright-tests:latest
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Все тесты пройдены успешно"
else
    echo "Тесты не пройдены (exit code: $EXIT_CODE)"
fi
```

## Просмотр HTML-отчета

После завершения контейнера откройте HTML-отчет в браузере (убедитесь, что вы находитесь в директории task_3):

```bash
# На Linux/Mac
open playwright-report/index.html

# На Windows
start playwright-report\index.html

```

## Конфигурация Dockerfile

### Основные компоненты

1. Базовый образ: mcr.microsoft.com/playwright:v1.62.1-noble — официальный образ Playwright с Node.js и установленными браузерами.
2. Рабочая директория: /app.
3. Зависимости проекта: копируются файлы package.json и package-lock.json из директории task_2/.
4. Установка зависимостей: выполняется команда npm ci для установки зависимостей в соответствии с package-lock.json.
5. Конфигурация TypeScript: копируется tsconfig.json.
6. Конфигурация Playwright: копируется playwright.config.ts.
7. Исходный код: копируются директории pages/ и tests/.
8. Директории для результатов: создаются /app/playwright-report и /app/test-results.
9. Переменная окружения: DOCKER=true позволяет определить запуск тестов внутри Docker-контейнера.

### Пример структуры Dockerfile

```dockerfile
FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

COPY task_2/package*.json ./

RUN npm ci

COPY task_2/tsconfig.json ./
COPY task_2/playwright.config.ts ./

COPY task_2/pages ./pages
COPY task_2/tests ./tests

RUN mkdir -p /app/playwright-report /app/test-results

ENV DOCKER=true

CMD ["npx", "playwright", "test"]
```

### Важные замечания:

- **Контекст сборки**: Docker build должен запускаться из директории **task_3**
- **Рабочая директория**: Установлена в `/app`, что соответствует пути `/app/playwright-report` при монтировании volume

## Проверка статуса выполнения

Чтобы проверить, успешно ли выполнились тесты:

```bash
docker run --rm infotecs-playwright-tests:latest
echo "Exit code: $?"
```

Exit code `0` указывает на успешное выполнение всех тестов.


## Связь с Задачей 2

Эта задача базируется на **Задаче 2** (автоматизация тестирования сайта ИнфоТеКС с использованием Playwright и Node.js/Bun).

Убедитесь, что:
1. Все тесты в `task_2/` работают корректно локально
2. Конфигурация `playwright.config.ts` использует режим `headless: true`
3. Все необходимые зависимости указаны в `task_2/package.json`

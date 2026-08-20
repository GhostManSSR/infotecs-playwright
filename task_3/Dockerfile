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
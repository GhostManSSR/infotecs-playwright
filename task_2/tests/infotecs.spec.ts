import { test } from '@playwright/test';

import { HomePage } from '../pages/HomePage';
import { PatentsPage } from '../pages/PatentsPage';

test.describe('ИнфоТеКС — раздел "О компании"', () => {

    test(
        'Проверка раздела "О компании" и количества патентов',
        async ({ page }) => {

            const homePage = new HomePage(page);
            const patentsPage = new PatentsPage(page);

            await test.step(
                'Перейти на сайт infotecs.ru',
                async () => {
                    await homePage.openHomePage();
                }
            );

            await test.step(
                'Раскрыть раздел "О компании"',
                async () => {
                    await homePage.expandAboutCompany();
                }
            );

            await test.step(
                'Проверить пункты раздела "О компании"',
                async () => {
                    await homePage.verifyAboutCompanyTabs();
                }
            );

            await test.step(
                'Перейти в "Главная → О компании → Патенты"',
                async () => {
                    await homePage.openPatents();
                }
            );

            await test.step(
                'Проверить сумму категорий патентов',
                async () => {
                    await patentsPage.verifyPatentSum();
                }
            );
        }
    );
});
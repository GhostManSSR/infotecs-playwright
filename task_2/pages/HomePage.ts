import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    private readonly aboutCompanyButton;

    private readonly companyTabs = [
        'Компания «ИнфоТеКС»',
        'Экосистема ИнфоТеКС',
        'Лицензии',
        'Академия',
        'Патенты',
        'Акционерам',
        'Реквизиты',
        'Вакансии',
        'Контакты',
        'Информационные материалы'
    ];

    constructor(page: Page) {
        super(page);

        this.aboutCompanyButton = page.locator(
            'nav.b-header__menu a.b-header__menu-item[data-text="О компании"]'
        );
    }

    async openHomePage(): Promise<void> {
        await this.open('/');

        await this.page.waitForLoadState('domcontentloaded');

        await expect(
            this.aboutCompanyButton,
            'Пункт "О компании" не найден в главном меню'
        ).toBeVisible();
    }

    async expandAboutCompany(): Promise<void> {
        await expect(
            this.aboutCompanyButton,
            'Пункт "О компании" не найден в главном меню'
        ).toBeVisible();

        await this.aboutCompanyButton.hover();

        await expect(
            this.aboutCompanyButton,
            'Раздел "О компании" не открылся'
        ).toHaveAttribute('aria-expanded', 'true');
    }

    async verifyAboutCompanyTabs(): Promise<void> {
        const visibleMenuLinks = this.page.locator(
            'a.b-menu-content__standalone-link:visible'
        );

        for (const tab of this.companyTabs) {
            const locator = visibleMenuLinks.filter({
                hasText: tab
            });

            await expect(
                locator,
                `В разделе "О компании" отсутствует пункт "${tab}"`
            ).toHaveCount(1);

            await expect(
                locator,
                `Пункт "${tab}" найден, но не отображается`
            ).toBeVisible();
        }
    }

    async openPatents(): Promise<void> {
        const patentsLink = this.page
            .locator('a.b-menu-content__standalone-link:visible')
            .filter({ hasText: 'Патенты' })
            .first();

        await expect(
            patentsLink,
            'Пункт "Патенты" не найден в разделе "О компании"'
        ).toBeVisible();

        await patentsLink.click();

        await this.page.waitForLoadState('domcontentloaded');

        await expect(
            this.page,
            'Не удалось перейти на страницу "Патенты"'
        ).toHaveURL(/патент|patent/i);
    }
}

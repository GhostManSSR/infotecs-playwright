import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PatentValues {
    inventions: number;
    products: number;
    trademarks: number;
    industrialDesigns: number;
    total: number;
}

export class PatentsPage extends BasePage {
    private readonly inventionsCount = this.page.locator('button.b-chip[data-filter-id="133"] .b-chip__count');

    private readonly productsCount = this.page.locator('button.b-chip[data-filter-id="136"] .b-chip__count');

    private readonly trademarksCount = this.page.locator('button.b-chip[data-filter-id="135"] .b-chip__count');

    private readonly industrialDesignsCount = this.page.locator('button.b-chip[data-filter-id="134"] .b-chip__count');

    private readonly totalCount = this.page.locator('.b-files-page__title-count');

    async getPatentValues(): Promise<PatentValues> {
        await expect(this.inventionsCount, 'Не найдено количество патентов РФ на изобретения').toBeVisible();

        await expect(this.productsCount, 'Не найдено количество свидетельств на продукты').toBeVisible();

        await expect(this.trademarksCount, 'Не найдено количество свидетельств на товарные знаки').toBeVisible();

        await expect(this.industrialDesignsCount, 'Не найдено количество патентов РФ на промышленные образцы').toBeVisible();

        await expect(this.totalCount, 'Не найдено общее количество патентов').toBeVisible();

        return {
            inventions: await this.getNumber(this.inventionsCount),

            products: await this.getNumber(this.productsCount),

            trademarks: await this.getNumber(this.trademarksCount),

            industrialDesigns: await this.getNumber(this.industrialDesignsCount),

            total: await this.getNumber(this.totalCount)
        };
    }

    private async getNumber(locator: ReturnType<Page['locator']>): Promise<number> {
        const text = await locator.innerText();

        const value = Number(text.trim().replace(/\s/g, ''));

        if (Number.isNaN(value)) {
            throw new Error(`Не удалось преобразовать "${text}" в число`);
        }

        return value;
    }

    async verifyPatentSum(): Promise<void> {
        const values = await this.getPatentValues();

        const calculatedTotal = values.inventions + values.products + values.trademarks + values.industrialDesigns;

        console.log('');
        console.log('========== ПАТЕНТЫ ==========');
        console.log(`Патенты РФ на изобретения: ${values.inventions}`);

        console.log(`Свидетельства на продукты: ${values.products}`);
        console.log(`Свидетельства на товарные знаки: ${values.trademarks}`);
        console.log(`Патенты РФ на промышленные образцы: ${values.industrialDesigns}`);
        console.log(`Сумма категорий: ${calculatedTotal}`);
        console.log(`Общее значение "Патент": ${values.total}`);

        console.log('=============================');
        console.log('');

        expect(calculatedTotal,
            [
                'Сумма категорий не совпадает с общим количеством.',
                `Изобретения: ${values.inventions}`,
                `Продукты: ${values.products}`,
                `Товарные знаки: ${values.trademarks}`,
                `Промышленные образцы: ${values.industrialDesigns}`,
                `Сумма: ${calculatedTotal}`,
                `Итого: ${values.total}`
            ].join('\n')
        ).toBe(values.total);
    }
}
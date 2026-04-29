import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { cashbackLocators } from '../locators/cashbackLocators';

export class CashbackPage extends BasePage {
    readonly createCashbackPromotionBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createCashbackPromotionBtn = page.getByRole('button', { name: cashbackLocators.buttonCreateCashbackPromotion });
    }

    /**
     * Clicks the Create Cashback Promotion button if visible on the Cashback Promotions page.
     */
    async clickCreateCashbackPromotion() {
        console.log('Clicking Create Cashback Promotion button...');
        if (await this.createCashbackPromotionBtn.count() > 0) {
            await this.clickElement(this.createCashbackPromotionBtn);
            await this.page.waitForTimeout(1000);
        }
    }
}

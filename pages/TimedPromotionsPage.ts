import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { timedPromotionsLocators } from '../locators/timedPromotionsLocators';

export class TimedPromotionsPage extends BasePage {
    readonly createTimedPromotionBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createTimedPromotionBtn = this.page.locator(timedPromotionsLocators.createTimedPromotionBtn);
    }

    async clickCreateTimedPromotion() {
        console.log('Clicking Create Timed Promotion button...');
        await this.clickElement(this.createTimedPromotionBtn);
    }
}

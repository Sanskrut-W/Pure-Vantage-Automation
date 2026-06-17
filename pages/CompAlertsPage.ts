import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compAlertsLocators } from '../locators/compAlertsLocators';

export class CompAlertsPage extends BasePage {
    readonly createAlertBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createAlertBtn = this.page.locator(compAlertsLocators.createAlertBtn);
    }

    async clickCreateAlert() {
        console.log('Clicking Create Alert button...');
        await this.clickElement(this.createAlertBtn);
    }
}

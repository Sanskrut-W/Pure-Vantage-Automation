import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { lapseCompLogsLocators } from '../locators/lapseCompLogsLocators';

export class LapseCompLogsPage extends BasePage {
    readonly compCodeValue: Locator;
    readonly viewCompBtn: Locator;
    readonly backButton: Locator;

    constructor(page: Page) {
        super(page);
        this.compCodeValue = this.page.locator(lapseCompLogsLocators.headerCompCodeValue).first();
        this.viewCompBtn = this.page.locator(lapseCompLogsLocators.viewCompBtn);
        this.backButton = this.page.locator(lapseCompLogsLocators.backButton);
    }

    async clickViewComp() {
        console.log('Clicking View Comp button...');
        await this.clickElement(this.viewCompBtn);
    }

    async clickBackButton() {
        console.log('Clicking Back button...');
        await this.clickElement(this.backButton);
    }
}

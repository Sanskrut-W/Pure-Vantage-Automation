import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compConfigLocators } from '../locators/compConfigLocators';

export class CompConfigPage extends BasePage {
    readonly payoutReportBtn: Locator;
    readonly createCompBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.payoutReportBtn = this.page.locator(compConfigLocators.payoutReportBtn);
        this.createCompBtn = this.page.locator(compConfigLocators.createCompBtn);
    }

    async clickPayoutReport() {
        console.log('Clicking Payout Report button...');
        await this.clickElement(this.payoutReportBtn);
    }

    async clickCreateComp() {
        console.log('Clicking Create Comp button...');
        await this.clickElement(this.createCompBtn);
    }
}

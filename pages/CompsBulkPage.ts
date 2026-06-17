import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compsBulkLocators } from '../locators/compsBulkLocators';

export class CompsBulkPage extends BasePage {
    readonly setupBulkCompBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.setupBulkCompBtn = this.page.locator(compsBulkLocators.setupBulkCompBtn);
    }

    async clickSetupBulkComp() {
        console.log('Clicking Setup Bulk Comp button...');
        await this.clickElement(this.setupBulkCompBtn);
    }
}

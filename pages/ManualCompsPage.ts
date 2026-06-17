import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { manualCompsLocators } from '../locators/manualCompsLocators';

export class ManualCompsPage extends BasePage {
    readonly createManualCompBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createManualCompBtn = this.page.locator(manualCompsLocators.createManualCompBtn);
    }

    async clickCreateManualComp() {
        console.log('Clicking Create Manual Comp button...');
        await this.clickElement(this.createManualCompBtn);
    }
}

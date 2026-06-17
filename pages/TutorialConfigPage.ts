import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { tutorialConfigLocators } from '../locators/tutorialConfigLocators';

export class TutorialConfigPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createConfigBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(tutorialConfigLocators.regionDropdown);
        this.createConfigBtn = this.page.locator(tutorialConfigLocators.createConfigBtn);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.selectDropdown(this.regionDropdown, regionName);
        await this.page.waitForLoadState('networkidle');
    }

    async clickCreateConfig() {
        console.log('Clicking Create Config button...');
        await this.clickElement(this.createConfigBtn);
    }
}

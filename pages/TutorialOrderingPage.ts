import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { tutorialOrderingLocators } from '../locators/tutorialOrderingLocators';

export class TutorialOrderingPage extends BasePage {
    readonly regionDropdown: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(tutorialOrderingLocators.regionDropdown);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.selectDropdown(this.regionDropdown, regionName);
    }
}

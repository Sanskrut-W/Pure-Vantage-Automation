import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { messageCTALocators } from '../locators/messageCTALocators';

export class MessageCTAPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createCTABtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(messageCTALocators.regionDropdown);
        this.createCTABtn = this.page.locator(messageCTALocators.createCTABtn);
    }

    async clickRegionDropdown() {
        console.log('Clicking Region Dropdown...');
        await this.clickElement(this.regionDropdown);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName}`);
        await this.clickRegionDropdown();
        await this.page.waitForTimeout(500); // allow dropdown to expand
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await optionLocator.scrollIntoViewIfNeeded();
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(500); // allow dropdown to close/register
    }

    async clickCreateCTA() {
        console.log('Clicking Create CTA button...');
        await this.clickElement(this.createCTABtn);
    }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { adminAccountsLocators } from '../locators/adminAccountsLocators';

export class AdminAccountsPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createAccountBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(adminAccountsLocators.regionDropdown);
        this.createAccountBtn = this.page.locator(adminAccountsLocators.createAccountBtn);
        this.deleteBtn = this.page.locator(adminAccountsLocators.deleteBtn).first();
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

    async clickCreateAccount() {
        console.log('Clicking Create Account button...');
        await this.clickElement(this.createAccountBtn);
    }

    async clickDelete() {
        console.log('Clicking Delete button...');
        await this.clickElement(this.deleteBtn);
    }
}

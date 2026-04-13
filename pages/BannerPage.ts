import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { bannerLocators } from '../locators/bannerLocators';

export class BannerPage extends BasePage {
    readonly createBannerBtn: Locator;
    readonly regionDropdown: Locator;
    readonly searchInput: Locator;

    constructor(page: Page) {
        super(page);
        
        // Initialize Locators per the user requirements
        this.createBannerBtn = page.locator(bannerLocators.buttonCreateBanner);
        this.regionDropdown = page.locator(bannerLocators.dropdownRegion);
        this.searchInput = page.locator(bannerLocators.inputSearch);
    }

    /**
     * Clicks the 'Create Banner' button.
     */
    async clickCreateBanner() {
        console.log('Clicking Create Banner button...');
        await this.clickElement(this.createBannerBtn);
    }

    /**
     * Uses the BasePage UI method to open a dropdown and select a specific region.
     */
    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.selectDropdown(this.regionDropdown, regionName);
    }

    /**
     * Types an expression into the Search input box to filter results.
     */
    async searchRegion(regionName: string) {
        console.log(`Searching for region: ${regionName}`);
        await this.fillInput(this.searchInput, regionName);
    }
}

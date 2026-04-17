import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { bannerLocators } from '../locators/bannerLocators';

export class BannerPage extends BasePage {
    readonly createBannerBtn: Locator;
    readonly regionDropdown: Locator;
    readonly bannerTypeDropdown: Locator;
    readonly searchInput: Locator;
    readonly bannerNameInput: Locator;
    readonly selectRegionsDropdown: Locator;
    readonly selectVerticalsDropdown: Locator;
    readonly selectPlatformsDropdown: Locator;
    readonly campaignDropdown: Locator;
    readonly selectBannerType: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly closeMultiselectBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize Locators using Playwright accessibility best-practices
        this.createBannerBtn = page.getByRole('button', { name: bannerLocators.buttonCreateBanner });
        this.regionDropdown = page.getByLabel(bannerLocators.dropdownRegion);
        this.bannerTypeDropdown = page.getByLabel(bannerLocators.dropdownBannerType);
        this.searchInput = page.getByPlaceholder(bannerLocators.inputSearch).nth(1);
        this.bannerNameInput = page.getByLabel(bannerLocators.inputBannerName);
        this.selectBannerType = page.getByLabel(bannerLocators.selectBannerType);
        this.selectRegionsDropdown = page.getByText(bannerLocators.selectRegionsDropdown);
        this.selectVerticalsDropdown = page.getByText(bannerLocators.selectVerticalsDropdown);
        this.selectPlatformsDropdown = page.getByText(bannerLocators.selectPlatformsDropdown);
        // Scope strictly to the visible span to avoid colliding with PrimeVue's hidden native <select> options
        this.campaignDropdown = page.locator('span.p-dropdown-label').getByText(bannerLocators.selectCampaignDropdown, { exact: true });
        this.startDateInput = page.locator(bannerLocators.inputStartDate);
        this.endDateInput = page.locator(bannerLocators.inputEndDate);

        // Scope the close button specifically to the multiselect panel to prevent closing wrong dialogs
        this.closeMultiselectBtn = page.locator('.p-multiselect-panel').getByRole('button', { name: bannerLocators.buttonCloseMultiselect });
    }


    async clickCreateBanner() {
        console.log('Clicking Create Banner button...');
        await this.clickElement(this.createBannerBtn);
        await this.page.waitForTimeout(5000);
        await this.page.waitForLoadState('domcontentloaded');
    }


    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.selectDropdown(this.regionDropdown, regionName);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async searchRegion(regionName: string) {
        console.log(`Searching for region: ${regionName}`);
        await this.fillInput(this.searchInput, regionName);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async fillBannerName(name: string) {
        console.log(`Filling Banner Name: ${name}`);
        await this.fillInput(this.bannerNameInput, name);
    }
    // async clickSelectBannerType(typeName: string) {
    //     console.log(`Selecting banner type: ${typeName}`);
    //     await this.selectDropdown(this.bannerTypeDropdown.first(), typeName);
    //     await this.page.waitForLoadState('domcontentloaded');
    // }

    async clickSelectBannerType() {
        await this.clickElement(this.selectBannerType);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectBanner(typeName: string) {
        await this.clickElement(this.page.getByRole('option', { name: typeName, exact: true }));
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectRegionFromDropdown(...regionNames: string[]) {
        console.log(`Selecting regions: ${regionNames.join(', ')}`);
        for (const regionName of regionNames) {
            const option = this.page.locator('.p-multiselect-items').getByRole('option', { name: regionName, exact: true });
            await this.clickElement(option);
        }
        await this.closeMultiselectDropdown();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectVerticalFromDropdown(...verticalNames: string[]) {
        console.log(`Selecting verticals: ${verticalNames.join(', ')}`);
        for (const verticalName of verticalNames) {
            const option = this.page.locator('.p-multiselect-items').getByRole('option', { name: verticalName, exact: true });
            await this.clickElement(option);
        }
        await this.closeMultiselectDropdown();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectPlatformFromDropdown(...platformNames: string[]) {
        console.log(`Selecting platforms: ${platformNames.join(', ')}`);
        for (const platformName of platformNames) {
            const option = this.page.locator('.p-multiselect-items').getByRole('option', { name: platformName, exact: true });
            await this.clickElement(option);
        }
        await this.closeMultiselectDropdown();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async setDateRange(startDate?: string, endDate?: string) {
        console.log(`Setting start and end dates via clicking the calendar UI due to blocked input...`);
        
        // Start Date popup
        await this.clickElement(this.startDateInput);
        
        // Wait for the specific start-date panel to exist (derived from aria-controls)
        const startPanel = this.page.locator('#banner-start-date_panel');
        await startPanel.waitFor({ state: 'visible' });
        
        // Click the 20th of the month 
        const day20 = startPanel.locator('table').getByText('20', { exact: true }).first();
        await this.clickElement(day20);
        await this.page.waitForTimeout(500);

        // End Date popup
        await this.clickElement(this.endDateInput);
        
        // Wait for specific end-date panel
        const endPanel = this.page.locator('#banner-end-date_panel');
        await endPanel.waitFor({ state: 'visible' });
        
        // Click the 28th of the month to guarantee it's after the 20th
        const day28 = endPanel.locator('table').getByText('28', { exact: true }).first();
        await this.clickElement(day28);
        await this.page.waitForTimeout(500);
    }

    async selectCampaign(campaignName: string) {
        console.log(`Selecting campaign: ${campaignName}`);
        await this.selectDropdown(this.campaignDropdown, campaignName);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickLoginStatus(status: 'Logged In' | 'Logged Out') {
        console.log(`Clicking login status checkbox: ${status}`);
        // We target the custom checkbox box element that sits right next to the status label
        const checkboxBox = this.page.locator(`div.d-flex:has(label:text-is("${status}")) .p-checkbox-box`);
        await this.clickElement(checkboxBox);
    }

    async closeMultiselectDropdown() {
        console.log('Closing the multiselect dropdown...');
        await this.clickElement(this.closeMultiselectBtn);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickSelectRegions() {
        console.log('Clicking Select Regions dropdown...');
        await this.clickElement(this.selectRegionsDropdown);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickSelectVerticals() {
        console.log('Clicking Select Verticals dropdown...');
        await this.clickElement(this.selectVerticalsDropdown);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickSelectPlatforms() {
        console.log('Clicking Select Platforms dropdown...');
        await this.clickElement(this.selectPlatformsDropdown);
        await this.page.waitForLoadState('domcontentloaded');
    }
}

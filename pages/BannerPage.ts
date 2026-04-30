import { Page, Locator, expect } from '@playwright/test';
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

    /////// Banner Ordering Page Locator Properties ///////
    readonly orderingSearchInput: Locator;
    readonly orderingRegionDropdown: Locator;
    readonly orderingChannelDropdown: Locator;
    readonly bannersTable: Locator;
    readonly loggedInTable: Locator;
    readonly loggedOutTable: Locator;

    constructor(page: Page) {
        super(page);

        /////// Banner Config Page Locators ///////
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

        /////// Banner Ordering Page Locators ///////
        this.orderingSearchInput = page.locator(bannerLocators.orderingSearchInput);
        this.orderingRegionDropdown = page.locator(bannerLocators.orderingRegionDropdown);
        this.orderingChannelDropdown = page.locator(bannerLocators.orderingChannelDropdown);
        this.bannersTable = page.locator(bannerLocators.orderingTableBanners);
        this.loggedInTable = page.locator(bannerLocators.orderingTableLoggedIn);
        this.loggedOutTable = page.locator(bannerLocators.orderingTableLoggedOut);
    }

    /////// Banner Config Page Methods ///////
    async clickCreateBanner() {
        console.log('Clicking Create Banner button...');
        await this.clickElement(this.createBannerBtn);
        await this.page.waitForTimeout(5000);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Clicks the Edit button on the first banner row in the data table.
     */
    async clickEditFirstBanner() {
        console.log('Clicking Edit on first banner row...');
        const editButton = this.page.locator('.p-datatable tbody tr').first().getByRole('button', { name: /edit/i });
        await editButton.waitFor({ state: 'visible' });
        await this.clickElement(editButton);
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
        console.log(`Setting start and end dates dynamically via strictly enabled UI calendar nodes...`);

        await this.clickElement(this.startDateInput);
        const startPanel = this.page.locator('#banner-start-date_panel');
        await startPanel.waitFor({ state: 'visible' });
        
        // Dynamically find the first currently ENABLED valid day in the active month 
        // We use span:not(.p-disabled) to dodge historical dates strictly enforced by PrimeVue
        const activeStartDay = startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeStartDay, { force: true });
        await this.page.waitForTimeout(500);
        
        await this.clickElement(this.endDateInput);
        const endPanel = this.page.locator('#banner-end-date_panel');
        await endPanel.waitFor({ state: 'visible' });
        
        // Finding the LAST valid enable day guarantees it will always geometrically succeed the start date
        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(500);
    }

    async selectCampaign(campaignName: string) {
        console.log(`Selecting campaign: ${campaignName}`);
        await this.selectDropdown(this.campaignDropdown, campaignName);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickLoginStatus(status: 'Logged In' | 'Logged Out') {
        console.log(`Clicking login status checkbox: ${status}`);
        const container = this.page.locator('div.d-flex.items-center').filter({ has: this.page.getByText(status, { exact: true }) });
        const checkboxInput = container.locator('input[type="checkbox"]');
        
        // Use our abstract click wrapper so it gets highlighted too, passing the {force} toggle down
        await this.clickElement(checkboxInput, { force: true });
        
        await this.page.waitForLoadState('domcontentloaded');
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

    async createBanner() {
        await this.selectRegion('Betway Ghana');
        await this.searchRegion('gh');
        await this.clickCreateBanner();
        await this.fillBannerName('Test Banner');
        await this.clickSelectBannerType();
        await this.selectBanner('Standard Banner');
        await this.clickSelectRegions();
        await this.selectRegionFromDropdown('Betway Ghana');
        await this.clickSelectVerticals();
        await this.selectVerticalFromDropdown('Casino', 'Esports');
        await this.clickSelectPlatforms();
        await this.selectPlatformFromDropdown('Android', 'IOS');
        await this.setDateRange('05/15/2024', '06/20/2024');
        await this.selectCampaign('RashmiTest');
        await this.clickLoginStatus('Logged In');
        await this.clickLoginStatus('Logged Out');
        await this.page.waitForTimeout(4000);
    }


    /////// Banner Ordering Page Methods ///////
    async searchOrdering(term: string) {
        console.log(`Searching in Banner Ordering: ${term}`);
        await this.fillInput(this.orderingSearchInput, term);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectOrderingRegion(region: string) {
        console.log(`Selecting region in Banner Ordering: ${region}`);
        await this.selectDropdown(this.orderingRegionDropdown, region);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async selectOrderingChannel(channel: string) {
        console.log(`Selecting channel in Banner Ordering: ${channel}`);
        await this.selectDropdown(this.orderingChannelDropdown, channel);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async getFirstActiveBanner(listType: 'LoggedIn' | 'LoggedOut'): Promise<string> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        // In the specific ordering lists, Name is at column index 2 (1-based nth child 3)
        return await table.locator('tbody tr').first().locator('td').nth(2).innerText();
    }

    async getFirstInactiveBanner(listType: 'LoggedIn' | 'LoggedOut'): Promise<string | null> {
        // Toggle index in the Banners table: 0=Name, 1=LoggedIn toggle, 2=LoggedOut toggle
        const offColIndex = listType === 'LoggedIn' ? 2 : 3; // 1-based child for CSS nth-child
        
        // Find any row where the specific input switch has aria-checked="false"
        const rowWithOffToggle = this.bannersTable.locator('tbody tr').filter({
            has: this.page.locator(`td:nth-child(${offColIndex}) .p-inputswitch[aria-checked="false"]`)
        }).first();
        
        if (await rowWithOffToggle.count() === 0) return null; // Edge case: all toggles are literally on
        return await rowWithOffToggle.locator('td').nth(0).innerText();
    }

    async isBannerInList(bannerName: string, listType: 'LoggedIn' | 'LoggedOut'): Promise<boolean> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        // Wait briefly for SPA rerender if it just triggered an animation
        await this.page.waitForTimeout(500); 
        const count = await table.locator('tbody tr', { hasText: bannerName }).count();
        return count > 0;
    }

    async setBannerToggleStatus(bannerName: string, type: 'LoggedIn' | 'LoggedOut', targetState: boolean) {
        // Find the specific row in the main Banners list
        const targetRow = this.bannersTable.locator('tbody tr', { hasText: bannerName }).first();
        const toggleColIndex = type === 'LoggedIn' ? 1 : 2;
        const toggleContainer = targetRow.locator('td').nth(toggleColIndex).locator('.p-inputswitch');
        
        const currentStateStr = await toggleContainer.getAttribute('aria-checked');
        const isCurrentlyON = currentStateStr === 'true';
        
        if (isCurrentlyON !== targetState) {
            console.log(`Toggling ${type} for banner '${bannerName}' to ${targetState}`);
            // Target the input directly and use force: true to pierce the pointer-events intercept layer
            await this.clickElement(toggleContainer.locator('input'), { force: true });
            // Implicit UI validation that it switched to prevent false positives and test flakes
            await expect(toggleContainer).toHaveAttribute('aria-checked', targetState.toString());
            await this.page.waitForTimeout(1000); // Allow list shift/api to stabilize
        } else {
            console.log(`Banner '${bannerName}' ${type} is already ${targetState}`);
        }
    }

    async getRowCount(listType: 'LoggedIn' | 'LoggedOut'): Promise<number> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        
        // Wait for SPA reactivity to dynamically render rows after picking the Region dropdown.
        // It catches errors gracefully if the API responds that the table is completely empty on the server.
        try {
            await table.locator('tbody tr').first().waitFor({ state: 'visible' });
        } catch (e) {
            console.log(`No rows populated in ${listType} list after 5 network seconds.`);
        }
        
        return await table.locator('tbody tr').count();
    }

    async getBannerNameAtRow(listType: 'LoggedIn' | 'LoggedOut', rowIndex: number): Promise<string> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        // The second strictly visible text column holds the Name (index 2 after the Handle and Order ID)
        return await table.locator('tbody tr').nth(rowIndex).locator('td').nth(2).innerText();
    }

    async dragRowToRow(listType: 'LoggedIn' | 'LoggedOut', fromIndex: number, toIndex: number) {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        
        const sourceRow = table.locator('tbody tr').nth(fromIndex);
        const targetRow = table.locator('tbody tr').nth(toIndex);
        
        console.log(`Dragging item from index ${fromIndex} to ${toIndex} in ${listType} list`);
        
        // PrimeVue Drag events can be notoriously restrictive internally regarding Pointer vs Mouse vs HTML5 events.
        // We inject the exact HTML5 DataTransfer event timeline straight into the DOM Engine to guarantee a swap.
        await this.page.evaluate(({ src, tgt, toIdx, fromIdx }) => {
            if (!src || !tgt) return;
            
            const dataTransfer = new DataTransfer();
            const tgtRect = tgt.getBoundingClientRect();
            
            // Aiming threshold based on downward or upward matrix traversal
            const dropYPos = toIdx > fromIdx ? (tgtRect.top + tgtRect.height * 0.9) : (tgtRect.top + tgtRect.height * 0.1);
            
            // Replicate the perfect browser drag cycle exactly how PrimeVue's v-on:drop expects it
            src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer }));
            
            tgt.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }));
            tgt.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, clientY: dropYPos, dataTransfer }));
            tgt.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, clientY: dropYPos, dataTransfer }));
            
            src.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer }));
            
        }, { 
            src: await sourceRow.elementHandle(), 
            tgt: await targetRow.elementHandle(),
            toIdx: toIndex,
            fromIdx: fromIndex
        });
        
        // Wait for PrimeVue to finish the array index swapping layout transitions
        await this.page.waitForTimeout(2000); 
    }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { notificationScheduleLocators } from '../locators/notificationScheduleLocators';

export class NotificationSchedulePage extends BasePage {
    readonly searchInput:               Locator;
    readonly communicationTypeDropdown: Locator;
    readonly regionDropdown:            Locator;
    readonly refreshBtn:                Locator;
    readonly dataTable:                 Locator;
    readonly paginatorBottom:           Locator;
    readonly pageButtons:               Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput               = page.locator(notificationScheduleLocators.searchInput);
        this.communicationTypeDropdown = page.locator(notificationScheduleLocators.communicationTypeDropdown);
        // Confirmed live (user-supplied outerHTML): no id/name was captured for this dropdown, only
        // its placeholder label ("Select a Region") — which stops matching once a region is actually
        // selected (the label text then shows the region name instead). Locating it by DOM position
        // instead — the next ".p-dropdown" immediately after Communication Type — keeps matching it
        // regardless of what's currently selected, which selectRegion() needs to re-pick a specific
        // region after a prior selection.
        this.regionDropdown = page.locator('xpath=//div[@id="communicationType"]/following::div[contains(concat(" ", normalize-space(@class), " "), " p-dropdown ")][1]');
        this.refreshBtn                = page.locator(notificationScheduleLocators.refreshBtn);
        this.dataTable                 = page.locator(notificationScheduleLocators.dataTable);
        this.paginatorBottom           = page.locator(notificationScheduleLocators.paginatorBottom);
        this.pageButtons               = page.locator(notificationScheduleLocators.pageButtons);
    }

    // Confirmed live (user): the schedule data never loads from Communication Type alone — Region
    // must ALSO be selected before the table populates. Selects whichever region renders first.
    async selectFirstRegion() {
        console.log('Selecting first available Region');
        await this.clickElement(this.regionDropdown);
        await this.page.waitForTimeout(500);
        const panel = this.page.locator('.p-dropdown-panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const firstOption = panel.locator('.p-dropdown-item').first();
        await firstOption.waitFor({ state: 'visible', timeout: 5000 });
        await firstOption.click();
        await this.page.waitForLoadState('networkidle');
    }

    // Selects a specific Region by name — e.g. to land on a deterministic, confirmed-available
    // dataset rather than whichever region selectFirstRegion()/selectFirstCommunicationType() would
    // auto-pick. Can be called again after a prior region selection to switch regions.
    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName}`);
        await this.clickElement(this.regionDropdown);
        await this.page.waitForTimeout(500);
        const panel = this.page.locator('.p-dropdown-panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const option = panel.locator('.p-dropdown-item', { hasText: regionName });
        await option.first().waitFor({ state: 'visible', timeout: 5000 });
        await option.first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async selectCommunicationType(typeName: string) {
        console.log(`Selecting Communication Type: ${typeName}`);
        await this.clickElement(this.communicationTypeDropdown);
        await this.page.waitForTimeout(500);
        const panel = this.page.locator('.p-dropdown-panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const option = this.page.locator('.p-dropdown-panel .p-dropdown-item', { hasText: typeName });
        await option.first().waitFor({ state: 'visible', timeout: 5000 });
        await option.first().click();
        await this.page.waitForLoadState('networkidle');
        // Confirmed live: selecting Communication Type alone never loads any rows — Region must
        // also be picked before the schedule data appears.
        await this.selectFirstRegion();
    }

    async selectFirstCommunicationType() {
        console.log('Selecting first available Communication Type');
        await this.clickElement(this.communicationTypeDropdown);
        await this.page.waitForTimeout(2000);
        const panel = this.page.locator('.p-dropdown-panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const firstOption = this.page.locator('.p-dropdown-panel .p-dropdown-item').first();
        await firstOption.waitFor({ state: 'visible', timeout: 5000 });
        await firstOption.click();
        await this.page.waitForLoadState('networkidle');
        // Confirmed live: selecting Communication Type alone never loads any rows — Region must
        // also be picked before the schedule data appears.
        await this.selectFirstRegion();
    }

    async searchFor(term: string) {
        await this.fillInput(this.searchInput, term);
        await this.page.waitForLoadState('networkidle');
    }

    async clearSearch() {
        await this.searchInput.clear();
        await this.page.waitForLoadState('networkidle');
    }

    async getRowCount(): Promise<number> {
        return await this.dataTable.locator('tbody tr:not(.p-datatable-emptymessage)').count();
    }

    // Schedule data loads noticeably after the communication type is selected —
    // wait for a real data row instead of sampling the (still empty) table.
    async waitForRows(timeoutMs = 30000): Promise<boolean> {
        const firstRow = this.dataTable.locator('tbody tr:not(.p-datatable-emptymessage)').first();
        try {
            await firstRow.waitFor({ state: 'visible', timeout: timeoutMs });
            return true;
        } catch {
            return false;
        }
    }

    async getSortableColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th.p-sortable-column .p-column-title').allInnerTexts();
        return titles.map(t => t.trim());
    }

    async getColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th .p-column-title').allInnerTexts();
        return titles.map(t => t.trim()).filter(t => t.length > 0);
    }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { notificationScheduleLocators } from '../locators/notificationScheduleLocators';

export class NotificationSchedulePage extends BasePage {
    readonly searchInput:               Locator;
    readonly communicationTypeDropdown: Locator;
    readonly refreshBtn:                Locator;
    readonly dataTable:                 Locator;
    readonly paginatorBottom:           Locator;
    readonly pageButtons:               Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput               = page.locator(notificationScheduleLocators.searchInput);
        this.communicationTypeDropdown = page.locator(notificationScheduleLocators.communicationTypeDropdown);
        this.refreshBtn                = page.locator(notificationScheduleLocators.refreshBtn);
        this.dataTable                 = page.locator(notificationScheduleLocators.dataTable);
        this.paginatorBottom           = page.locator(notificationScheduleLocators.paginatorBottom);
        this.pageButtons               = page.locator(notificationScheduleLocators.pageButtons);
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

    async getSortableColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th.p-sortable-column .p-column-title').allInnerTexts();
        return titles.map(t => t.trim());
    }

    async getColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th .p-column-title').allInnerTexts();
        return titles.map(t => t.trim()).filter(t => t.length > 0);
    }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { messageCategoriesLocators } from '../locators/messageCategoriesLocators';

export class MessageCategoriesPage extends BasePage {
    readonly searchInput:       Locator;
    readonly refreshBtn:        Locator;
    readonly createCategoryBtn: Locator;
    readonly dataTable:         Locator;
    readonly editBtn:           Locator;
    readonly deleteBtn:         Locator;
    readonly paginatorBottom:   Locator;
    readonly pageButtons:       Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput       = page.locator(messageCategoriesLocators.searchInput);
        this.refreshBtn        = page.locator(messageCategoriesLocators.refreshBtn);
        this.createCategoryBtn = page.locator(messageCategoriesLocators.createCategoryBtn);
        this.dataTable         = page.locator(messageCategoriesLocators.dataTable);
        this.editBtn           = page.locator(messageCategoriesLocators.editBtn);
        this.deleteBtn         = page.locator(messageCategoriesLocators.deleteBtn);
        this.paginatorBottom   = page.locator(messageCategoriesLocators.paginatorBottom);
        this.pageButtons       = page.locator(messageCategoriesLocators.pageButtons);
    }

    async waitForTableLoad() {
        await this.page.waitForLoadState('networkidle');
        try {
            await this.dataTable.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            console.log('waitForTableLoad: table may be empty');
        }
    }

    async searchFor(term: string) {
        console.log(`Searching for: ${term}`);
        await this.fillInput(this.searchInput, term);
        await this.page.waitForLoadState('networkidle');
    }

    async clearSearch() {
        await this.searchInput.clear();
        await this.page.waitForLoadState('networkidle');
    }

    async getRowCount(): Promise<number> {
        return await this.dataTable.locator('tbody tr').count();
    }

    async clickCreateCategory() {
        console.log('Clicking Create Category button...');
        await this.clickElement(this.createCategoryBtn);
        await this.page.waitForTimeout(500);
    }

    async clickEditFirst() {
        console.log('Clicking Edit on first row...');
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickDeleteFirst() {
        console.log('Clicking Delete on first row...');
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(500);
    }

    async confirmDelete() {
        console.log('Confirming delete...');
        const confirmBtn = this.page.locator(messageCategoriesLocators.confirmOkBtn).first();
        await this.clickElement(confirmBtn);
        await this.page.waitForLoadState('networkidle');
    }

    async closeDialogWithCancel() {
        const cancelBtn = this.page.locator(messageCategoriesLocators.dialogCancelBtn).first();
        if (await cancelBtn.isVisible()) {
            await this.clickElement(cancelBtn);
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

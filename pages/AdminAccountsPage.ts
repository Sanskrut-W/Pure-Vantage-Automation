import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { adminAccountsLocators } from '../locators/adminAccountsLocators';

export class AdminAccountsPage extends BasePage {
    readonly searchInput:      Locator;
    readonly regionDropdown:   Locator;
    readonly refreshBtn:       Locator;
    readonly createAccountBtn: Locator;
    readonly dataTable:        Locator;
    readonly deleteBtn:        Locator;
    readonly paginatorBottom:  Locator;
    readonly pageButtons:      Locator;
    readonly paginator:        Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput      = page.locator(adminAccountsLocators.searchInput);
        this.regionDropdown   = page.locator(adminAccountsLocators.regionDropdown);
        this.refreshBtn       = page.locator(adminAccountsLocators.refreshBtn);
        this.createAccountBtn = page.locator(adminAccountsLocators.createAccountBtn);
        this.dataTable        = page.locator(adminAccountsLocators.dataTable);
        this.deleteBtn        = page.locator(adminAccountsLocators.deleteBtn);
        this.paginatorBottom  = page.locator(adminAccountsLocators.paginatorBottom);
        this.pageButtons      = page.locator(adminAccountsLocators.pageButtons);
        this.paginator        = page.locator('.p-paginator-bottom');
    }

    async clickRegionDropdown() {
        console.log('Clicking Region dropdown...');
        await this.clickElement(this.regionDropdown);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName}`);
        await this.clickRegionDropdown();
        await this.page.waitForTimeout(500);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await optionLocator.scrollIntoViewIfNeeded();
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
        // Wait for table rows AND action buttons to fully render after region load
        try {
            await this.deleteBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            console.log(`selectRegion('${regionName}'): no Delete buttons visible — table may be empty`);
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

    async clickCreateAccount() {
        console.log('Clicking Create Account button...');
        await this.clickElement(this.createAccountBtn);
        await this.page.waitForTimeout(500);
    }

    async clickDeleteFirst() {
        console.log('Clicking Delete on first row...');
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(500);
    }

    async confirmDelete() {
        console.log('Confirming delete...');
        const confirmBtn = this.page.locator(adminAccountsLocators.confirmOkBtn).first();
        await this.clickElement(confirmBtn);
        await this.page.waitForLoadState('networkidle');
    }

    async isDialogVisible(): Promise<boolean> {
        return await this.page.locator(adminAccountsLocators.dialog).first().isVisible();
    }

    async closeDialogWithCancel() {
        const cancelBtn = this.page.locator(adminAccountsLocators.dialogCancelBtn).first();
        if (await cancelBtn.isVisible()) {
            await this.clickElement(cancelBtn);
        }
    }

    async clickPageNumber(pageNumber: number) {
        console.log(`Clicking page ${pageNumber}...`);
        const pageBtn = this.page.locator(`.p-paginator-bottom .p-paginator-page[aria-label="Page ${pageNumber}"]`);
        await this.clickElement(pageBtn);
        await this.page.waitForLoadState('networkidle');
    }

    async isSortableColumn(columnTitle: string): Promise<boolean> {
        const sortableCol = this.page.locator(`th.p-sortable-column .p-column-title`, { hasText: columnTitle });
        return await sortableCol.count() > 0;
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

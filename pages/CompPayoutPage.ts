import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compPayoutLocators } from '../locators/compPayoutLocators';

export class CompPayoutPage extends BasePage {
    readonly searchInput: Locator;
    readonly table: Locator;
    readonly compConfigCodeValue: Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput = this.page.locator(compPayoutLocators.searchInput);
        this.table = this.page.locator('table.p-datatable-table, .p-datatable').first();
        this.compConfigCodeValue = this.page.locator(compPayoutLocators.compConfigCodeValue).first();
    }

    async searchByAccountId(accountId: string) {
        console.log(`Searching Comp Payout Details for Account Id: ${accountId}`);
        await this.fillInput(this.searchInput, accountId);
        await this.page.waitForTimeout(800);
    }

    getRows(): Locator {
        return this.page.locator('table tbody tr, .p-datatable-tbody tr');
    }

    getRowByIndex(index: number = 0): Locator {
        return this.getRows().nth(index);
    }

    /**
     * Finds a column's index from the header row's text, rather than hardcoding it — resilient
     * if the app ever reorders columns.
     */
    private async getColumnIndex(columnName: string): Promise<number> {
        const headers = this.page.locator('thead th .p-column-title, .p-datatable-thead th .p-column-title');
        const count = await headers.count();
        for (let i = 0; i < count; i++) {
            const text = (await headers.nth(i).textContent())?.trim();
            if (text === columnName) return i;
        }
        throw new Error(`getColumnIndex: column "${columnName}" not found among ${count} headers.`);
    }

    async getRowCellValue(row: Locator, columnName: string): Promise<string> {
        const index = await this.getColumnIndex(columnName);
        return (await row.locator('td').nth(index).textContent())?.trim() ?? '';
    }

    async clickViewConfigOnRow(row: Locator) {
        console.log('Clicking View Config on Comp Payout row...');
        await this.clickElement(row.locator(compPayoutLocators.viewConfigBtn));
    }
}

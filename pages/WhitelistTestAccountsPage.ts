import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { whitelistTestAccountsLocators } from '../locators/whitelistTestAccountsLocators';

export interface WhitelistFormData {
    username?:  string;
    accountId?: string;
    mobile?:    string;
    email?:     string;
    region?:    string;
}

export class WhitelistTestAccountsPage extends BasePage {
    readonly searchInput:     Locator;
    readonly createBtn:       Locator;
    readonly dataTable:       Locator;
    readonly editBtn:         Locator;
    readonly deleteBtn:       Locator;
    readonly paginatorBottom: Locator;
    readonly pageButtons:     Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput     = page.locator(whitelistTestAccountsLocators.searchInput);
        this.createBtn       = page.locator(whitelistTestAccountsLocators.createBtn);
        this.dataTable       = page.locator(whitelistTestAccountsLocators.dataTable);
        this.editBtn         = page.locator(whitelistTestAccountsLocators.editBtn);
        this.deleteBtn       = page.locator(whitelistTestAccountsLocators.deleteBtn);
        this.paginatorBottom = page.locator(whitelistTestAccountsLocators.paginatorBottom);
        this.pageButtons     = page.locator(whitelistTestAccountsLocators.pageButtons);
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

    async waitForTableLoad() {
        await this.editBtn.first().waitFor({ state: 'visible', timeout: 15000 });
    }

    async openCreateDialog() {
        await this.clickElement(this.createBtn);
        await this.page.locator(whitelistTestAccountsLocators.dialog).first()
            .waitFor({ state: 'visible', timeout: 10000 });
        await this.page.waitForTimeout(300);
    }

    dialogField(label: string): Locator {
        return this.page.locator('div.p-dialog').getByLabel(label);
    }

    async fillForm(opts: WhitelistFormData) {
        const dialog = this.page.locator('div.p-dialog');
        if (opts.username  !== undefined) await dialog.getByLabel('Username').fill(opts.username);
        if (opts.accountId !== undefined) await dialog.getByLabel('Account Id').fill(opts.accountId);
        if (opts.mobile    !== undefined) await dialog.getByLabel('Mobile Number').fill(opts.mobile);
        if (opts.email     !== undefined) await dialog.getByLabel('Email Address').fill(opts.email);
        if (opts.region    !== undefined) {
            await dialog.locator('.p-dropdown').first().click();
            await this.page.waitForTimeout(300);
            const item = this.page.locator('.p-dropdown-panel .p-dropdown-item', { hasText: opts.region }).first();
            await item.waitFor({ state: 'visible', timeout: 5000 });
            await item.click();
        }
    }

    async clickSave() {
        const saveBtn = this.page.locator(whitelistTestAccountsLocators.dialogSaveBtn).first();
        await saveBtn.click();
        await this.page.waitForTimeout(500);
    }

    async closeDialogWithCancel() {
        const cancelBtn = this.page.locator(whitelistTestAccountsLocators.dialogCancelBtn).first();
        if (await cancelBtn.isVisible()) {
            await this.clickElement(cancelBtn);
            await this.page.waitForTimeout(300);
        }
    }

    async clickEditFirst() {
        await this.editBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickDeleteFirst() {
        await this.deleteBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(500);
    }

    async isDialogOpen(): Promise<boolean> {
        return await this.page.locator(whitelistTestAccountsLocators.dialog).first().isVisible();
    }

    async isValidationErrorVisible(): Promise<boolean> {
        return await this.page.locator(whitelistTestAccountsLocators.validationError).first().isVisible()
            .catch(() => false);
    }

    async isSaveButtonDisabled(): Promise<boolean> {
        const saveBtn = this.page.locator(whitelistTestAccountsLocators.dialogSaveBtn).first();
        return await saveBtn.isDisabled().catch(() => false);
    }

    async getColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th .p-column-title').allInnerTexts();
        return titles.map(t => t.trim()).filter(t => t.length > 0);
    }
}

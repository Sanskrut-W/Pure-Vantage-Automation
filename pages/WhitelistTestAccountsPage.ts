import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { whitelistTestAccountsLocators } from '../locators/whitelistTestAccountsLocators';
import { CommonUtils } from '../utils/commonUtils';

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

        // Region is mandatory — select an option unless the caller explicitly opts out
        // (pass region: '' to leave it unset, e.g. for a region-mandatory validation test).
        if (opts.region !== '') {
            await dialog.locator('.p-dropdown').first().click();
            await this.page.waitForTimeout(300);
            const panel = this.page.locator('.p-dropdown-panel .p-dropdown-item');
            const item = opts.region ? panel.filter({ hasText: opts.region }).first() : panel.first();
            await item.waitFor({ state: 'visible', timeout: 5000 });
            await item.click();
        }
    }

    async clickSave() {
        const saveBtn = this.page.locator(whitelistTestAccountsLocators.dialogSaveBtn).first();
        // Give Save a real window to become enabled after the fields were just filled
        // (the app's validation/change-detection can lag a beat behind fill()) — but don't
        // block for the full default action timeout when it's genuinely, permanently disabled
        // (the expected outcome for a negative test); the caller's own isSaveButtonDisabled()
        // check picks that up.
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async closeDialogWithCancel() {
        const cancelBtn = this.page.locator(whitelistTestAccountsLocators.dialogCancelBtn).first();
        if (await cancelBtn.isVisible().catch(() => false)) {
            await this.clickElement(cancelBtn);
            await this.page.waitForTimeout(300);
        }
    }

    async clickEditFirst() {
        await this.editBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(500);
    }

    /**
     * Creates a fresh, uniquely identifiable account so edit/delete tests never have
     * to touch pre-existing real data — they can search for and act on this one instead.
     */
    async createTestAccount(prefix: string, overrides: Partial<WhitelistFormData> = {}) {
        const username  = overrides.username  ?? `${prefix}-${Date.now()}`;
        const accountId = overrides.accountId ?? CommonUtils.generateUUID();
        const mobile    = overrides.mobile    ?? `277${Math.floor(1000000 + Math.random() * 8999999)}`;
        const email     = overrides.email     ?? `${username}@test.com`;

        await this.openCreateDialog();
        await this.fillForm({ username, accountId, mobile, email, region: overrides.region });
        await this.clickSave();
        await this.page.waitForLoadState('networkidle');

        return { username, accountId, mobile, email };
    }

    /** Searches for a specific (test-created) account by username and opens its Edit dialog. */
    async openEditFor(username: string) {
        await this.searchFor(username);
        await this.clickEditFirst();
    }

    async clickDeleteFirst() {
        await this.deleteBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(500);
    }

    async isDialogOpen(): Promise<boolean> {
        return await this.page.locator(whitelistTestAccountsLocators.dialog).first().isVisible();
    }

    /**
     * A negative test case passes if ANY of these signals shows up:
     *  1. The standard PrimeNG .p-error / .p-invalid classes
     *  2. A toast message (success/error banner)
     *  3. Any floating message under a field rendered in red — covers apps that style
     *     validation text with an inline/custom color instead of the standard classes
     */
    async isValidationErrorVisible(): Promise<boolean> {
        const classBased = await this.page.locator(whitelistTestAccountsLocators.validationError).first()
            .isVisible().catch(() => false);
        if (classBased) return true;

        const toastVisible = await this.page.locator('.p-toast-message-text, .p-toast-message').first()
            .isVisible().catch(() => false);
        if (toastVisible) return true;

        return await this.hasRedFloatingMessage();
    }

    /** Scans the open dialog for any visible text rendered in a red/error color. */
    async hasRedFloatingMessage(): Promise<boolean> {
        return await this.page.evaluate(() => {
            const dialog = document.querySelector('div.p-dialog');
            if (!dialog) return false;

            const isRed = (color: string): boolean => {
                const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (!match) return false;
                const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
                return r > 120 && r - g > 40 && r - b > 40;
            };

            const candidates = Array.from(dialog.querySelectorAll('small, span, div, p'));
            return candidates.some(el => {
                const text = el.textContent?.trim();
                if (!text) return false;
                return isRed(window.getComputedStyle(el as HTMLElement).color);
            });
        }).catch(() => false);
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

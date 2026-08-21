import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { optinExpiryLocators } from '../locators/optinExpiryLocators';
import { CommonUtils } from '../utils/commonUtils';

export class OptinExpiryPage extends BasePage {
    readonly createBtn: Locator;
    readonly searchInput: Locator;
    // Scoped to <main> — an SPA can keep other routed components' tables in the DOM (hidden, not
    // removed), so an unscoped page-wide `table` locator risks matching the wrong one.
    readonly optInTable: Locator;

    // Create/Edit Opt-In popup
    readonly popupDialog: Locator;
    readonly nameInput: Locator;
    readonly descriptionInput: Locator;
    readonly expiryTypeDropdown: Locator;
    readonly expiryDayOfWeekDropdown: Locator;
    readonly expiryDateTimeInput: Locator;
    readonly isActiveCheckbox: Locator;
    readonly isInternalOnlyCheckbox: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Delete confirmation dialog (PrimeNG ConfirmDialog)
    readonly confirmDialogAccept: Locator;
    readonly confirmDialogReject: Locator;

    constructor(page: Page) {
        super(page);
        this.createBtn = page.locator(optinExpiryLocators.createBtn);
        this.searchInput = page.locator(optinExpiryLocators.searchInput);
        this.optInTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.nameInput = page.locator(optinExpiryLocators.inputName);
        this.descriptionInput = page.locator(optinExpiryLocators.inputDescription);
        this.expiryTypeDropdown = page.locator(optinExpiryLocators.dropdownExpiryType);
        this.expiryDayOfWeekDropdown = page.locator(optinExpiryLocators.dropdownExpiryDayOfWeek);
        this.expiryDateTimeInput = page.locator(optinExpiryLocators.calendarExpiryDateTime);
        this.isActiveCheckbox = page.locator(optinExpiryLocators.checkboxIsActive);
        this.isInternalOnlyCheckbox = page.locator(optinExpiryLocators.checkboxIsInternalOnly);
        this.saveBtn = page.getByRole('button', { name: optinExpiryLocators.buttonSave, exact: true });
        this.cancelBtn = page.getByRole('button', { name: optinExpiryLocators.buttonCancel, exact: true });

        this.confirmDialogAccept = page.locator(optinExpiryLocators.confirmDialogAccept);
        this.confirmDialogReject = page.locator(optinExpiryLocators.confirmDialogReject);
    }

    async clickCreateOptIn() {
        console.log('Clicking Create Opt-In button...');
        await this.clickElement(this.createBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    // ─── Text fields ────────────────────────────────────────────────────────────

    async fillName(value: string) {
        console.log(`Filling Name: "${value}"...`);
        await this.fillInput(this.nameInput, value);
    }

    async fillDescription(value: string) {
        console.log(`Filling Description: "${value}"...`);
        await this.fillInput(this.descriptionInput, value);
    }

    // ─── Generic PrimeNG dropdown helpers (Expiry Type / Expiry Day of the Week) ──

    private async openDropdown(dropdownLocator: Locator): Promise<Locator> {
        await this.clickElement(dropdownLocator);
        let panel = this.page.locator('.p-dropdown-panel').last();
        if (!(await panel.isVisible().catch(() => false))) {
            await this.page.waitForTimeout(300);
            await dropdownLocator.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
            panel = this.page.locator('.p-dropdown-panel').last();
        }
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        return panel;
    }

    /** Expiry Type is a small, fixed 4-item enum (End of Day, End of Week, End of Month, Date
     * Time) — reuses BasePage's generic dropdown handling, which types into the panel's own
     * filter box if one is rendered, or falls back to a direct option match otherwise. */
    async selectExpiryType(type: 'End of Day' | 'End of Week' | 'End of Month' | 'Date Time') {
        console.log(`Selecting Expiry Type "${type}"...`);
        await this.selectDropdown(this.expiryTypeDropdown, type);
        await this.page.waitForTimeout(300);
    }

    async getExpiryTypeValue(): Promise<string> {
        return (await this.expiryTypeDropdown.locator('.p-dropdown-label').innerText()).trim();
    }

    /** Selects whichever day renders first in the Expiry Day of the Week dropdown — not safe to
     * hardcode a specific day's exact label/casing without confirmed live HTML. Returns the
     * selected option's text. */
    async selectFirstExpiryDayOfWeek(): Promise<string> {
        console.log('Selecting first available Expiry Day of the Week...');
        const panel = await this.openDropdown(this.expiryDayOfWeekDropdown);
        const option = panel.locator(optinExpiryLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    async getExpiryDayOfWeekValue(): Promise<string> {
        return (await this.expiryDayOfWeekDropdown.locator('.p-dropdown-label').innerText()).trim();
    }

    // ─── Expiry Date (Date Time trigger only) ──────────────────────────────────

    /**
     * Opens the Expiry Date calendar, picks the first enabled day in the current view, nudges the
     * time forward by one hour and one minute via the panel's own "Next Hour"/"Next Minute"
     * arrows (confirmed live pattern: this calendar includes a time picker, same as Auto Opt-In's
     * Start/End Date), then closes the panel via Escape. Deliberately uses Escape rather than
     * clicking some other field to dismiss it — confirmed elsewhere in this suite (Auto Opt-In)
     * that a showTime-enabled calendar is its own aria-modal dialog, so Escape correctly targets
     * it as the innermost focused modal instead of risking a stray click landing on the wrong
     * field or bubbling up to close the whole popup.
     */
    async setExpiryDateTime() {
        console.log('Selecting Expiry Date...');
        await this.expiryDateTimeInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#expiryDateTime_panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);

        const nextHour = panel.getByRole('button', { name: 'Next Hour' });
        if (await nextHour.isVisible().catch(() => false)) {
            await nextHour.click();
            await this.page.waitForTimeout(200);
        }
        const nextMinute = panel.getByRole('button', { name: 'Next Minute' });
        if (await nextMinute.isVisible().catch(() => false)) {
            await nextMinute.click();
            await this.page.waitForTimeout(200);
        }

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async getExpiryDateTimeValue(): Promise<string> {
        return (await this.expiryDateTimeInput.inputValue()).trim();
    }

    // ─── Checkboxes ─────────────────────────────────────────────────────────────

    /**
     * Clicks the checkbox's own `.p-checkbox-box` rather than its `<label>` — this label has no
     * `for` attribute at all (confirmed in the live HTML), so it has no native forwarding target
     * and clicking it is a no-op. PrimeVue's Checkbox renders a visually-hidden native `<input>`
     * directly on top of the visible box, which fails Playwright's "receives events" actionability
     * check — force bypasses that hit-test, safe here since the box is genuinely visible.
     */
    async toggleIsActive() {
        console.log('Toggling "Is Active"...');
        const checkboxBox = this.isActiveCheckbox.locator('.p-checkbox-box');
        await CommonUtils.highlightElement(checkboxBox);
        await checkboxBox.click({ force: true });
    }

    async isActiveChecked(): Promise<boolean> {
        return (await this.isActiveCheckbox.getAttribute('data-p-highlight')) === 'true';
    }

    async toggleIsInternalOnly() {
        console.log('Toggling "Is Internal Only"...');
        const checkboxBox = this.isInternalOnlyCheckbox.locator('.p-checkbox-box');
        await CommonUtils.highlightElement(checkboxBox);
        await checkboxBox.click({ force: true });
    }

    async isInternalOnlyChecked(): Promise<boolean> {
        return (await this.isInternalOnlyCheckbox.getAttribute('data-p-highlight')) === 'true';
    }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save on Create/Edit Opt-In popup...');
        await this.clickElement(this.saveBtn);
    }

    async clickCancel() {
        console.log('Clicking Cancel on Create/Edit Opt-In popup...');
        await this.clickElement(this.cancelBtn);
    }

    // ─── Search / table ─────────────────────────────────────────────────────────

    async searchOptIn(name: string) {
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(1000);
    }

    getRowByName(name: string): Locator {
        return this.optInTable.locator('tbody tr', { hasText: name }).first();
    }

    async isOptInVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchOptIn(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /** Actively waits for a deleted row to become hidden/detached rather than passively polling
     * "is it visible" for false — right after confirming a delete, the row can still briefly be
     * present while the backend delete + list refresh are in flight. */
    async isOptInAbsentByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchOptIn(name);
        const row = this.getRowByName(name);
        return await row.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    /** Waits for the table's real data rows (excluding the "No Data Found"/empty-state
     * placeholder row PrimeNG renders as a genuine <tr>) to settle before counting. */
    async getRowCount(): Promise<number> {
        const dataRows = this.optInTable.locator('tbody tr:not(.p-datatable-emptymessage)');
        try {
            await dataRows.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            return 0;
        }
        const deadline = Date.now() + 15000;
        let previousCount = -1;
        while (Date.now() < deadline) {
            const currentCount = await dataRows.count();
            if (currentCount === previousCount) return currentCount;
            previousCount = currentCount;
            await this.page.waitForTimeout(300);
        }
        return previousCount;
    }

    async clickEditForOptIn(name: string) {
        console.log(`Clicking Edit for Opt-In "${name}"...`);
        await this.searchOptIn(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: optinExpiryLocators.buttonEdit, exact: true }));
    }

    async clickDeleteForOptIn(name: string) {
        console.log(`Clicking Delete for Opt-In "${name}"...`);
        await this.searchOptIn(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: optinExpiryLocators.buttonDelete, exact: true }));
    }

    async clickConfirmYes() {
        console.log('Clicking Yes on the delete confirmation dialog...');
        await this.clickElement(this.confirmDialogAccept);
    }

    /** Deletes an Opt-In by name and waits for it to actually disappear. Swallows errors so it's
     * safe to call unconditionally from afterEach, even if the record was never created (e.g. the
     * test failed before Save) or was already removed. */
    async deleteOptInIfPresent(name: string) {
        try {
            await this.clickDeleteForOptIn(name);
            await this.confirmDialogAccept.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.isOptInAbsentByName(name, 15000);
        } catch (error) {
            console.log(`Delete cleanup skipped for "${name}" (likely never created): ${error}`);
        }
    }
}

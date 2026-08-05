import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { lapseCompLocators } from '../locators/lapseCompLocators';
import { CommonUtils } from '../utils/commonUtils';

export class LapseCompPage extends BasePage {
    readonly searchByCompIdInput: Locator;
    readonly searchByCompCodeInput: Locator;
    readonly searchByDescriptionInput: Locator;
    readonly table: Locator;

    readonly createConfigurationBtn: Locator;
    readonly dialog: Locator;
    readonly descriptionInput: Locator;
    readonly compCodeDropdown: Locator;
    readonly everyDayAtTimeInput: Locator;
    readonly endDateInput: Locator;
    readonly notifyEmailCsvInput: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.searchByCompIdInput = this.page.locator(lapseCompLocators.searchByCompId);
        this.searchByCompCodeInput = this.page.locator(lapseCompLocators.searchByCompCode);
        this.searchByDescriptionInput = this.page.locator(lapseCompLocators.searchByDescription);
        this.table = this.page.locator('table.p-datatable-table, .p-datatable').first();

        this.createConfigurationBtn = this.page.locator(lapseCompLocators.createConfigurationBtn);
        this.dialog = this.page.locator(lapseCompLocators.dialog).first();
        this.descriptionInput = this.page.locator(lapseCompLocators.fieldDescription);
        this.compCodeDropdown = this.page.locator(lapseCompLocators.fieldCompCode);
        this.everyDayAtTimeInput = this.page.locator(lapseCompLocators.fieldEveryDayAtTime);
        this.endDateInput = this.page.locator(lapseCompLocators.fieldEndDate);
        this.notifyEmailCsvInput = this.page.locator(lapseCompLocators.fieldNotifyEmailCsv);
        this.saveBtn = this.dialog.getByRole('button', { name: 'Save', exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
        this.toastMessage = this.page.locator(lapseCompLocators.toastMessage).first();
    }

    async searchByCompId(value: string) {
        console.log(`Searching Lapse Comp Management by #ID: ${value}`);
        await this.fillInput(this.searchByCompIdInput, value);
        await this.page.waitForTimeout(800);
    }

    async searchByCompCode(value: string) {
        console.log(`Searching Lapse Comp Management by Comp Code: ${value}`);
        await this.fillInput(this.searchByCompCodeInput, value);
        await this.page.waitForTimeout(800);
    }

    async searchByDescription(value: string) {
        console.log(`Searching Lapse Comp Management by Description: ${value}`);
        await this.fillInput(this.searchByDescriptionInput, value);
        await this.page.waitForTimeout(800);
    }

    getRows(): Locator {
        return this.page.locator('table tbody tr, .p-datatable-tbody tr');
    }

    getRowByIndex(index: number = 0): Locator {
        return this.getRows().nth(index);
    }

    /**
     * Opens the given row's kebab ("⋮") menu and clicks Edit — searches by Description first
     * to isolate the exact row (Description is unique per Configuration), so this only ever
     * acts on the specific row identified, never an arbitrary one at index 0.
     */
    async clickEditOnRow(description: string): Promise<void> {
        console.log(`Clicking Edit on Lapse Comp row: "${description}"...`);
        await this.searchByDescription(description);
        const row = this.getRowByIndex(0);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const editItem = this.page.locator(lapseCompLocators.editMenuItem);
        await editItem.waitFor({ state: 'visible', timeout: 5000 });
        await editItem.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Opens the given row's kebab ("⋮") menu and clicks Regions — same row-isolation approach
     * as clickEditOnRow (search by Description first).
     */
    async clickRegionsOnRow(description: string): Promise<void> {
        console.log(`Clicking Regions on Lapse Comp row: "${description}"...`);
        await this.searchByDescription(description);
        const row = this.getRowByIndex(0);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const regionsItem = this.page.locator(lapseCompLocators.regionsMenuItem);
        await regionsItem.waitFor({ state: 'visible', timeout: 5000 });
        await regionsItem.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Opens the given row's kebab ("⋮") menu and clicks Logs. Unlike clickEditOnRow/
     * clickRegionsOnRow, this takes the row Locator directly rather than searching by
     * Description — Logs is a read-only navigation, so it operates on whatever row is already
     * displayed (e.g. getRowByIndex(0)) instead of requiring a fresh disposable Configuration.
     */
    async clickLogsOnRow(row: Locator): Promise<void> {
        console.log('Clicking Logs on Lapse Comp row...');
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const logsItem = this.page.locator(lapseCompLocators.logsMenuItem);
        await logsItem.waitFor({ state: 'visible', timeout: 5000 });
        await logsItem.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Opens the given row's kebab ("⋮") menu and clicks Comps — navigates straight to the Comp
     * Configuration page (no intermediate Logs page). Same "operate on whatever row is already
     * displayed" approach as clickLogsOnRow, since this is a read-only navigation too.
     */
    async clickCompsOnRow(row: Locator): Promise<void> {
        console.log('Clicking Comps on Lapse Comp row...');
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const compsItem = this.page.locator(lapseCompLocators.compsMenuItem);
        await compsItem.waitFor({ state: 'visible', timeout: 5000 });
        await compsItem.click();
        await this.page.waitForTimeout(500);
    }

    /**
     * Opens the given row's kebab ("⋮") menu and clicks Approve. Approve can only be performed
     * once per comp, so callers must act on a fresh disposable Configuration each time, never a
     * shared/reused row.
     */
    async clickApproveOnRow(row: Locator): Promise<void> {
        console.log('Clicking Approve on Lapse Comp row...');
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const approveItem = this.page.locator(lapseCompLocators.approveMenuItem);
        await approveItem.waitFor({ state: 'visible', timeout: 5000 });
        await approveItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given row's kebab ("⋮") menu and clicks Mark For Processing. */
    async clickMarkForProcessingOnRow(row: Locator): Promise<void> {
        console.log('Clicking Mark For Processing on Lapse Comp row...');
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const markItem = this.page.locator(lapseCompLocators.markForProcessingMenuItem);
        await markItem.waitFor({ state: 'visible', timeout: 5000 });
        await markItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given row's kebab ("⋮") menu and clicks Delete. */
    async clickDeleteOnRow(row: Locator): Promise<void> {
        console.log('Clicking Delete on Lapse Comp row...');
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = row.locator(lapseCompLocators.rowMenuTrigger);
        await this.clickElement(menuTrigger);

        const deleteItem = this.page.locator(lapseCompLocators.deleteMenuItem);
        await deleteItem.waitFor({ state: 'visible', timeout: 5000 });
        await deleteItem.click();
        await this.page.waitForTimeout(500);
    }

    // Generic Yes/No confirmation — the same "modal-buttons-container" pattern shared by
    // Approve, Mark For Processing and Delete (and elsewhere in this suite, e.g. CompsBulkPage).
    async clickYesOnConfirmDialog() {
        console.log('Clicking Yes on confirmation dialog...');
        const yesBtn = this.page.getByRole('button', { name: 'Yes', exact: true });
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnConfirmDialog() {
        console.log('Clicking No on confirmation dialog...');
        const noBtn = this.page.getByRole('button', { name: 'No', exact: true });
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
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

    async clickCreateConfiguration() {
        console.log('Clicking Create Configuration button...');
        await this.clickElement(this.createConfigurationBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.dialog.waitFor({ state: 'visible' });
        await this.dialog.locator('.p-skeleton').first().waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {});
    }

    async fillDescription(value: string) {
        console.log(`Filling Description: "${value}"...`);
        await this.fillInput(this.descriptionInput, value);
    }

    /**
     * Opens the Comp Code dropdown and clicks whichever option renders first, returning its
     * text — mirrors the identical "first available option" pattern already used across this
     * suite (e.g. CompBulkConfigurationsPage.selectDropdownOption).
     */
    async selectFirstAvailableCompCode(): Promise<string> {
        console.log('Selecting first available Comp Code...');
        await this.clickElement(this.compCodeDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await this.compCodeDropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }

        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    /**
     * Opens the "Every Day At: (GMT+2)" time-only picker and adjusts the hour/minute via its
     * increment arrows (confirmed live — this field is set by clicking arrows, not typing).
     * Dismissed by clicking the End Date field next, which both closes this panel and is the
     * natural next step in the form.
     */
    async setEveryDayAtTime(hourClicks: number = 1, minuteClicks: number = 1) {
        console.log(`Setting Every Day At time (+${hourClicks}h, +${minuteClicks}m from default)...`);
        await this.clickElement(this.everyDayAtTimeInput);
        const panel = this.page.locator('[id="atXTime_panel"]');
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        const nextHourBtn = panel.locator(lapseCompLocators.timePickerNextHour);
        const nextMinuteBtn = panel.locator(lapseCompLocators.timePickerNextMinute);
        for (let i = 0; i < hourClicks; i++) {
            await nextHourBtn.click();
        }
        for (let i = 0; i < minuteClicks; i++) {
            await nextMinuteBtn.click();
        }

        // Click the End Date field to close this panel — same "click the next field to
        // dismiss" pattern the user confirmed for End Date -> Notify Email Csv below.
        await this.endDateInput.click();
        await this.page.waitForTimeout(300);
    }

    /**
     * Opens the End Date calendar and picks the first enabled day, then clicks Notify Email
     * Csv to close the calendar — the specific dismiss method confirmed by the user for this
     * field (rather than Escape, used elsewhere in this suite).
     */
    async fillEndDate() {
        console.log('Selecting End Date...');
        const panel = this.page.locator('[id="endDate_panel"]');
        const alreadyOpen = await panel.waitFor({ state: 'visible', timeout: 2000 }).then(() => true).catch(() => false);
        if (!alreadyOpen) {
            await this.clickElement(this.endDateInput);
            await panel.waitFor({ state: 'visible', timeout: 10000 });
        }

        const activeDay = panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeDay, { force: true });

        await this.notifyEmailCsvInput.click();
        await this.page.waitForTimeout(300);
    }

    async fillNotifyEmailCsv(value: string) {
        console.log(`Filling Notify Email Csv: "${value}"...`);
        await this.fillInput(this.notifyEmailCsvInput, value);
    }

    /**
     * Fills the 2 mandatory fields (Description, Comp Code) with valid data, returning the
     * Description used. Individual tests skip whichever field they're deliberately leaving
     * blank/invalid.
     */
    async fillMandatoryFields(overrides?: {
        description?: string;
        skip?: Array<'description' | 'compCode'>;
    }): Promise<string> {
        const skip = overrides?.skip ?? [];
        const description = overrides?.description ?? `AutoLapseComp_${CommonUtils.generateRandomString(6)}`;
        if (!skip.includes('description')) {
            await this.fillDescription(description);
        }
        if (!skip.includes('compCode')) {
            await this.selectFirstAvailableCompCode();
        }
        return description;
    }

    async clickSave() {
        console.log('Clicking Save button...');
        await this.clickElement(this.saveBtn);
    }

    /** Clicks Save and waits (bounded) for the dialog to actually close, instead of assuming
     * success — the same verify-don't-trust pattern already proven throughout this suite. */
    async clickSaveAndVerify(timeout: number = 20000): Promise<boolean> {
        await this.clickSave();
        return await this.dialog.waitFor({ state: 'hidden', timeout }).then(() => true).catch(() => false);
    }

    async clickCancel() {
        console.log('Clicking Cancel button...');
        await this.clickElement(this.cancelBtn);
    }

    async isSaveEnabled(): Promise<boolean> {
        return !(await this.saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')));
    }

    async getToastText(timeout: number = 15000): Promise<string> {
        const appeared = await this.toastMessage.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await this.toastMessage.textContent())?.trim() ?? '';
    }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compAlertsLocators } from '../locators/compAlertsLocators';
import { CommonUtils } from '../utils/commonUtils';

export class CompAlertsPage extends BasePage {
    readonly createAlertBtn: Locator;
    readonly alertsTable: Locator;

    constructor(page: Page) {
        super(page);
        this.createAlertBtn = this.page.locator(compAlertsLocators.createAlertBtn);
        this.alertsTable = this.page.locator('.p-datatable');
    }

    async clickCreateAlert() {
        console.log('Clicking Create Alert button...');
        await this.clickElement(this.createAlertBtn);
        await this.page.waitForTimeout(500);
    }

    /**
     * Finds the table row containing the given alert name and clicks its Edit
     * button — used instead of "first row" so edit tests only ever touch an
     * alert this automation itself created, never a pre-existing/original one.
     */
    async clickEditByName(alertName: string) {
        console.log(`Clicking Edit on alert row: "${alertName}"...`);
        const row = this.alertsTable.locator('tbody tr', { hasText: alertName }).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const editBtn = row.getByRole('button', { name: 'Edit', exact: true });
        await this.clickElement(editBtn);
        await this.page.waitForTimeout(500);
    }

    /**
     * Finds the table row containing the given alert name and clicks its
     * Delete button — used instead of "first row" so delete tests only ever
     * touch an alert this automation itself created, never a pre-existing/
     * original one.
     */
    async clickDeleteByName(alertName: string) {
        console.log(`Clicking Delete on alert row: "${alertName}"...`);
        const row = this.alertsTable.locator('tbody tr', { hasText: alertName }).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
        await this.clickElement(deleteBtn);
        await this.page.waitForTimeout(500);
    }

    // Delete confirmation is the same custom modal ("modal-buttons-container")
    // used for comp deletion — Yes/No matched by aria-label directly.
    async clickYesOnDeleteAlertDialog() {
        console.log('Clicking Yes on delete alert confirmation...');
        const yesBtn = this.page.getByRole('button', { name: 'Yes', exact: true });
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnDeleteAlertDialog() {
        console.log('Clicking No on delete alert confirmation...');
        const noBtn = this.page.getByRole('button', { name: 'No', exact: true });
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
    }

    /** Returns a locator scoped to the New/Edit Alert dialog. */
    getAlertDialog(): Locator {
        return this.page.locator('div[role="dialog"]').first();
    }

    async getAlertNameValue(dialog: Locator): Promise<string> {
        return await dialog.locator(compAlertsLocators.fieldAlertName).inputValue();
    }

    async getRegionCodeValue(dialog: Locator): Promise<string> {
        const label = dialog.locator(`${compAlertsLocators.fieldRegionCode} .p-dropdown-label`);
        return (await label.textContent())?.trim() ?? '';
    }

    /**
     * Region Code is read-only once an alert exists — confirmed live: the
     * Update Alert dialog renders it with data-p-disabled="true" and a
     * disabled underlying input, unlike the New Alert dialog where it's a
     * normal editable dropdown.
     */
    async isRegionCodeDisabled(dialog: Locator): Promise<boolean> {
        const dropdown = dialog.locator(compAlertsLocators.fieldRegionCode);
        return await dropdown.evaluate(el =>
            el.getAttribute('data-p-disabled') === 'true' || el.classList.contains('p-disabled')
        );
    }

    // ── Mandatory / simple fields ─────────────────────────────────────────────

    async fillAlertName(dialog: Locator, name: string) {
        console.log(`Filling Alert Name: "${name}"...`);
        const field = dialog.locator(compAlertsLocators.fieldAlertName);
        await this.fillInput(field, name);
    }

    async fillAlertEmails(dialog: Locator, emails: string) {
        console.log(`Filling Alert Email Addresses: "${emails}"...`);
        const field = dialog.locator(compAlertsLocators.fieldAlertEmails);
        await this.fillInput(field, emails);
    }

    async selectRegionCode(dialog: Locator, region: string) {
        console.log(`Selecting Region Code: "${region}"...`);
        const dropdown = dialog.locator(compAlertsLocators.fieldRegionCode);
        await this.selectDropdown(dropdown, region);
    }

    async selectGroupResults(dialog: Locator, groupBy: string) {
        console.log(`Selecting Group Results By: "${groupBy}"...`);
        const dropdown = dialog.locator(compAlertsLocators.fieldGroupResults);
        await this.selectDropdown(dropdown, groupBy);
    }

    /**
     * Selects whatever the first available option happens to be — used for
     * "Group Results By" since its real option values aren't known/confirmed,
     * unlike Region Code where "Betway Ghana" is already an established,
     * reliable value used across this whole test suite.
     */
    async selectFirstAvailableGroupResults(dialog: Locator): Promise<string> {
        console.log('Selecting first available Group Results By option...');
        const dropdown = dialog.locator(compAlertsLocators.fieldGroupResults);
        await dropdown.click();
        await this.page.waitForTimeout(300);
        const option = this.page.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        console.log(`  Selected Group Results By: "${text}"`);
        return text;
    }

    async fillAlertFrequency(dialog: Locator, amount: string) {
        console.log(`Filling Alert Every X Amount: "${amount}"...`);
        const field = dialog.locator(`${compAlertsLocators.fieldAlertFrequency} input`);
        await field.waitFor({ state: 'visible' });
        await field.click({ clickCount: 3 });
        await field.pressSequentially(amount);
        await field.press('Tab');
    }

    async isForceAlertChecked(dialog: Locator): Promise<boolean> {
        const input = dialog.locator(`${compAlertsLocators.fieldForceAlert} input[type="checkbox"]`);
        return await input.isChecked();
    }

    /**
     * Toggles the "Force Send Alert At Next Check" checkbox. PrimeVue renders a
     * clickable .p-checkbox-box div with its own visually-hidden native input
     * sitting on top — force bypasses the resulting hit-test failure.
     */
    async toggleForceAlert(dialog: Locator) {
        console.log('Toggling Force Send Alert At Next Check checkbox...');
        const box = dialog.locator(`${compAlertsLocators.fieldForceAlert} .p-checkbox-box`);
        await CommonUtils.highlightElement(box);
        await box.click({ force: true });
        await this.page.waitForTimeout(300);
    }

    // ── Schedule At + its conditional fields ──────────────────────────────────

    async selectScheduleAt(dialog: Locator, value: 'Minutely' | 'Hourly' | 'Daily' | 'Weekly') {
        console.log(`Selecting Schedule At: "${value}"...`);
        const dropdown = dialog.locator(compAlertsLocators.fieldScheduleAt);
        // This field's panel may already be open as a side effect of dismissing
        // the Next Alert Check Date calendar (clicking this same field is what
        // closes that calendar) — only click to open it if it isn't already.
        const panel = this.page.locator('.p-dropdown-panel').last();
        if (!await panel.isVisible().catch(() => false)) {
            await dropdown.click();
            await this.page.waitForTimeout(300);
        }
        const option = this.page.locator('.p-dropdown-item', { hasText: value }).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
        await this.page.waitForTimeout(500);
    }

    async fillEveryXMinutes(dialog: Locator, minutes: string) {
        console.log(`Filling Every X Minutes: "${minutes}"...`);
        const field = dialog.locator(`${compAlertsLocators.fieldEveryXMinutes} input`);
        await field.waitFor({ state: 'visible', timeout: 10000 });
        await field.click({ clickCount: 3 });
        await field.pressSequentially(minutes);
        await field.press('Tab');
    }

    async fillEveryXHours(dialog: Locator, hours: string) {
        console.log(`Filling Every X Hours: "${hours}"...`);
        const field = dialog.locator(`${compAlertsLocators.fieldEveryXHours} input`);
        await field.waitFor({ state: 'visible', timeout: 10000 });
        await field.click({ clickCount: 3 });
        await field.pressSequentially(hours);
        await field.press('Tab');
    }

    async selectWeeklyDay(dialog: Locator, day: string) {
        console.log(`Selecting Weekly Day: "${day}"...`);
        const dropdown = dialog.locator(compAlertsLocators.fieldDaySelect);
        await this.selectDropdown(dropdown, day);
    }

    // ── Clock-arrow time fields (Every Day At / At Time) ──────────────────────

    /**
     * Adjusts a PrimeVue time-only picker via its hour/minute increment arrows
     * rather than typing — matches the pattern already proven in
     * timedpromo.spec.ts's selectTimeUsingClockArrows. Falls back to typing the
     * fallback value directly if the arrow panel never renders (defensive —
     * PrimeVue's time popup occasionally renders differently across fields).
     */
    private async adjustTimeViaArrows(
        fieldLocator: Locator,
        panelSelector: string,
        hourClicks: number,
        minuteClicks: number,
        fallbackValue: string,
    ) {
        await fieldLocator.click();
        await this.page.waitForTimeout(200);
        const panel = this.page.locator(panelSelector).last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

        const hourUpArrow = panel
            .locator('.p-hour-picker [data-pc-section="incrementbutton"], .p-hour-picker button:has(.pi-chevron-up), .p-hour-picker a.p-link:has(.pi-chevron-up)')
            .first();
        const arrowsAvailable = panelOpened && (await hourUpArrow.isVisible({ timeout: 2000 }).catch(() => false));

        if (arrowsAvailable) {
            for (let i = 0; i < hourClicks; i++) {
                await hourUpArrow.click();
                await this.page.waitForTimeout(150);
            }
            const minuteUpArrow = panel
                .locator('.p-minute-picker [data-pc-section="incrementbutton"], .p-minute-picker button:has(.pi-chevron-up), .p-minute-picker a.p-link:has(.pi-chevron-up)')
                .first();
            for (let i = 0; i < minuteClicks; i++) {
                await minuteUpArrow.click();
                await this.page.waitForTimeout(150);
            }
        } else {
            console.log('Clock arrows not found — falling back to typing the time directly.');
            await fieldLocator.fill(fallbackValue);
        }
    }

    /** Sets "Every Day at *" (shown when Schedule At = Daily) via clock arrows. */
    async setEveryDayAt(dialog: Locator, hourClicks: number = 2, minuteClicks: number = 3) {
        console.log(`Setting Every Day At via clock arrows (hour+${hourClicks}, minute+${minuteClicks})...`);
        const field = dialog.locator(`${compAlertsLocators.fieldEveryDayAt} input`);
        await field.waitFor({ state: 'visible', timeout: 10000 });
        await this.adjustTimeViaArrows(field, '#everyDayAt_panel, .p-timepicker-panel', hourClicks, minuteClicks, '10:30');
        // Dismiss the time popup — do NOT press Escape (confirmed elsewhere in
        // this app: Escape closes the whole parent dialog, not just a child
        // overlay, once the overlay has already self-closed). Click the Alert
        // Name field instead — neutral and always present.
        await dialog.locator(compAlertsLocators.fieldAlertName).click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    /** Sets "At Time *" (shown when Schedule At = Weekly) via clock arrows. */
    async setAtTime(dialog: Locator, hourClicks: number = 2, minuteClicks: number = 3) {
        console.log(`Setting At Time via clock arrows (hour+${hourClicks}, minute+${minuteClicks})...`);
        const field = dialog.locator(`${compAlertsLocators.fieldAtTime} input`);
        await field.waitFor({ state: 'visible', timeout: 10000 });
        await this.adjustTimeViaArrows(field, '#atTime_panel, .p-timepicker-panel', hourClicks, minuteClicks, '14:30');
        await dialog.locator(compAlertsLocators.fieldAlertName).click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    // ── Date-only calendars (Next Alert Check Date / End Date) ────────────────

    /**
     * Picks a day from a PrimeVue date-only calendar and returns without
     * dismissing it — callers dismiss via whichever neutral field the app's
     * own UX expects next (see setNextAlertCheckDate / setEndDate below).
     */
    private async pickCalendarDay(input: Locator, panelSelector: string, selectLast: boolean) {
        await input.click();
        const panel = this.page.locator(panelSelector).last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const day = selectLast
            ? panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last()
            : panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await day.click();
        await this.page.waitForTimeout(200);
    }

    /**
     * Sets Next Alert Check Date, then dismisses the calendar by clicking the
     * Schedule At field — per this app's own UX (confirmed by the user), NOT
     * Escape, which closes the whole parent dialog instead of just this
     * calendar once it has already self-closed.
     */
    async setNextAlertCheckDate(dialog: Locator) {
        console.log('Setting Next Alert Check Date...');
        const input = dialog.locator(`${compAlertsLocators.fieldNextCheckDate} input`);
        await this.pickCalendarDay(input, '#nextCheckDate_panel, .p-datepicker', false);
        await dialog.locator(compAlertsLocators.fieldScheduleAt).click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    /**
     * Clicks whichever Schedule-At-conditional field is currently visible
     * (Every Day At / Every X Minutes / Every X Hourly / Day) to dismiss the
     * End Date calendar, matching the app's own UX. Falls back to the Alert
     * Name field if none of them are visible for some reason.
     */
    private async dismissByClickingActiveFrequencyField(dialog: Locator) {
        const candidates = [
            dialog.locator(`${compAlertsLocators.fieldEveryDayAt} input`),
            dialog.locator(`${compAlertsLocators.fieldEveryXMinutes} input`),
            dialog.locator(`${compAlertsLocators.fieldEveryXHours} input`),
            dialog.locator(compAlertsLocators.fieldDaySelect),
        ];
        for (const candidate of candidates) {
            if (await candidate.first().isVisible().catch(() => false)) {
                await candidate.first().click({ force: true }).catch(() => {});
                return;
            }
        }
        await dialog.locator(compAlertsLocators.fieldAlertName).click({ force: true }).catch(() => {});
    }

    async setEndDate(dialog: Locator) {
        console.log('Setting End Date...');
        const input = dialog.locator(`${compAlertsLocators.fieldEndDate} input`);
        await this.pickCalendarDay(input, '#endDate_panel, .p-datepicker', true);
        await this.dismissByClickingActiveFrequencyField(dialog);
        await this.page.waitForTimeout(300);
    }

    // ── Save / Cancel ──────────────────────────────────────────────────────────

    async clickSave(dialog: Locator) {
        console.log('Clicking Save button...');
        const saveBtn = dialog.getByRole('button', { name: compAlertsLocators.buttonSave });
        await saveBtn.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(saveBtn);
        // Negative-path tests intentionally leave Save disabled (missing
        // mandatory fields) — a disabled button never becomes actionable, so a
        // plain click() would hang for the full action timeout. Bound it and
        // swallow the failure; the disabled state itself is what those tests
        // assert on via isSaveEnabled().
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
    }

    async clickCancel(dialog: Locator) {
        console.log('Clicking Cancel button...');
        const cancelBtn = dialog.getByRole('button', { name: compAlertsLocators.buttonCancel });
        await this.clickElement(cancelBtn);
        await this.page.waitForTimeout(500);
    }

    async isSaveEnabled(dialog: Locator): Promise<boolean> {
        const saveBtn = dialog.getByRole('button', { name: compAlertsLocators.buttonSave });
        return !(await saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')));
    }

    // ── Toast + list verification ──────────────────────────────────────────────

    async isSuccessToastVisible(timeout: number = 15000): Promise<boolean> {
        return await this.page.locator(compAlertsLocators.toastSuccess).first().isVisible({ timeout }).catch(() => false);
    }

    /** Returns whatever toast is currently showing (success or error), for diagnostics. */
    async getToastText(timeout: number = 15000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }

    async isAlertVisibleInList(alertName: string): Promise<boolean> {
        const count = await this.alertsTable.locator('tbody tr', { hasText: alertName }).count();
        return count > 0;
    }

    // ── Comp Alert Settings (reached via the per-row "Config" button) ────────

    /**
     * Clicks Config on the first row whose name looks like one this automation
     * created (all our tests prefix names with "Auto...") — never a
     * pre-existing/original alert, and never creates a fresh one just to
     * reach Config (the table already accumulates plenty from prior runs).
     */
    async clickConfigOnAutomationAlert() {
        console.log('Clicking Config on an automation-created alert row...');
        const row = this.alertsTable.locator('tbody tr').filter({ hasText: /^Auto/ }).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const configBtn = row.getByRole('button', { name: 'Config', exact: true });
        await this.clickElement(configBtn);
        await this.page.waitForTimeout(500);
    }

    /** True once the Comp Alert Settings page's own controls are visible. */
    async isOnCompAlertSettingsPage(): Promise<boolean> {
        const createBtn = this.page.locator(compAlertsLocators.createCompAlertBtn);
        return await createBtn.isVisible({ timeout: 15000 }).catch(() => false);
    }

    async clickCreateCompAlert() {
        console.log('Clicking Create Comp Alert button...');
        const btn = this.page.locator(compAlertsLocators.createCompAlertBtn);
        await this.clickElement(btn);
        await this.page.waitForTimeout(500);
    }

    /**
     * Selects the first dropdown option that ISN'T already configured for this
     * alert. The "Select Comp" dropdown lists every comp with configurations
     * in the alert's region regardless of whether it's already linked here —
     * it does NOT filter those out itself. Picking an already-configured one
     * (confirmed live: dropdown showed "dfghbn", a comp code already present
     * as a row in the table) leaves Save silently disabled with no error,
     * since the app blocks adding a duplicate — which then makes every
     * downstream toast/list assertion fail for reasons that look unrelated.
     */
    async selectFirstAvailableComp(dialog: Locator): Promise<string> {
        console.log('Selecting first available (not-yet-configured) Comp...');
        const alreadyConfiguredRows = await this.page.locator('.p-datatable tbody tr').allTextContents();

        const dropdown = dialog.locator(compAlertsLocators.fieldCompCode);
        await dropdown.click();
        await this.page.waitForTimeout(300);

        const options = this.page.locator('.p-dropdown-item');
        await options.first().waitFor({ state: 'visible', timeout: 10000 });
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (!text) continue;
            const isAlreadyConfigured = alreadyConfiguredRows.some(rowText => rowText.includes(text));
            if (!isAlreadyConfigured) {
                await options.nth(i).click();
                await this.page.waitForTimeout(300);
                console.log(`  Selected Comp: "${text}"`);
                return text;
            }
        }
        throw new Error('selectFirstAvailableComp: every dropdown option is already configured for this alert.');
    }

    async clickSaveCompAlert(dialog: Locator) {
        console.log('Clicking Save button on Configure Comp Alert...');
        const saveBtn = dialog.getByRole('button', { name: compAlertsLocators.buttonSave });
        await saveBtn.waitFor({ state: 'visible' });
        // Surface a disabled Save loudly instead of silently swallowing the
        // click failure — confirmed live: picking an already-configured comp
        // leaves Save disabled with no visible error, which otherwise looks
        // identical to "the toast was just slow" further downstream.
        const disabled = await saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled'));
        if (disabled) {
            console.warn('  ⚠️ Save is disabled at click time — this Comp selection was likely already configured for this alert.');
        }
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
    }

    async clickCancelCompAlert(dialog: Locator) {
        console.log('Clicking Cancel button on Configure Comp Alert...');
        const cancelBtn = dialog.getByRole('button', { name: compAlertsLocators.buttonCancel });
        await this.clickElement(cancelBtn);
        await this.page.waitForTimeout(500);
    }

    async isCompAlertSaveEnabled(dialog: Locator): Promise<boolean> {
        const saveBtn = dialog.getByRole('button', { name: compAlertsLocators.buttonSave });
        return !(await saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')));
    }

    async isCompVisibleInConfigList(compName: string): Promise<boolean> {
        const count = await this.page.locator('.p-datatable tbody tr', { hasText: compName }).count();
        return count > 0;
    }

    async clickDeleteCompByName(compName: string) {
        console.log(`Clicking Delete on comp row: "${compName}"...`);
        const row = this.page.locator('.p-datatable tbody tr', { hasText: compName }).first();
        await row.waitFor({ state: 'visible', timeout: 15000 });
        const deleteBtn = row.getByRole('button', { name: 'Delete', exact: true });
        await this.clickElement(deleteBtn);
        await this.page.waitForTimeout(500);
    }

    // Delete confirmation is a custom modal ("modal-buttons-container"), not a
    // standard PrimeVue dialog — Yes/No are matched by aria-label directly.
    async clickYesOnDeleteCompDialog() {
        console.log('Clicking Yes on delete comp confirmation...');
        const yesBtn = this.page.getByRole('button', { name: 'Yes', exact: true });
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnDeleteCompDialog() {
        console.log('Clicking No on delete comp confirmation...');
        const noBtn = this.page.getByRole('button', { name: 'No', exact: true });
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
    }

    async clickBackFromCompAlertSettings() {
        console.log('Clicking Back button on Comp Alert Settings page...');
        const backBtn = this.page.locator(compAlertsLocators.backBtnIcon).first();
        await this.clickElement(backBtn);
        await this.page.waitForTimeout(500);
    }

    async clickRefreshCompAlertSettings() {
        console.log('Clicking Refresh button on Comp Alert Settings page...');
        const refreshBtn = this.page.locator(compAlertsLocators.refreshBtn);
        await this.clickElement(refreshBtn);
        await this.page.waitForTimeout(1000);
    }
}

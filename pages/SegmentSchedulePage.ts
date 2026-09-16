import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentScheduleLocators } from '../locators/segmentScheduleLocators';
import { CommonUtils } from '../utils/commonUtils';

export class SegmentSchedulePage extends BasePage {
    /////// Landing Page Locator Properties ///////
    readonly regionDropdown: Locator;
    readonly scheduleSegmentBtn: Locator;
    readonly segmentScheduleTable: Locator;

    /////// Popup Dialog Locator Properties ///////
    readonly popupDialog: Locator;
    readonly nameInput: Locator;
    readonly descriptionInput: Locator;
    readonly campaignDropdown: Locator;
    readonly segmentDropdown: Locator;
    readonly scheduledDateInput: Locator;
    readonly expiryDateInput: Locator;

    /////// Toggle Locator Properties ///////
    readonly sendEmailToggle: Locator;
    readonly sendSmsToggle: Locator;
    readonly sendPushToggle: Locator;
    readonly sendNotificationPanelToggle: Locator;
    readonly dryRunToggle: Locator;

    /////// Conditional Template Dropdown Locator Properties ///////
    readonly emailTemplateDropdown: Locator;
    readonly smsTemplateDropdown: Locator;
    readonly pushTemplateDropdown: Locator;
    readonly notificationPanelTemplateDropdown: Locator;

    /////// Popup Footer / Confirmation Locator Properties ///////
    readonly scheduleBtn: Locator;
    readonly saveBtn: Locator;
    readonly dialogCancelBtn: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    /////// Toast Locator Properties ///////
    readonly successToast: Locator;
    readonly errorToast: Locator;

    constructor(page: Page) {
        super(page);

        /////// Landing Page Locators ///////
        // Target the visible span text inside the dropdown for visibility assertions
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${segmentScheduleLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.scheduleSegmentBtn = page.getByRole('button', { name: segmentScheduleLocators.buttonScheduleSegment });
        this.segmentScheduleTable = page.locator('main table').first();

        /////// Popup Dialog Locators ///////
        this.popupDialog = page.locator(segmentScheduleLocators.popupDialog).first();
        this.nameInput = page.locator(segmentScheduleLocators.inputName);
        this.descriptionInput = page.locator(segmentScheduleLocators.inputDescription);
        this.campaignDropdown = this.popupDialog.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${segmentScheduleLocators.dropdownCampaignAriaLabel}"])`);
        this.segmentDropdown = this.popupDialog.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${segmentScheduleLocators.dropdownSegmentAriaLabel}"])`);
        this.scheduledDateInput = page.locator(segmentScheduleLocators.calendarScheduledDate).locator('input');
        this.expiryDateInput = page.locator(segmentScheduleLocators.calendarExpiryDate).locator('input');

        /////// Toggle Locators ///////
        this.sendEmailToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(segmentScheduleLocators.toggleSendEmail) });
        this.sendSmsToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(segmentScheduleLocators.toggleSendSms) });
        this.sendPushToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(segmentScheduleLocators.toggleSendPush) });
        this.sendNotificationPanelToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(segmentScheduleLocators.toggleSendNotificationPanel) });
        this.dryRunToggle = page.locator('div.p-inputswitch').filter({ has: page.locator(segmentScheduleLocators.toggleDryRun) });

        /////// Conditional Template Dropdown Locators ///////
        this.emailTemplateDropdown = page.locator(segmentScheduleLocators.dropdownEmailTemplate);
        this.smsTemplateDropdown = page.locator(segmentScheduleLocators.dropdownSmsTemplate);
        this.pushTemplateDropdown = page.locator(segmentScheduleLocators.dropdownPushTemplate);
        this.notificationPanelTemplateDropdown = page.locator(segmentScheduleLocators.dropdownNotificationPanelTemplate);

        /////// Popup Footer / Confirmation Locators ///////
        // Scoped to the popup dialog — confirmed live that the underlying table has its own
        // row-level "Cancel" action button per row (alongside Approve/Decline/Edit), so an
        // unscoped page-wide lookup for "Cancel" matches those rows too and throws a strict-mode
        // violation instead of resolving to the popup's own footer button.
        this.scheduleBtn = this.popupDialog.getByRole('button', { name: segmentScheduleLocators.buttonSchedule, exact: true });
        // Confirmed live: the Edit popup is titled "Update Segment" and its submit button reads
        // "Save", not "Schedule" — the Create popup's button label ("Schedule") does NOT carry
        // over to Edit, so this needs its own locator rather than reusing scheduleBtn.
        this.saveBtn = this.popupDialog.getByRole('button', { name: 'Save', exact: true });
        this.dialogCancelBtn = this.popupDialog.getByRole('button', { name: segmentScheduleLocators.buttonCancel, exact: true });
        this.confirmYesBtn = page.getByRole('button', { name: segmentScheduleLocators.confirmYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: segmentScheduleLocators.confirmNo, exact: true });

        /////// Toast Locators ///////
        this.successToast = page.locator(segmentScheduleLocators.successToast);
        this.errorToast = page.locator(segmentScheduleLocators.errorToast);
    }

    /////// Landing Page Methods ///////

    /**
     * Opens a PrimeVue dropdown by focusing the hidden accessible input and pressing Space.
     */
    private async openRegionDropdown(ariaLabel: string) {
        const hiddenInput = this.page.locator(
            `div.p-dropdown:has(.p-dropdown-trigger[aria-label="${ariaLabel}"]) .p-hidden-accessible input`
        );
        await hiddenInput.waitFor({ state: 'attached' });
        await hiddenInput.focus();
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
    }

    /**
     * Selects a region from the Segment Schedule region dropdown.
     */
    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Segment Schedule...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openRegionDropdown(segmentScheduleLocators.dropdownSelectRegion);

        // Scoped to the visible overlay panel rather than an unscoped page.getByRole('option') —
        // confirmed live that the unscoped lookup matches PrimeVue's hidden native
        // <select><option> accessibility fallback instead of the actual clickable list item in
        // the open panel. Clicking that hidden element doesn't fire the component's selection
        // handler at all, so the dropdown just stays open with nothing selected.
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        const optionLocator = panel.locator(segmentScheduleLocators.dropdownItem, { hasText: regionName }).first();
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Clicks the Schedule Segment button if visible.
     */
    async clickScheduleSegment() {
        console.log('Clicking Schedule Segment button...');
        if (await this.scheduleSegmentBtn.count() > 0) {
            await this.clickElement(this.scheduleSegmentBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Selects Region and then clicks Schedule Segment in sequence.
     */
    async selectRegionAndSchedule(regionName: string) {
        await this.selectRegion(regionName);
        await this.clickScheduleSegment();
    }

    /**
     * Selects whichever region renders first — used so tests aren't hardcoded to a region name
     * that may not exist/have data in every environment. Returns the selected region's text.
     */
    async selectFirstRegion(): Promise<string> {
        console.log('Selecting first available region on Segment Schedule...');
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openRegionDropdown(segmentScheduleLocators.dropdownSelectRegion);

        // Scoped to the visible overlay panel rather than an unscoped page.getByRole('option') —
        // confirmed live that the unscoped lookup matches PrimeVue's hidden native
        // <select><option> accessibility fallback (its placeholder text, e.g. "Select a region")
        // instead of the actual first clickable item in the open panel. Clicking that hidden
        // element doesn't fire the component's selection handler, so the dropdown just stays
        // open with nothing actually selected.
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });
        const option = panel.locator(segmentScheduleLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await this.clickElement(option);
        await this.page.waitForLoadState('networkidle');
        return text;
    }

    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible', timeout: 10000 });
        await this.scheduleBtn.waitFor({ state: 'visible', timeout: 10000 });
    }

    /////// Popup Form Methods ///////

    async fillName(name: string) {
        console.log(`Filling Name: ${name}`);
        await this.fillInput(this.nameInput, name);
    }

    async fillDescription(description: string) {
        console.log(`Filling Description: ${description}`);
        await this.fillInput(this.descriptionInput, description);
    }

    // ─── Generic PrimeNG dropdown helpers ──────────────────────────────────────

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

    /** Selects whichever option renders first in a dropdown — used for fields whose values are
     * environment/real data (Campaign, Segment, Templates) and not safe to hardcode. Returns the
     * selected option's text. */
    private async selectFirstOption(dropdownLocator: Locator): Promise<string> {
        const panel = await this.openDropdown(dropdownLocator);
        const option = panel.locator(segmentScheduleLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(200);
        return text;
    }

    /**
     * Opens the Campaign dropdown and clicks the first option that is both ACTIVE (not suffixed
     * "(Inactive)" — confirmed live that scheduling against an inactive campaign fails silently
     * server-side) and not one of excludeTexts (used when editing — re-submitting with the same
     * Campaign it already has is rejected the same way a duplicate Name is — and when retrying a
     * create that hit a "campaign already has a pending schedule" conflict, where excluding only
     * the single most-recent attempt could ping-pong between two blocked campaigns forever instead
     * of ever reaching a third). Falls back to the first active option — or the first option at
     * all if every one is inactive — rather than hanging if no option satisfies both conditions.
     */
    private async selectActiveCampaign(excludeTexts: string[] = []): Promise<string> {
        const panel = await this.openDropdown(this.campaignDropdown);
        const options = panel.locator(segmentScheduleLocators.dropdownItem);
        await options.first().waitFor({ state: 'visible', timeout: 10000 });
        const count = await options.count();

        let firstActiveIndex = -1;
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (/\(Inactive\)/i.test(text)) continue;
            if (firstActiveIndex === -1) firstActiveIndex = i;
            if (excludeTexts.includes(text)) continue;
            await options.nth(i).click();
            await this.page.waitForTimeout(200);
            return text;
        }

        const fallbackIndex = firstActiveIndex !== -1 ? firstActiveIndex : 0;
        console.log(
            firstActiveIndex !== -1
                ? 'No ACTIVE Campaign other than the excluded ones was found — falling back to one of them anyway.'
                : 'Every Campaign option was inactive — falling back to the first one.'
        );
        const fallbackText = (await options.nth(fallbackIndex).textContent())?.trim() ?? '';
        await options.nth(fallbackIndex).click();
        await this.page.waitForTimeout(200);
        return fallbackText;
    }

    async selectFirstCampaign(): Promise<string> {
        console.log('Selecting first ACTIVE available Campaign...');
        return this.selectActiveCampaign();
    }

    /** Selects an ACTIVE campaign not in alreadyTriedCampaignNames — used when editing a segment
     * (re-submitting with the same Campaign it already has is rejected the same way a duplicate
     * Name is, confirmed live) and when retrying a create after a "campaign already has a pending
     * schedule" conflict. Accepts either a single name or the full set already tried this run, so
     * repeated retries keep expanding the exclusion set instead of re-trying the same one. */
    async selectDifferentActiveCampaign(alreadyTriedCampaignNames: string | string[]): Promise<string> {
        const excludeTexts = Array.isArray(alreadyTriedCampaignNames) ? alreadyTriedCampaignNames : [alreadyTriedCampaignNames];
        console.log(`Selecting an ACTIVE Campaign different from: ${excludeTexts.map(t => `"${t}"`).join(', ')}...`);
        return this.selectActiveCampaign(excludeTexts);
    }

    async selectFirstSegment(): Promise<string> {
        console.log('Selecting first available Segment...');
        return this.selectFirstOption(this.segmentDropdown);
    }

    // ─── Calendar fields ────────────────────────────────────────────────────────

    /**
     * Picks the first enabled day in the Scheduled Date calendar, then clicks the Expiry Date
     * field to dismiss it — per confirmed instruction (clicking Expiry Date, not Escape, is what
     * closes the Scheduled Date calendar in this popup). That click also naturally focuses/opens
     * the Expiry Date calendar next, which setExpiryDate() expects and continues from.
     */
    async setScheduledDate() {
        console.log('Selecting Scheduled Date...');
        await this.scheduledDateInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#scheduledDate_panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);

        await this.expiryDateInput.scrollIntoViewIfNeeded().catch(() => {});
        await this.expiryDateInput.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);

        // Fallback, matching the same proven pattern used elsewhere in this suite (e.g.
        // AutoOptinPage.setStartDate): if the dismiss click didn't land correctly, Escape closes
        // this calendar directly since it's a genuine aria-modal overlay.
        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Picks the last enabled day in the Expiry Date calendar (keeping it after Scheduled Date),
     * then closes it via Escape.
     */
    async setExpiryDate() {
        console.log('Selecting Expiry Date...');
        const panel = this.page.locator('#expiryDate_panel');
        if (!(await panel.isVisible().catch(() => false))) {
            await this.expiryDateInput.click();
            await this.page.waitForTimeout(300);
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Opens the Scheduled Date calendar (if not already open) and clicks its time-picker's "Next
     * Hour" button `hours` times, shifting the existing value forward by that many hours without
     * touching the day — confirmed live via #scheduledDate_panel's .p-timepicker structure
     * (PrimeNG's standard hour/minute increment/decrement buttons, identified by aria-label rather
     * than a version-specific class). Used when editing an existing segment to prove the Scheduled
     * Date actually changes and persists, not just Name/Campaign/Description. Note: if the current
     * hour is within `hours` of midnight, this wraps the displayed hour without advancing the day
     * (PrimeNG's hour picker never touches the calendar body) — a rare edge case, not handled here.
     */
    async shiftScheduledTimeByHours(hours: number) {
        console.log(`Shifting Scheduled Date's time forward by ${hours} hour(s)...`);
        await this.scheduledDateInput.click();
        await this.page.waitForTimeout(300);

        const panel = this.page.locator('#scheduledDate_panel');
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        const nextHourBtn = panel.locator('button[aria-label="Next Hour"]');
        for (let i = 0; i < hours; i++) {
            await this.clickElement(nextHourBtn);
            await this.page.waitForTimeout(150);
        }

        // Same dismiss convention as setScheduledDate(): clicking Expiry Date closes this panel.
        await this.expiryDateInput.scrollIntoViewIfNeeded().catch(() => {});
        await this.expiryDateInput.click({ force: true }).catch(() => {});
        await this.page.waitForTimeout(300);
        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    /** Same as shiftScheduledTimeByHours() but for the Expiry Date calendar, dismissed via
     * Escape per setExpiryDate()'s own established convention for this field. */
    async shiftExpiryTimeByHours(hours: number) {
        console.log(`Shifting Expiry Date's time forward by ${hours} hour(s)...`);
        const panel = this.page.locator('#expiryDate_panel');
        if (!(await panel.isVisible().catch(() => false))) {
            await this.expiryDateInput.click();
            await this.page.waitForTimeout(300);
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }
        const nextHourBtn = panel.locator('button[aria-label="Next Hour"]');
        for (let i = 0; i < hours; i++) {
            await this.clickElement(nextHourBtn);
            await this.page.waitForTimeout(150);
        }

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    // ─── Toggles ────────────────────────────────────────────────────────────────

    private async isToggleOn(toggleLocator: Locator): Promise<boolean> {
        return (await toggleLocator.getAttribute('aria-checked')) === 'true';
    }

    private async ensureToggleState(toggleLocator: Locator, desiredOn: boolean) {
        const isOn = await this.isToggleOn(toggleLocator);
        if (isOn !== desiredOn) {
            await this.clickElement(toggleLocator);
            await this.page.waitForTimeout(300);
        }
    }

    async toggleSendEmail() {
        console.log('Toggling "Send Email"...');
        await this.clickElement(this.sendEmailToggle);
        await this.page.waitForTimeout(300);
    }
    async isSendEmailOn(): Promise<boolean> { return this.isToggleOn(this.sendEmailToggle); }
    async ensureSendEmailOn(on: boolean) { await this.ensureToggleState(this.sendEmailToggle, on); }

    async toggleSendSms() {
        console.log('Toggling "Send SMS"...');
        await this.clickElement(this.sendSmsToggle);
        await this.page.waitForTimeout(300);
    }
    async isSendSmsOn(): Promise<boolean> { return this.isToggleOn(this.sendSmsToggle); }
    async ensureSendSmsOn(on: boolean) { await this.ensureToggleState(this.sendSmsToggle, on); }

    async toggleSendPush() {
        console.log('Toggling "Send Push"...');
        await this.clickElement(this.sendPushToggle);
        await this.page.waitForTimeout(300);
    }
    async isSendPushOn(): Promise<boolean> { return this.isToggleOn(this.sendPushToggle); }
    async ensureSendPushOn(on: boolean) { await this.ensureToggleState(this.sendPushToggle, on); }

    async toggleSendNotificationPanel() {
        console.log('Toggling "Send Notification Panel"...');
        await this.clickElement(this.sendNotificationPanelToggle);
        await this.page.waitForTimeout(300);
    }
    async isSendNotificationPanelOn(): Promise<boolean> { return this.isToggleOn(this.sendNotificationPanelToggle); }
    async ensureSendNotificationPanelOn(on: boolean) { await this.ensureToggleState(this.sendNotificationPanelToggle, on); }

    /** Strictly required to be ON for every Schedule Segment test case per team convention — a
     * real (non-dry-run) schedule would otherwise actually fire emails/SMS/pushes/notifications
     * against the live site. */
    async toggleDryRun() {
        console.log('Toggling "Dry Run"...');
        await this.clickElement(this.dryRunToggle);
        await this.page.waitForTimeout(300);
    }
    async isDryRunOn(): Promise<boolean> { return this.isToggleOn(this.dryRunToggle); }
    async ensureDryRunOn(on: boolean) { await this.ensureToggleState(this.dryRunToggle, on); }

    // ─── Conditional Template Dropdowns ─────────────────────────────────────────

    async isEmailTemplateVisible(): Promise<boolean> { return this.emailTemplateDropdown.isVisible().catch(() => false); }
    async isSmsTemplateVisible(): Promise<boolean> { return this.smsTemplateDropdown.isVisible().catch(() => false); }
    async isPushTemplateVisible(): Promise<boolean> { return this.pushTemplateDropdown.isVisible().catch(() => false); }
    async isNotificationPanelTemplateVisible(): Promise<boolean> { return this.notificationPanelTemplateDropdown.isVisible().catch(() => false); }

    async selectFirstEmailTemplate(): Promise<string> {
        console.log('Selecting first available Email Template...');
        return this.selectFirstOption(this.emailTemplateDropdown);
    }
    async selectFirstSmsTemplate(): Promise<string> {
        console.log('Selecting first available SMS Template...');
        return this.selectFirstOption(this.smsTemplateDropdown);
    }
    async selectFirstPushTemplate(): Promise<string> {
        console.log('Selecting first available Push Template...');
        return this.selectFirstOption(this.pushTemplateDropdown);
    }
    async selectFirstNotificationPanelTemplate(): Promise<string> {
        console.log('Selecting first available Notification Panel Template...');
        return this.selectFirstOption(this.notificationPanelTemplateDropdown);
    }

    // ─── Popup Footer Actions ───────────────────────────────────────────────────

    async clickSchedule() {
        console.log('Clicking Schedule button...');
        await this.clickElement(this.scheduleBtn);
        await this.page.waitForTimeout(1000);
    }

    /** Submits the Edit popup ("Update Segment"), whose footer button reads "Save" rather than
     * "Schedule" (confirmed live) — use this instead of clickSchedule() after clickEditForRow(). */
    async clickSaveEdit() {
        console.log('Clicking Save button (Edit popup)...');
        await this.clickElement(this.saveBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickDialogCancel() {
        console.log('Clicking popup Cancel button...');
        await this.clickElement(this.dialogCancelBtn);
        await this.page.waitForTimeout(500);
    }

    async clickConfirmYes() {
        console.log('Clicking confirmation Yes button...');
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForTimeout(500);
    }

    async clickConfirmNo() {
        console.log('Clicking confirmation No button...');
        await this.clickElement(this.confirmNoBtn);
        await this.page.waitForTimeout(500);
    }

    // ─── Row Actions ─────────────────────────────────────────────────────────────

    private getRowByName(name: string): Locator {
        return this.segmentScheduleTable.locator('tbody tr').filter({ hasText: name }).first();
    }

    /**
     * Clicks the row-level Edit action for a scheduled segment by name, and waits for the popup
     * to reopen (pre-filled with that segment's data). Confirmed live: row actions here are
     * standalone labeled buttons (Approve/Decline/Edit/Cancel), same as the Cancel button already
     * used by cancelSegmentScheduleIfPresent — not a kebab menu.
     */
    async clickEditForRow(name: string) {
        console.log(`Clicking Edit for scheduled segment "${name}"...`);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const editBtn = row.getByRole('button', { name: 'Edit', exact: true });
        await this.clickElement(editBtn);
        await this.popupDialog.waitFor({ state: 'visible', timeout: 10000 });
        await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    /** Reads the Name field's current value — used right after clickEditForRow to confirm the
     * popup actually reopened pre-filled with the selected row's data. */
    async getNameValue(): Promise<string> {
        return this.nameInput.inputValue();
    }

    /** Reads the Description field's current value — same purpose as getNameValue(). */
    async getDescriptionValue(): Promise<string> {
        return this.descriptionInput.inputValue();
    }

    /** Reads the Campaign dropdown's currently displayed value — used to confirm a saved edit's
     * Campaign change actually persisted when the popup is reopened. */
    async getCampaignValue(): Promise<string> {
        const text = (await this.campaignDropdown.locator('.p-dropdown-label').innerText().catch(() => '')).trim();
        return text === ' ' ? '' : text;
    }

    /** True once the row's Status cell reads "Cancelled" — used to confirm a Cancel + Yes
     * confirmation actually took effect, not just that the confirmation dialog was clicked. */
    async isRowStatusCancelled(name: string): Promise<boolean> {
        const rowText = await this.getRowByName(name).innerText().catch(() => '');
        return rowText.includes('Cancelled');
    }

    /** Reads the row's Campaign Name cell text. Column order confirmed live: Total Processed,
     * Name, Campaign Name, Scheduled Date, Status, Review Status, Reviewed By, Review Date,
     * [actions] — Campaign Name is the 3rd <td> (index 2). */
    async getRowCampaignNameText(name: string): Promise<string> {
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return (await row.locator('td').nth(2).innerText()).trim();
    }

    /** Reads the row's Scheduled Date cell text (e.g. "06/05/2026 16:32"). Column order confirmed
     * live: Total Processed, Name, Campaign Name, Scheduled Date, Status, Review Status,
     * Reviewed By, Review Date, [actions] — Scheduled Date is the 4th <td> (index 3). */
    async getRowScheduledDateText(name: string): Promise<string> {
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return (await row.locator('td').nth(3).innerText()).trim();
    }

    /** Reads the row's Review Status cell text (blank until Approved/Declined). Column order
     * confirmed live: Total Processed, Name, Campaign Name, Scheduled Date, Status, Review Status,
     * Reviewed By, Review Date, [actions] — Review Status is the 6th <td> (index 5). */
    async getRowReviewStatusText(name: string): Promise<string> {
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        return (await row.locator('td').nth(5).innerText()).trim();
    }

    /**
     * Clicks the row-level Approve action for a scheduled segment by name — a standalone labeled
     * button (same as Edit/Cancel), not a kebab menu. This opens a Yes/No confirmation modal
     * (confirmYesBtn / confirmNoBtn) that the caller must then act on.
     */
    async clickApproveForRow(name: string) {
        console.log(`Clicking Approve for scheduled segment "${name}"...`);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const approveBtn = row.getByRole('button', { name: 'Approve', exact: true });
        await this.clickElement(approveBtn);
    }

    /** Clicks the row-level Decline action for a scheduled segment by name — same shape as
     * clickApproveForRow(), also opening a Yes/No confirmation modal. */
    async clickDeclineForRow(name: string) {
        console.log(`Clicking Decline for scheduled segment "${name}"...`);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 10000 });
        const declineBtn = row.getByRole('button', { name: 'Decline', exact: true });
        await this.clickElement(declineBtn);
    }

    // ─── Cleanup ─────────────────────────────────────────────────────────────────

    /**
     * Cancels a scheduled segment by name, regardless of whether the test that created it passed
     * or failed — every dry-run schedule this suite creates must be cancelled afterward so it
     * doesn't pile up in the live table. Row actions are inconsistent across this app (some
     * features use a standalone labeled button, others hide actions behind a "..." kebab menu —
     * confirmed live across several other page objects in this suite), so this tries the
     * standalone "Cancel" button first and falls back to a kebab menu option of the same name.
     */
    async cancelSegmentScheduleIfPresent(name: string) {
        console.log(`Attempting to cancel scheduled segment "${name}" (cleanup)...`);
        try {
            const row = this.getRowByName(name);
            const rowVisible = await row.isVisible({ timeout: 8000 }).catch(() => false);
            if (!rowVisible) {
                console.log(`Row for "${name}" not found — nothing to cancel.`);
                return;
            }

            const standaloneCancelBtn = row.getByRole('button', { name: segmentScheduleLocators.buttonCancel, exact: true });
            if (await standaloneCancelBtn.count() > 0 && await standaloneCancelBtn.first().isVisible().catch(() => false)) {
                await this.clickElement(standaloneCancelBtn.first());
            } else {
                const kebabBtn = row.locator('button.pure__table-menu-trigger, button:has(.pi-ellipsis-v)');
                await this.clickElement(kebabBtn.first());
                await this.page.waitForTimeout(500);
                const cancelMenuOption = this.page
                    .locator('.p-menu, .p-tieredmenu, .p-contextmenu, [role="menu"]')
                    .getByText(segmentScheduleLocators.buttonCancel, { exact: true });
                await this.clickElement(cancelMenuOption);
            }

            await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickConfirmYes();
            await this.page.waitForTimeout(500);
            console.log(`Cancelled scheduled segment "${name}".`);
        } catch (error) {
            console.log(`Cancel cleanup skipped for "${name}" (likely never created or already cancelled): ${error}`);
        }
    }
}

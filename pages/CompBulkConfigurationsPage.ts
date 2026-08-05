import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compBulkConfigurationsLocators } from '../locators/compBulkConfigurationsLocators';
import { CommonUtils } from '../utils/commonUtils';

export class CompBulkConfigurationsPage extends BasePage {
    readonly createConfigurationBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createConfigurationBtn = this.page.locator(compBulkConfigurationsLocators.createConfigurationBtn);
    }

    async clickCreateConfiguration() {
        console.log('Clicking Create Configuration button...');
        await this.clickElement(this.createConfigurationBtn);
        await this.page.waitForTimeout(500);
    }

    /** Returns a locator scoped to the Create/Edit Configuration dialog. */
    getDialog(): Locator {
        return this.page.locator('div[role="dialog"]').first();
    }

    /** Locates a configuration card by its Description (rendered as the card's <h5> heading). */
    getCardByName(description: string): Locator {
        return this.page.locator('.configuration-card').filter({ has: this.page.locator('h5', { hasText: description }) }).first();
    }

    /** Locates the first existing configuration card, whichever it is — used by tests that only
     * need to reach a card (e.g. to check navigation), not modify anything. */
    getFirstConfigurationCard(): Locator {
        return this.page.locator('.configuration-card').first();
    }

    /** Reads a configuration card's Description (its <h5> heading). */
    async getCardDescriptionText(card: Locator): Promise<string> {
        return (await card.locator('h5').first().textContent())?.trim() ?? '';
    }

    /** Opens the given configuration card's kebab ("⋮") menu and clicks Edit. */
    async clickEditOnCard(description: string): Promise<void> {
        console.log(`Clicking Edit on configuration card: "${description}"...`);
        const card = this.getCardByName(description);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = card.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const editItem = this.page.locator(compBulkConfigurationsLocators.editMenuItem);
        await editItem.waitFor({ state: 'visible', timeout: 5000 });
        await editItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given configuration card's kebab ("⋮") menu and clicks Payouts. */
    async clickPayoutsOnCard(description: string): Promise<void> {
        console.log(`Clicking Payouts on configuration card: "${description}"...`);
        const card = this.getCardByName(description);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = card.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const payoutsItem = this.page.locator(compBulkConfigurationsLocators.payoutsMenuItem);
        await payoutsItem.waitFor({ state: 'visible', timeout: 5000 });
        await payoutsItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given configuration card's kebab ("⋮") menu and clicks Delete. */
    async clickDeleteOnCard(description: string): Promise<void> {
        console.log(`Clicking Delete on configuration card: "${description}"...`);
        const card = this.getCardByName(description);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = card.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const deleteItem = this.page.locator(compBulkConfigurationsLocators.deleteMenuItem);
        await deleteItem.waitFor({ state: 'visible', timeout: 5000 });
        await deleteItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Reads the card's own visible "Active"/"InActive" status label. */
    getActiveStatusLabel(description: string): Locator {
        return this.getCardByName(description).getByText(/^(Active|InActive)$/, { exact: true }).first();
    }

    /**
     * Clicks the given Configuration card's Active/Inactive toggle and waits for its visible
     * Active/InActive label to actually flip, throwing if it never does — a single click isn't
     * trusted to have taken effect on its own, since a click that's silently swallowed would
     * otherwise go undetected and make a caller that toggles twice in a row (activate, then
     * deactivate) see "activate" happen twice instead (confirmed by the user).
     *
     * Defaults to a generous 60s, matching this same action's toast (confirmed by the user to
     * be unusually slow) — an earlier, shorter bound here was throwing its OWN timeout error
     * before the slow backend update (and toast) ever arrived, ending the test early.
     * Activating requires the Configuration to already have at least 1 Band (confirmed by the
     * user). force bypasses PrimeNG InputSwitch's own hidden-input-over-visual-slider overlap —
     * the same class of hit-test failure already fixed for this suite's checkboxes.
     */
    async toggleActiveStatus(description: string, timeout: number = 60000): Promise<void> {
        console.log(`Toggling Active status on configuration card: "${description}"...`);
        const card = this.getCardByName(description);
        const toggle = card.locator(compBulkConfigurationsLocators.activeToggle);
        const statusLabel = this.getActiveStatusLabel(description);

        const before = (await statusLabel.textContent().catch(() => null))?.trim() ?? '';
        await toggle.waitFor({ state: 'visible', timeout: 15000 });
        await CommonUtils.highlightElement(toggle);
        await toggle.click({ force: true });

        const pollInterval = 500;
        const maxAttempts = Math.ceil(timeout / pollInterval);
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const current = (await statusLabel.textContent().catch(() => null))?.trim() ?? '';
            if (current && current !== before) {
                console.log(`  Status changed: "${before}" -> "${current}"`);
                return;
            }
            await this.page.waitForTimeout(pollInterval);
        }
        throw new Error(`toggleActiveStatus: status label still reads "${before}" after clicking the toggle — the click may not have registered.`);
    }

    /** Clicks the Back button on the Configurations page. */
    async clickBackButton(): Promise<void> {
        console.log('Clicking Back button...');
        await this.clickElement(this.page.locator(compBulkConfigurationsLocators.backButton));
    }

    /** Opens the given configuration card's kebab ("⋮") menu and clicks Payout Errors. */
    async clickPayoutErrorsOnCard(description: string): Promise<void> {
        console.log(`Clicking Payout Errors on configuration card: "${description}"...`);
        const card = this.getCardByName(description);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = card.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const payoutErrorsItem = this.page.locator(compBulkConfigurationsLocators.payoutErrorsMenuItem);
        await payoutErrorsItem.waitFor({ state: 'visible', timeout: 5000 });
        await payoutErrorsItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given configuration card's kebab ("⋮") menu and clicks Add Band. */
    async clickAddBandOnCard(description: string): Promise<void> {
        console.log(`Clicking Add Band on configuration card: "${description}"...`);
        const card = this.getCardByName(description);
        await card.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = card.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const addBandItem = this.page.locator(compBulkConfigurationsLocators.addBandMenuItem);
        await addBandItem.waitFor({ state: 'visible', timeout: 5000 });
        await addBandItem.click();
        await this.page.waitForTimeout(500);
    }

    // ── Mandatory fields ───────────────────────────────────────────────────────

    async fillDescription(dialog: Locator, description: string) {
        console.log(`Filling Description: "${description}"...`);
        const field = dialog.locator(compBulkConfigurationsLocators.fieldDescription);
        await this.fillInput(field, description);
    }

    async getDescriptionValue(dialog: Locator): Promise<string> {
        const field = dialog.locator(compBulkConfigurationsLocators.fieldDescription);
        return await field.inputValue();
    }

    /**
     * Clears and types a value into a PrimeNG InputNumber field, verifying it actually landed
     * and blurring afterward — a plain .fill() sets the DOM value but PrimeNG's InputNumber
     * doesn't reliably pick that up into its Angular model, and this app recomputes form
     * validity (Save's disabled state) on blur, not on input (both confirmed live elsewhere in
     * this suite, on Comp Bulk's own Create dialog).
     *
     * Decimal-mode fields (Minimum/Maximum Comp Awarded use inputmode="decimal", unlike Comp
     * Bulk's own inputmode="numeric" fields) only reformat to N.00 ON BLUR — confirmed live:
     * checking the raw DOM string right after typing, before blurring, can read a transient
     * value ("10") that blur's reformat later silently overwrites to something else entirely
     * ("1.00"), so the verification below blurs FIRST and compares numerically (tolerant of the
     * .00 padding) rather than trusting the pre-blur string.
     */
    private async fillNumberField(input: Locator, value: string): Promise<void> {
        await input.waitFor({ state: 'visible', timeout: 5000 });

        for (let attempt = 0; attempt < 3; attempt++) {
            await input.click({ clickCount: 3 });
            await input.press('Control+A');
            await input.press('Delete');
            await input.pressSequentially(value);
            await input.blur();

            const digitsOnly = (await input.inputValue()).replace(/[^\d.-]/g, '');
            if (parseFloat(digitsOnly) === parseFloat(value)) return;
        }

        await input.evaluate((el: HTMLInputElement, val: string) => {
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
            nativeSetter.call(el, val);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
        await input.blur();

        const finalDigits = (await input.inputValue()).replace(/[^\d.-]/g, '');
        if (parseFloat(finalDigits) !== parseFloat(value)) {
            throw new Error(`fillNumberField: failed to set value to "${value}" — field shows "${await input.inputValue()}" after all attempts.`);
        }
    }

    async fillMinimumPayout(dialog: Locator, value: string) {
        console.log(`Filling Minimum Comp Awarded: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.fieldMinimumPayout), value);
    }

    async fillMaximumPayout(dialog: Locator, value: string) {
        console.log(`Filling Maximum Comp Awarded: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.fieldMaximumPayout), value);
    }

    async fillCampaignBudget(dialog: Locator, value: string) {
        console.log(`Filling Campaign Budget: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.fieldCampaignBudget), value);
    }

    async fillDailyBudget(dialog: Locator, value: string) {
        console.log(`Filling Daily Budget: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.fieldDailyBudget), value);
    }

    // ── Searchable dropdowns ───────────────────────────────────────────────────

    /**
     * Opens a PrimeNG-style filterable dropdown, optionally types into its search box, then
     * clicks the first matching option and returns its text. Mirrors the identical helper in
     * CompsBulkPage — every dropdown in this app renders the same `.p-dropdown-panel` structure.
     */
    private async selectDropdownOption(dropdown: Locator, searchText?: string): Promise<string> {
        await this.clickElement(dropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await dropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }

        if (searchText) {
            const filterInput = panel.locator('input[type="text"]').first();
            if (await filterInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await filterInput.fill(searchText);
                await this.page.waitForTimeout(400);
            }
        }

        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    /**
     * Reads the Region already configured on each existing configuration card on the list page
     * behind this dialog (each card shows it as a disabled input next to a "Region" label, e.g.
     * "Betway Ghana (GH)") — region duplicates aren't allowed (confirmed by the user), so Create
     * must never reuse one of these.
     */
    async getAlreadyConfiguredRegions(): Promise<string[]> {
        // The configuration cards are a separate async data fetch from the toolbar/Create
        // button, so reading immediately after navigation risks seeing 0 cards before they've
        // loaded — wait for at least one before reading (tolerating a genuinely-empty list).
        await this.page.locator('.configuration-card').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

        const regionSpans = this.page.locator('.configuration-card span.p-float-label')
            .filter({ has: this.page.locator('label:text-is("Region")') });
        const count = await regionSpans.count();
        const regions: string[] = [];
        for (let i = 0; i < count; i++) {
            const value = (await regionSpans.nth(i).locator('input').inputValue()).trim();
            if (value && value !== 'None' && value !== 'undefined') regions.push(value);
        }
        console.log(`Already-configured regions found (${count} card(s) checked): ${JSON.stringify(regions)}`);
        return regions;
    }

    /**
     * Selects the first Region Code dropdown option that ISN'T already configured (see
     * getAlreadyConfiguredRegions) — mirrors CompAlertsPage.selectFirstAvailableComp, which
     * solves the identical "don't reuse an already-configured value" problem for Comp Alerts.
     * Confirmed live: picking an already-configured region leaves Save/the create call failing,
     * since the app blocks a duplicate region for this comp.
     */
    async selectRegionCode(dialog: Locator): Promise<string> {
        console.log('Selecting first available (not-yet-configured) Region Code...');
        const alreadyConfigured = await this.getAlreadyConfiguredRegions();

        const dropdown = dialog.locator(compBulkConfigurationsLocators.fieldRegionCode);
        await this.clickElement(dropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        const options = panel.locator('.p-dropdown-item');
        await options.first().waitFor({ state: 'visible', timeout: 10000 });
        const count = await options.count();
        for (let i = 0; i < count; i++) {
            const text = (await options.nth(i).textContent())?.trim() ?? '';
            if (!text) continue;
            const isTaken = alreadyConfigured.some(used => used.includes(text) || text.includes(used));
            if (!isTaken) {
                await options.nth(i).click();
                await this.page.waitForTimeout(300);
                console.log(`  Selected Region Code: "${text}" (not previously configured)`);
                return text;
            }
        }
        throw new Error('selectRegionCode: every dropdown option is already configured for this comp.');
    }

    async selectTransactionType(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Transaction Type${searchText ? ` matching "${searchText}"` : ''}...`);
        return this.selectDropdownOption(dialog.locator(compBulkConfigurationsLocators.fieldTransactionType), searchText);
    }

    async selectCasinoBonusTemplate(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Casino Bonus Template${searchText ? ` matching "${searchText}"` : ''}...`);
        return this.selectDropdownOption(dialog.locator(compBulkConfigurationsLocators.fieldCasinoBonusTemplate), searchText);
    }

    async selectPushNotificationTemplate(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Push Notification Template${searchText ? ` matching "${searchText}"` : ''}...`);
        return this.selectDropdownOption(dialog.locator(compBulkConfigurationsLocators.fieldPushNotificationTemplate), searchText);
    }

    async selectSmsNotificationTemplate(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting SMS Notification Template${searchText ? ` matching "${searchText}"` : ''}...`);
        return this.selectDropdownOption(dialog.locator(compBulkConfigurationsLocators.fieldSmsNotificationTemplate), searchText);
    }

    async selectBanner(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting Banner${searchText ? ` matching "${searchText}"` : ''}...`);
        return this.selectDropdownOption(dialog.locator(compBulkConfigurationsLocators.fieldBanner), searchText);
    }

    // ── Bands (Edit / Delete) ────────────────────────────────────────────────────
    // Bands render as one flat list further down the Configurations page, not nested per
    // Configuration card — see compBulkConfigurationsLocators.bandRow.

    /**
     * Locates a specific Band row by its Boost Amount value — the one field a caller can make
     * reliably unique per test run (unlike Minimum/Maximum, which tests reuse fixed valid
     * values for), so this scopes to the exact Band automation just created rather than any
     * pre-existing one. Both :has() clauses apply to the SAME detail-item div, requiring it to
     * carry both the "Boost Amount:" label and that exact value — not just either one anywhere
     * in the row.
     */
    getBandByBoostAmount(boostAmount: string): Locator {
        return this.page.locator(
            `${compBulkConfigurationsLocators.bandRow}:has(${compBulkConfigurationsLocators.bandDetailItem}:has(label:text-is("Boost Amount:")):has(span:text-is("${boostAmount}")))`
        );
    }

    /** Opens the given Band row's kebab ("⋮") menu and clicks Edit. */
    async clickEditOnBand(boostAmount: string): Promise<void> {
        console.log(`Clicking Edit on Band with Boost Amount "${boostAmount}"...`);
        const band = this.getBandByBoostAmount(boostAmount);
        await band.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = band.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const editItem = this.page.locator(compBulkConfigurationsLocators.editMenuItem);
        await editItem.waitFor({ state: 'visible', timeout: 5000 });
        await editItem.click();
        await this.page.waitForTimeout(500);
    }

    /** Opens the given Band row's kebab ("⋮") menu and clicks Delete. */
    async clickDeleteOnBand(boostAmount: string): Promise<void> {
        console.log(`Clicking Delete on Band with Boost Amount "${boostAmount}"...`);
        const band = this.getBandByBoostAmount(boostAmount);
        await band.waitFor({ state: 'visible', timeout: 15000 });
        const menuTrigger = band.locator(compBulkConfigurationsLocators.cardMenuTrigger);
        await this.clickElement(menuTrigger);

        const deleteItem = this.page.locator(compBulkConfigurationsLocators.deleteMenuItem);
        await deleteItem.waitFor({ state: 'visible', timeout: 5000 });
        await deleteItem.click();
        await this.page.waitForTimeout(500);
    }

    async clickYesOnDeleteDialog(): Promise<void> {
        console.log('Clicking Yes to confirm Band deletion...');
        await this.clickElement(this.page.locator(compBulkConfigurationsLocators.buttonYes));
        await this.page.waitForTimeout(500);
    }

    async clickNoOnDeleteDialog(): Promise<void> {
        console.log('Clicking No to cancel Band deletion...');
        await this.clickElement(this.page.locator(compBulkConfigurationsLocators.buttonNo));
        await this.page.waitForTimeout(500);
    }

    // ── Add Band dialog ─────────────────────────────────────────────────────────
    // Reached via a configuration card's kebab menu -> Add Band. Its Save/Cancel footer and
    // dialog wrapper are identical in markup to the Create/Edit Configuration dialog, so
    // getDialog()/clickSave()/clickCancel()/isSaveEnabled() above are reused as-is.

    async fillMinimumBandAmount(dialog: Locator, value: string) {
        console.log(`Filling Minimum Band Amount: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.bandFieldMinimumAmount), value);
    }

    async fillMaximumBandAmount(dialog: Locator, value: string) {
        console.log(`Filling Maximum Band Amount: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.bandFieldMaximumAmount), value);
    }

    async fillBoostAmount(dialog: Locator, value: string) {
        console.log(`Filling Boost Amount: "${value}"...`);
        await this.fillNumberField(dialog.locator(compBulkConfigurationsLocators.bandFieldBoostAmount), value);
    }

    async selectBandTransactionType(dialog: Locator, searchText?: string): Promise<string> {
        console.log(`Selecting (Add Band) Transaction Type${searchText ? ` matching "${searchText}"` : ''}...`);
        return this.selectDropdownOption(dialog.locator(compBulkConfigurationsLocators.bandFieldTransactionType), searchText);
    }

    /** Toggles the Is Percentage Amount checkbox — id is on the native input, not a wrapper
     * (opposite of this file's other 4 checkboxes), so it's targeted via a :has() scope instead
     * of toggleCheckboxById. */
    async toggleIsPercentageAmount() {
        console.log('Toggling Is Percentage Amount checkbox...');
        const box = this.page.locator(`.p-checkbox:has(#${compBulkConfigurationsLocators.bandCheckboxIsPercentageAmount}) .p-checkbox-box`);
        await CommonUtils.highlightElement(box);
        await box.click({ force: true });
        await this.page.waitForTimeout(300);
    }

    async isPercentageAmountChecked(): Promise<boolean> {
        return await this.page.locator(`#${compBulkConfigurationsLocators.bandCheckboxIsPercentageAmount}`).isChecked();
    }

    // ── Checkboxes ──────────────────────────────────────────────────────────────
    // PrimeNG renders a clickable .p-checkbox-box div with its own visually-hidden native input
    // sitting on top — force bypasses the resulting hit-test failure (same pattern already
    // proven on Comp Bulk's own Create dialog). Unlike that dialog, the id here is on the
    // wrapper, not the input, so both the click target and the checked-state read are scoped
    // via `#id` as the wrapper, not `#id` as the input itself.

    private async toggleCheckboxById(id: string, label: string) {
        console.log(`Toggling ${label} checkbox...`);
        const box = this.page.locator(`#${id} .p-checkbox-box`);
        await CommonUtils.highlightElement(box);
        await box.click({ force: true });
        await this.page.waitForTimeout(300);
    }

    async isCheckboxChecked(id: string): Promise<boolean> {
        return await this.page.locator(`#${id} input`).isChecked();
    }

    async toggleSendPushNotification() {
        await this.toggleCheckboxById(compBulkConfigurationsLocators.checkboxSendPush, 'Push Notification');
    }

    async toggleSendSmsNotification() {
        await this.toggleCheckboxById(compBulkConfigurationsLocators.checkboxSendSms, 'SMS Notification');
    }

    async toggleCompValueProvided() {
        await this.toggleCheckboxById(compBulkConfigurationsLocators.checkboxCompValueProvided, 'Comp Value Provided');
    }

    async toggleAllowMultipleComp() {
        await this.toggleCheckboxById(compBulkConfigurationsLocators.checkboxAllowMultipleComp, 'Allow Multiple Comp');
    }

    // ── Save / Cancel ───────────────────────────────────────────────────────────

    async clickSave(dialog: Locator) {
        console.log('Clicking Save button...');
        const saveBtn = dialog.locator(compBulkConfigurationsLocators.buttonSave);
        await saveBtn.waitFor({ state: 'visible' });
        await CommonUtils.highlightElement(saveBtn);
        // Same global loading overlay bug already fixed elsewhere in this suite
        // (BasePage.clickElement / CompsBulkPage.clickSave) — wait it out before clicking.
        await this.page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        // A disabled button never becomes actionable, so a plain click() would hang for the
        // full action timeout on negative-path tests that intentionally leave Save disabled.
        await saveBtn.click({ timeout: 8000 }).catch(() => {});
        await this.page.waitForTimeout(1000);
    }

    async clickCancel(dialog: Locator) {
        console.log('Clicking Cancel button...');
        const cancelBtn = dialog.locator(compBulkConfigurationsLocators.buttonCancel);
        await this.clickElement(cancelBtn);
        await this.page.waitForTimeout(500);
    }

    async isSaveEnabled(dialog: Locator): Promise<boolean> {
        const saveBtn = dialog.locator(compBulkConfigurationsLocators.buttonSave);
        return !(await saveBtn.evaluate(el => el.hasAttribute('disabled') || el.classList.contains('p-disabled')));
    }

    async getToastText(timeout: number = 15000): Promise<string> {
        const toast = this.page.locator('.p-toast-message').first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }
}

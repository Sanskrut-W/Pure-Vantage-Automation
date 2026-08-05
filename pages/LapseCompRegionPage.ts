import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { lapseCompRegionLocators } from '../locators/lapseCompRegionLocators';

export class LapseCompRegionPage extends BasePage {
    readonly createRegionConfigBtn: Locator;
    readonly dialog: Locator;
    readonly regionCodeDropdown: Locator;
    readonly pushNotificationTemplateDropdown: Locator;
    readonly smsTemplateDropdown: Locator;
    readonly tagNameDropdown: Locator;
    readonly tagValueInput: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly toastMessage: Locator;
    readonly backButton: Locator;

    constructor(page: Page) {
        super(page);
        this.createRegionConfigBtn = this.page.locator(lapseCompRegionLocators.createRegionConfigBtn);
        this.dialog = this.page.locator(lapseCompRegionLocators.dialog).first();
        this.regionCodeDropdown = this.page.locator(lapseCompRegionLocators.fieldRegionCode);
        this.pushNotificationTemplateDropdown = this.page.locator(lapseCompRegionLocators.fieldPushNotificationTemplate);
        this.smsTemplateDropdown = this.page.locator(lapseCompRegionLocators.fieldSmsTemplate);
        this.tagNameDropdown = this.page.locator(lapseCompRegionLocators.fieldTagName);
        this.tagValueInput = this.page.locator(lapseCompRegionLocators.fieldTagValue);
        this.saveBtn = this.dialog.getByRole('button', { name: 'Save', exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
        this.toastMessage = this.page.locator(lapseCompRegionLocators.toastMessage).first();
        this.backButton = this.page.locator(lapseCompRegionLocators.backButton);
    }

    /**
     * Opens Create Region Config. Confirmed live: the Region Code dropdown isn't reliably
     * ready to interact with the very first time this popup opens — opening it once, then
     * cancelling out and reopening the popup fresh, is what actually makes the dropdown work
     * when a caller goes to select from it afterward.
     */
    async clickCreateRegionConfig() {
        console.log('Clicking Create Region Config button...');
        await this.clickElement(this.createRegionConfigBtn);
        await this.page.waitForTimeout(500);
        await this.waitForPopupLoad();

        console.log('Warm-up: opening Region Code dropdown, then cancelling and reopening fresh...');
        await this.clickElement(this.regionCodeDropdown);
        await this.page.waitForTimeout(300);
        await this.clickCancel();
        await this.dialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

        await this.clickElement(this.createRegionConfigBtn);
        await this.page.waitForTimeout(500);
    }

    async waitForPopupLoad() {
        await this.dialog.waitFor({ state: 'visible' });
        await this.dialog.locator('.p-skeleton').first().waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {});
    }

    /**
     * Opens a PrimeNG-style dropdown and clicks its first real option, returning its text.
     * Region Code is mandatory and always has data — unlike selectFirstDropdownOption below,
     * this does NOT race against an "empty" placeholder, since that race previously caused a
     * transient/slow-loading options list to be wrongly treated as genuinely empty, silently
     * skipping this required field and leaving Save disabled.
     */
    async selectFirstAvailableRegionCode(): Promise<string> {
        console.log('Selecting first available Region Code...');
        await this.clickElement(this.regionCodeDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await this.regionCodeDropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }

        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 20000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    /**
     * Opens a PrimeNG-style dropdown and clicks whichever option renders first, returning its
     * text — mirrors the identical "first available option" pattern already used across this
     * suite (e.g. CompBulkConfigurationsPage.selectDropdownOption). Used only for the 3 OPTIONAL
     * dropdowns (Push Notification Template, SMS Template, Tag Name), which can genuinely have
     * zero options configured in this environment.
     */
    private async selectFirstDropdownOption(dropdown: Locator): Promise<string> {
        await this.clickElement(dropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await dropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }

        // Some of this dialog's optional dropdowns (Push Notification Template, SMS Template,
        // Tag Name) can have zero options configured in this environment — confirmed live via
        // the panel's own "No available options" placeholder (PrimeNG's standard
        // .p-dropdown-empty-message). Race the two rather than checking the empty-message
        // alone with a short timeout BEFORE options have had a chance to render — confirmed
        // live that a short pre-check can catch a transient loading state and wrongly skip a
        // MANDATORY field (Region Code) that does have real options, not just the genuinely
        // empty optional ones.
        const option = panel.locator('.p-dropdown-item').first();
        const emptyMessage = panel.locator('.p-dropdown-empty-message');
        await Promise.race([
            option.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
            emptyMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {}),
        ]);

        if (!(await option.isVisible({ timeout: 500 }).catch(() => false))) {
            console.warn('selectFirstDropdownOption: no options available for this dropdown — skipping.');
            await this.page.keyboard.press('Escape').catch(() => {});
            // Let the panel's own close animation finish before the caller touches the next
            // field — confirmed live: skipping this settle wait (unlike every other path in
            // this method, which already waits 300ms after its own action) left the next
            // dropdown's element reporting "not stable" / "detached from DOM" on click.
            await this.page.waitForTimeout(300);
            return '';
        }

        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    async selectFirstAvailablePushNotificationTemplate(): Promise<string> {
        console.log('Selecting first available Push Notification Template...');
        return this.selectFirstDropdownOption(this.pushNotificationTemplateDropdown);
    }

    async selectFirstAvailableSmsTemplate(): Promise<string> {
        console.log('Selecting first available SMS Template...');
        return this.selectFirstDropdownOption(this.smsTemplateDropdown);
    }

    async selectFirstAvailableTagName(): Promise<string> {
        console.log('Selecting first available Tag Name...');
        return this.selectFirstDropdownOption(this.tagNameDropdown);
    }

    async fillTagValue(value: string) {
        console.log(`Filling Tag Value: "${value}"...`);
        await this.fillInput(this.tagValueInput, value);
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

    async clickBackButton() {
        console.log('Clicking Back button...');
        await this.clickElement(this.backButton);
    }

    getRows(): Locator {
        return this.page.locator('table tbody tr, .p-datatable-tbody tr');
    }

    getRowByIndex(index: number = 0): Locator {
        return this.getRows().nth(index);
    }

    /**
     * Operates on the ONLY row in the table — every caller creates its own disposable Region
     * Configuration on an otherwise-empty list first, so index 0 unambiguously identifies it.
     * NOT filtered by Region Code text: confirmed live, the table shows an abbreviated code
     * (e.g. "BWA") that doesn't match the dropdown option's full display text (e.g. "Betway
     * Agents") returned by selectFirstAvailableRegionCode, so filtering on that text never
     * matched the real row.
     */
    async clickEditOnRow(): Promise<void> {
        console.log('Clicking Edit on the Region Configuration row...');
        const row = this.getRowByIndex(0);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(lapseCompRegionLocators.editBtn));
    }

    async clickDeleteOnRow(): Promise<void> {
        console.log('Clicking Delete on the Region Configuration row...');
        const row = this.getRowByIndex(0);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(lapseCompRegionLocators.deleteBtn));
    }

    async clickYesOnConfirmDialog() {
        console.log('Clicking Yes on confirmation dialog...');
        const yesBtn = this.page.locator(lapseCompRegionLocators.buttonYes);
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnConfirmDialog() {
        console.log('Clicking No on confirmation dialog...');
        const noBtn = this.page.locator(lapseCompRegionLocators.buttonNo);
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
    }
}

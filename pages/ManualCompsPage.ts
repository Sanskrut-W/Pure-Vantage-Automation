import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { manualCompsLocators } from '../locators/manualCompsLocators';
import { CommonUtils } from '../utils/commonUtils';

export class ManualCompsPage extends BasePage {
    readonly createManualCompBtn: Locator;
    readonly dialog: Locator;
    readonly compCodeDropdown: Locator;
    readonly regionCodeDropdown: Locator;
    readonly accountIdInput: Locator;
    readonly mobileNumberInput: Locator;
    readonly compValueInput: Locator;
    readonly compFreeBetsInput: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly toastMessage: Locator;

    constructor(page: Page) {
        super(page);
        this.createManualCompBtn = this.page.locator(manualCompsLocators.createManualCompBtn);
        this.dialog = this.page.locator(manualCompsLocators.dialog).first();
        this.compCodeDropdown = this.page.locator(manualCompsLocators.fieldCompCode);
        this.regionCodeDropdown = this.page.locator(manualCompsLocators.fieldRegionCode);
        this.accountIdInput = this.page.locator(manualCompsLocators.fieldAccountId);
        this.mobileNumberInput = this.page.locator(manualCompsLocators.fieldMobileNumber);
        this.compValueInput = this.page.locator(manualCompsLocators.fieldCompValue);
        this.compFreeBetsInput = this.page.locator(manualCompsLocators.fieldCompFreeBets);
        this.saveBtn = this.dialog.getByRole('button', { name: 'Save', exact: true });
        this.cancelBtn = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
        this.toastMessage = this.page.locator(manualCompsLocators.toastMessage).first();
    }

    async clickCreateManualComp() {
        console.log('Clicking Create Manual Comp button...');
        await this.clickElement(this.createManualCompBtn);
    }

    async waitForPopupLoad() {
        await this.dialog.waitFor({ state: 'visible' });
        await this.dialog.locator('.p-skeleton').first().waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {});
    }

    /**
     * Opens a PrimeNG-style dropdown and clicks whichever option renders first, returning its
     * text — mirrors the identical "first available option" pattern already used across this
     * suite (e.g. CompBulkConfigurationsPage.selectDropdownOption).
     */
    private async selectFirstDropdownOption(dropdown: Locator): Promise<string> {
        await this.clickElement(dropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        const panelOpened = await panel.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
        if (!panelOpened) {
            await dropdown.click({ force: true }).catch(() => {});
            await panel.waitFor({ state: 'visible', timeout: 5000 });
        }

        const option = panel.locator('.p-dropdown-item').first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        const text = (await option.textContent())?.trim() ?? '';
        await option.click();
        await this.page.waitForTimeout(300);
        return text;
    }

    async selectFirstAvailableCompCode(): Promise<string> {
        console.log('Selecting first available Comp Code...');
        return this.selectFirstDropdownOption(this.compCodeDropdown);
    }

    async selectFirstAvailableRegionCode(): Promise<string> {
        console.log('Selecting first available Region Code...');
        return this.selectFirstDropdownOption(this.regionCodeDropdown);
    }

    async fillAccountId(value: string) {
        console.log(`Filling Account ID: "${value}"...`);
        await this.fillInput(this.accountIdInput, value);
    }

    async fillMobileNumber(value: string) {
        console.log(`Filling Mobile Number: "${value}"...`);
        await this.fillInput(this.mobileNumberInput, value);
    }

    /**
     * Clears and types a value into a PrimeNG InputNumber field, verifying it actually landed
     * and blurring afterward — the same decimal-mode blur-timing fix already proven throughout
     * this suite (e.g. CompBulkConfigurationsPage.fillNumberField): a plain .fill() sets the DOM
     * value but PrimeNG's InputNumber doesn't reliably pick that up into its Angular model, and
     * this app recomputes Save's disabled state on blur, not on input.
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

    async fillCompValue(value: string) {
        console.log(`Filling Comp Value: "${value}"...`);
        await this.fillNumberField(this.compValueInput, value);
    }

    async fillCompFreeBets(value: string) {
        console.log(`Filling Comp Free Bets: "${value}"...`);
        await this.fillNumberField(this.compFreeBetsInput, value);
    }

    /**
     * Fills every mandatory field with valid data (a fresh GUID Account ID, a random Mobile
     * Number, Comp Value 1, Comp Free Bets 0) and returns the Account ID used — the only field
     * guaranteed unique per call, used afterward to find this exact row for Approve/Decline.
     * Individual tests skip whichever field they're deliberately leaving blank/invalid.
     */
    async fillMandatoryFields(overrides?: {
        accountId?: string;
        mobileNumber?: string;
        skip?: Array<'compCode' | 'regionCode' | 'accountId' | 'mobileNumber' | 'compValue' | 'compFreeBets'>;
    }): Promise<string> {
        const skip = overrides?.skip ?? [];
        if (!skip.includes('compCode')) {
            await this.selectFirstAvailableCompCode();
        }
        if (!skip.includes('regionCode')) {
            await this.selectFirstAvailableRegionCode();
        }
        const accountId = overrides?.accountId ?? CommonUtils.generateUUID();
        if (!skip.includes('accountId')) {
            await this.fillAccountId(accountId);
        }
        if (!skip.includes('mobileNumber')) {
            // Must carry the "27" (South Africa) prefix the app's validator expects — confirmed
            // against test-data/bulk_comp.csv's real, accepted MobileNumber values (e.g.
            // "271324555"). A plain timestamp slice has no such prefix and always fails
            // validation ("Field must be a valid mobile number"), leaving Save disabled forever.
            await this.fillMobileNumber(overrides?.mobileNumber ?? ('27' + String(Date.now()).slice(-7)));
        }
        if (!skip.includes('compValue')) {
            await this.fillCompValue('1');
        }
        if (!skip.includes('compFreeBets')) {
            await this.fillCompFreeBets('0');
        }
        return accountId;
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

    /**
     * Locates a Manual Comp row by its (unique, automation-generated) Account ID — there's no
     * description/title field on this form, so Account ID is the one value guaranteed not to
     * collide with any other row. ASSUMPTION: Approve/Decline render directly in the row (no
     * kebab), mirroring Comp Bulk's Process/Cancel — not yet confirmed against the real table
     * markup for this feature.
     */
    getRowByAccountId(accountId: string): Locator {
        return this.page.locator('table tbody tr, .p-datatable-tbody tr').filter({ hasText: accountId }).first();
    }

    async clickApproveOnRow(accountId: string) {
        console.log(`Clicking Approve on Manual Comp row (Account ID: "${accountId}")...`);
        const row = this.getRowByAccountId(accountId);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(manualCompsLocators.approveBtn));
    }

    async clickDeclineOnRow(accountId: string) {
        console.log(`Clicking Decline on Manual Comp row (Account ID: "${accountId}")...`);
        const row = this.getRowByAccountId(accountId);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.locator(manualCompsLocators.declineBtn));
    }

    async clickYesOnConfirmDialog() {
        console.log('Clicking Yes on confirmation dialog...');
        const yesBtn = this.page.locator(manualCompsLocators.buttonYes);
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(yesBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickNoOnConfirmDialog() {
        console.log('Clicking No on confirmation dialog...');
        const noBtn = this.page.locator(manualCompsLocators.buttonNo);
        await noBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(noBtn);
        await this.page.waitForTimeout(500);
    }
}

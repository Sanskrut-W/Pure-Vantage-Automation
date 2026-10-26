import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { messageTemplatesLocators } from '../locators/messageTemplatesLocators';

export class MessageTemplatesPage extends BasePage {
    readonly searchInput:       Locator;
    readonly regionDropdown:    Locator;
    readonly refreshBtn:        Locator;
    readonly createTemplateBtn: Locator;
    readonly dataTable:         Locator;
    readonly editBtn:           Locator;
    readonly configBtn:         Locator;
    readonly duplicateBtn:      Locator;
    readonly deleteBtn:         Locator;
    readonly paginatorBottom:   Locator;
    readonly pageButtons:       Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput       = page.locator(messageTemplatesLocators.searchInput);
        this.regionDropdown    = page.locator(messageTemplatesLocators.regionDropdown);
        this.refreshBtn        = page.locator(messageTemplatesLocators.refreshBtn);
        this.createTemplateBtn = page.locator(messageTemplatesLocators.createTemplateBtn);
        this.dataTable         = page.locator(messageTemplatesLocators.dataTable);
        this.editBtn           = page.locator(messageTemplatesLocators.editBtn);
        this.configBtn         = page.locator(messageTemplatesLocators.configBtn);
        this.duplicateBtn      = page.locator(messageTemplatesLocators.duplicateBtn);
        this.deleteBtn         = page.locator(messageTemplatesLocators.deleteBtn);
        this.paginatorBottom   = page.locator(messageTemplatesLocators.paginatorBottom);
        this.pageButtons       = page.locator(messageTemplatesLocators.pageButtons);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName}`);
        await this.clickElement(this.regionDropdown);
        await this.page.waitForTimeout(500);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await optionLocator.scrollIntoViewIfNeeded();
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
        try {
            await this.editBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            console.log(`selectRegion('${regionName}'): no Edit buttons visible — table may be empty`);
        }
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

    async clickCreateTemplate() {
        await this.clickElement(this.createTemplateBtn);
        await this.page.waitForTimeout(500);
    }

    async clickEditFirst() {
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickConfigFirst() {
        await this.clickElement(this.configBtn.first());
        await this.page.waitForTimeout(500);
    }

    /**
     * Opens the Configure Template popup for the first row of a given Type (e.g. "Push"),
     * falling back to the first row overall if none matches. clickConfigFirst() blindly opens
     * whatever row is first in Modified Date order — but the Configure popup's rich text
     * editor and inline Preview card only render for certain template types (confirmed: an
     * SMS-type row's popup has neither), so a stray SMS/etc. template sorting to the top
     * silently breaks any test asserting on those elements. Targeting a known type sidesteps
     * that data churn instead of assuming row order.
     */
    async clickConfigForType(type: string) {
        const rows = this.dataTable.locator('tbody tr');
        const typedRow = rows.filter({ has: this.page.locator(`td:nth-child(2):text-is("${type}")`) }).first();
        const target = (await typedRow.count()) > 0 ? typedRow : rows.first();
        await this.clickElement(target.locator(messageTemplatesLocators.configBtn));
        await this.page.waitForTimeout(500);
    }

    async clickDuplicateFirst() {
        await this.clickElement(this.duplicateBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickDeleteFirst() {
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(500);
    }

    async closeDialogWithCancel() {
        const cancelBtn = this.page.locator(messageTemplatesLocators.dialogCancelBtn).first();
        if (await cancelBtn.isVisible()) {
            await this.clickElement(cancelBtn);
            await this.page.waitForTimeout(300);
        }
    }

    async getSortableColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th.p-sortable-column .p-column-title').allInnerTexts();
        return titles.map(t => t.trim());
    }

    async getColumnTitles(): Promise<string[]> {
        const titles = await this.page.locator('th .p-column-title').allInnerTexts();
        return titles.map(t => t.trim()).filter(t => t.length > 0);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Row actions by Template Name (instead of "first row", which churns with Modified Date)
    // ═══════════════════════════════════════════════════════════════════════

    getRowByTemplateName(templateName: string): Locator {
        return this.dataTable.locator('tbody tr', { hasText: templateName }).first();
    }

    async getTypeForTemplate(templateName: string): Promise<string> {
        return ((await this.getRowByTemplateName(templateName).locator('td:nth-child(2)').textContent()) ?? '').trim();
    }

    async clickEditForTemplate(templateName: string) {
        console.log(`Clicking Edit for template "${templateName}"...`);
        await this.clickElement(this.getRowByTemplateName(templateName).locator(messageTemplatesLocators.editBtn));
        await this.page.locator(messageTemplatesLocators.dialog).first().waitFor({ state: 'visible', timeout: 10000 });
    }

    async clickConfigForTemplate(templateName: string) {
        console.log(`Clicking Config for template "${templateName}"...`);
        await this.clickElement(this.getRowByTemplateName(templateName).locator(messageTemplatesLocators.configBtn));
        await this.page.locator(messageTemplatesLocators.dialog).first().waitFor({ state: 'visible', timeout: 10000 });
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Create / Update popup
    // ═══════════════════════════════════════════════════════════════════════

    /** Creates a template with the given name, region and delivery — every other mandatory
     * dropdown takes its first option (same approach as TC-20). Waits for the popup to close. */
    async createTemplate(templateName: string, regionName: string, delivery: 'SMS Notification' | 'Push Notification') {
        console.log(`Creating template "${templateName}" (${regionName}, ${delivery})...`);
        await this.clickCreateTemplate();
        const dialog = this.page.locator(messageTemplatesLocators.dialog).first();
        await dialog.waitFor({ state: 'visible', timeout: 10000 });

        await this.selectFirstOption(dialog.locator(messageTemplatesLocators.notificationTypeDropdown));
        await this.fillInput(dialog.locator(messageTemplatesLocators.templateNameInput), templateName);
        await this.selectDropdown(dialog.locator(messageTemplatesLocators.regionCodeDropdown), regionName);
        await this.selectDropdown(dialog.locator(messageTemplatesLocators.notificationDeliveryDropdown), delivery);
        await this.selectFirstOption(dialog.locator(messageTemplatesLocators.notificationCampaignDropdown));
        await this.selectFirstOption(dialog.locator(messageTemplatesLocators.notificationStyleDropdown));
        await this.selectFirstOption(dialog.locator(messageTemplatesLocators.notificationCategoryDropdown));

        await this.clickDialogSave();
        await dialog.waitFor({ state: 'hidden', timeout: 15000 });
        await this.page.waitForLoadState('networkidle');
    }

    async selectFirstOption(dropdownLocator: Locator) {
        await this.clickElement(dropdownLocator);
        const option = this.page.locator(messageTemplatesLocators.dropdownItem).first();
        await option.waitFor({ state: 'visible', timeout: 5000 });
        await option.click();
        await this.page.waitForTimeout(300);
    }

    async selectNotificationDelivery(delivery: 'SMS Notification' | 'Push Notification') {
        console.log(`Selecting Notification Delivery: ${delivery}`);
        const dialog = this.page.locator(messageTemplatesLocators.dialog).first();
        await this.selectDropdown(dialog.locator(messageTemplatesLocators.notificationDeliveryDropdown), delivery);
    }

    async clickDialogSave() {
        console.log('Clicking Save...');
        await this.clickElement(this.page.locator(messageTemplatesLocators.dialog).first().locator('button[aria-label="Save"]'));
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Configure Template popup — SMS body
    // ═══════════════════════════════════════════════════════════════════════

    /** Picks the Culture in the Configure popup. Confirmed live: a template with no culture
     * configured yet keeps the SMS textarea disabled until one is chosen. */
    async selectConfigCulture(cultureName: string) {
        console.log(`Selecting Culture: ${cultureName}`);
        const dialog = this.page.locator(messageTemplatesLocators.dialog).first();
        await this.clickElement(dialog.locator(messageTemplatesLocators.configCultureDropdown));
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 10000 });

        // Confirmed live: this panel's filter box returns "No results found" for the full label
        // "English (en-US)" but lists it for "English" — so BasePage.selectDropdown (which types
        // the full label) can't be used here. Filter on the first word, then click the exact option.
        await panel.locator('input').first().fill(cultureName.split(' ')[0]);
        await this.page.waitForTimeout(500);
        await this.clickElement(panel.locator(messageTemplatesLocators.dropdownItem.replace('.p-dropdown-panel ', '')).filter({ hasText: new RegExp(`^\\s*${cultureName.replace(/[()]/g, '\\$&')}\\s*$`) }).first());
        await this.page.waitForTimeout(500);
    }

    async fillSmsBody(body: string) {
        console.log(`Filling SMS body: "${body}"`);
        await this.fillInput(this.page.locator(messageTemplatesLocators.smsBodyTextarea).first(), body);
    }

    async getToastText(timeout: number = 10000): Promise<string> {
        const toast = this.page.locator(messageTemplatesLocators.toastMessage).first();
        const appeared = await toast.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (!appeared) return '';
        return (await toast.textContent())?.trim() ?? '';
    }

    /** Waits for any open toast to close so the next getToastText() reads the NEXT toast, not
     * the previous one still fading out. */
    async waitForToastToClear() {
        await this.page.locator(messageTemplatesLocators.toastMessage).first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  Delete cleanup
    // ═══════════════════════════════════════════════════════════════════════

    /** Deletes a template by name. Swallows errors so it's safe to call unconditionally from
     * afterEach, even if the test failed before the template was created. */
    async deleteTemplateIfPresent(templateName: string) {
        try {
            await this.closeDialogWithCancel();
            await this.searchFor(templateName);
            const row = this.getRowByTemplateName(templateName);
            const isPresent = await row.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
            if (!isPresent) {
                console.log(`Delete cleanup skipped for "${templateName}" — row not present.`);
                return;
            }
            await this.clickElement(row.locator(messageTemplatesLocators.deleteBtn));
            const confirmBtn = this.page.locator(messageTemplatesLocators.confirmOkBtn).first();
            await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
            await this.clickElement(confirmBtn);
            await this.page.waitForLoadState('networkidle');
            await row.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
            console.log(`Delete cleanup completed for "${templateName}".`);
        } catch (error) {
            console.log(`Delete cleanup failed for "${templateName}": ${error}`);
        }
    }
}

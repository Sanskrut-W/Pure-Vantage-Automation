import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { campaignLocators } from '../locators/campaignLocators';

export class CampaignPage extends BasePage {
    readonly selectRegionBtn: Locator;
    readonly createCampaignBtn: Locator;

    readonly editBtn: Locator;
    readonly linkWorkflowBtn: Locator;
    readonly detailsBtn: Locator;
    readonly deleteBtn: Locator;
    readonly searchInput: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    /////// Create Campaign Popup ///////
    readonly createCampaignDialog: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    /////// Link Workflow Popup ///////
    readonly linkWorkflowDialog: Locator;
    readonly workflowDropdown: Locator;
    readonly linkWorkflowSaveBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.selectRegionBtn = page.getByRole('button', { name: campaignLocators.buttonSelectRegion });
        this.createCampaignBtn = page.getByRole('button', { name: campaignLocators.buttonCreateCampaign });

        // Use getByRole for robust accessibility-based button querying
        this.editBtn = page.getByRole('button', { name: campaignLocators.buttonEdit, exact: true });
        this.linkWorkflowBtn = page.getByRole('button', { name: campaignLocators.buttonLinkWorkflow, exact: true });
        this.detailsBtn = page.getByRole('button', { name: campaignLocators.buttonDetails, exact: true });
        this.deleteBtn = page.getByRole('button', { name: campaignLocators.buttonDelete, exact: true });
        this.searchInput = page.locator(campaignLocators.searchInput);
        this.confirmYesBtn = page.locator(campaignLocators.confirmYesBtn);
        this.confirmNoBtn = page.locator(campaignLocators.confirmNoBtn);

        this.createCampaignDialog = page.locator(campaignLocators.popupDialog);
        this.saveBtn = page.locator(campaignLocators.saveBtn);
        this.cancelBtn = page.locator(campaignLocators.cancelBtn);

        // Same generic dialog-role locator as createCampaignDialog — named separately
        // for clarity since Link Workflow tests reason about a different popup.
        this.linkWorkflowDialog = page.locator(campaignLocators.popupDialog);
        this.workflowDropdown = page.locator(campaignLocators.workflowDropdown);
        this.linkWorkflowSaveBtn = page.locator(campaignLocators.linkWorkflowSaveBtn);
    }

    /**
     * Clicks the Select Region button if visible on the Campaign Management page.
     */
    async clickSelectRegion() {
        console.log('Clicking Select Region button on Campaign Management...');
        if (await this.selectRegionBtn.count() > 0) {
            await this.clickElement(this.selectRegionBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Clicks the Select Region button and selects a specific region by name.
     */
    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName}`);
        await this.clickSelectRegion();
        // getByRole('option', ...) on its own also matches a hidden native <option> inside
        // a shadow #component-container — scoping to the visible listbox avoids that
        // strict-mode violation.
        const optionLocator = this.page.getByRole('listbox').getByRole('option', { name: regionName, exact: true });
        await optionLocator.scrollIntoViewIfNeeded();
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(500);
    }

    /**
     * Clicks the Create Campaign button if visible on the Campaign Management page.
     */
    async clickCreateCampaign() {
        console.log('Clicking Create Campaign button...');
        if (await this.createCampaignBtn.count() > 0) {
            await this.clickElement(this.createCampaignBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Performs Select Region + Create Campaign in sequence.
     */
    async selectRegionAndCreateCampaign() {
        await this.clickSelectRegion();
        await this.clickCreateCampaign();
    }

    async clickEditFirstCampaign() {
        console.log('Clicking Edit button on first campaign...');
        await this.clickElement(this.editBtn.first());
    }

    async clickLinkWorkflowFirstCampaign() {
        console.log('Clicking Link Workflow button on first campaign...');
        await this.clickElement(this.linkWorkflowBtn.first());
    }

    async clickDetailsFirstCampaign() {
        console.log('Clicking Details button on first campaign...');
        await this.clickElement(this.detailsBtn.first());
    }

    async clickDeleteFirstCampaign() {
        console.log('Clicking Delete button on first campaign...');
        await this.clickElement(this.deleteBtn.first());
    }

    async searchCampaign(name: string) {
        console.log(`Searching for Campaign: ${name}`);
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(500);
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async clickConfirmYes() {
        console.log('Clicking Yes on the confirmation popup...');
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForTimeout(500);
    }

    async clickConfirmNo() {
        console.log('Clicking No on the confirmation popup...');
        await this.clickElement(this.confirmNoBtn);
        await this.page.waitForTimeout(500);
    }

    async deleteCampaignByName(name: string) {
        console.log(`Deleting Campaign: ${name}`);
        await this.searchCampaign(name);
        await this.clickElement(this.deleteBtn.first());
        await this.clickConfirmYes();
    }

    /////// Create Campaign Popup Methods ///////

    private fieldGroup(labelText: string): Locator {
        return this.createCampaignDialog.locator(`${campaignLocators.inputGroup}:has(label:text-is("${labelText}"))`);
    }

    async fillCampaignName(name: string) {
        console.log(`Filling Campaign Name: ${name}`);
        await this.fillInput(this.fieldGroup(campaignLocators.labelCampaignName).locator('input'), name);
    }

    async fillCampaignDescription(description: string) {
        console.log(`Filling Campaign Description: ${description}`);
        await this.fillInput(this.fieldGroup(campaignLocators.labelCampaignDescription).locator('input'), description);
    }

    async fillObjective(objective: string) {
        console.log(`Filling Objective: ${objective}`);
        await this.fillInput(this.fieldGroup(campaignLocators.labelObjective).locator('input'), objective);
    }

    async fillReportingMetrics(metrics: string) {
        console.log(`Filling Reporting Metrics: ${metrics}`);
        await this.fillInput(this.fieldGroup(campaignLocators.labelReportingMetrics).locator('input'), metrics);
    }

    private async pickFirstAvailableCalendarDate(labelText: string) {
        const input = this.fieldGroup(labelText).locator('input');
        await input.click();
        await this.page.waitForTimeout(300);

        // PrimeNG calendar panel ids are generated per-render — read the real one via
        // aria-controls instead of assuming a fixed id.
        const panelId = await input.getAttribute('aria-controls');
        const panel = panelId ? this.page.locator(`#${panelId}`) : this.page.locator('.p-datepicker').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first().click();
        await this.page.waitForTimeout(300);

        if (await panel.isVisible().catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
            await this.page.waitForTimeout(300);
        }
    }

    async setStartDate() {
        console.log('Selecting Start Date...');
        await this.pickFirstAvailableCalendarDate(campaignLocators.labelStartDate);
    }

    async setEndDate() {
        console.log('Selecting End Date...');
        await this.pickFirstAvailableCalendarDate(campaignLocators.labelEndDate);
    }

    private async openMultiSelect(labelText: string): Promise<{ panel: Locator; container: Locator }> {
        const container = this.fieldGroup(labelText).locator('.p-multiselect');
        await this.clickElement(container);
        const panel = this.page.locator(campaignLocators.multiSelectPanel).last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        return { panel, container };
    }

    private async closeMultiSelect(container: Locator) {
        // Neither Escape (closes the whole Create Campaign dialog here) nor clicking
        // elsewhere in the dialog (the open panel can visually cover it) reliably closed
        // this multiselect variant — leaving it open kept the FormControl "dirty" and Save
        // permanently disabled. Re-clicking its own trigger toggles it shut, the same way
        // it was opened.
        await this.clickElement(container);
        await this.page.waitForTimeout(300);
    }

    async selectPromotionType(optionText: string) {
        console.log(`Selecting Promotion Type: ${optionText}`);
        const { panel, container } = await this.openMultiSelect(campaignLocators.labelPromotionType);
        await panel.locator(campaignLocators.multiSelectItem).filter({ hasText: optionText }).first().click();
        await this.closeMultiSelect(container);
    }

    async selectFirstPromotionType() {
        console.log('Selecting first available Promotion Type...');
        const { panel, container } = await this.openMultiSelect(campaignLocators.labelPromotionType);
        await panel.locator(campaignLocators.multiSelectItem).first().click();
        await this.closeMultiSelect(container);
    }

    async selectAllPromotionTypes() {
        console.log('Selecting all Promotion Types via the "Select All" checkbox...');
        const { panel, container } = await this.openMultiSelect(campaignLocators.labelPromotionType);
        await this.clickElement(panel.locator(campaignLocators.multiSelectHeaderCheckbox).first());
        await this.closeMultiSelect(container);
    }

    async selectCampaignRegion(regionName: string) {
        console.log(`Selecting Campaign Region: ${regionName}`);
        const { panel, container } = await this.openMultiSelect(campaignLocators.labelRegions);
        await panel.locator(campaignLocators.multiSelectItem).filter({ hasText: regionName }).first().click();
        await this.closeMultiSelect(container);
    }

    async selectAllCampaignRegions() {
        console.log('Selecting all Regions via the "Select All" checkbox...');
        const { panel, container } = await this.openMultiSelect(campaignLocators.labelRegions);
        await this.clickElement(panel.locator(campaignLocators.multiSelectHeaderCheckbox).first());
        await this.closeMultiSelect(container);
    }

    async clickSaveCampaign() {
        console.log('Clicking Save on Create Campaign popup...');
        await this.clickElement(this.saveBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickCancelCampaign() {
        console.log('Clicking Cancel on Create Campaign popup...');
        await this.clickElement(this.cancelBtn.first());
        await this.page.waitForTimeout(500);
    }

    /////// Link Workflow Popup Methods ///////

    async selectWorkflow(workflowName: string) {
        console.log(`Selecting Workflow: ${workflowName}`);
        await this.selectDropdown(this.workflowDropdown, workflowName);
    }

    async selectFirstWorkflow() {
        console.log('Selecting first available Workflow...');
        await this.clickElement(this.workflowDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('.p-dropdown-item').first().click();
    }

    async clickLinkWorkflowSave() {
        console.log('Clicking Link Workflow button in popup...');
        await this.clickElement(this.linkWorkflowSaveBtn.first());
        await this.page.waitForTimeout(500);
    }
}

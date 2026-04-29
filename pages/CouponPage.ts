import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { couponLocators } from '../locators/couponLocators';

export class CouponPage extends BasePage {
    /////// Landing Page Locator Properties ///////
    readonly searchNameInput: Locator;
    readonly searchEditedByInput: Locator;
    readonly selectRegionDropdown: Locator;
    readonly selectCompCodeDropdown: Locator;
    readonly selectRequirementTypeDropdown: Locator;
    readonly createBtn: Locator;
    readonly couponTable: Locator;
    readonly deleteBtn: Locator;
    readonly editBtn: Locator;
    readonly ellipsisMenuBtn: Locator;
    readonly paginatorNext: Locator;
    readonly paginatorPrev: Locator;
    readonly paginatorPages: Locator;
    readonly paginatorRowsPerPage: Locator;

    /////// Popup Dialog Locator Properties ///////
    readonly popupDialog: Locator;
    readonly popupTitle: Locator;
    readonly couponNameInput: Locator;
    readonly couponGroupInput: Locator;
    readonly descriptionTextarea: Locator;
    readonly compCodeDropdown: Locator;
    readonly campaignDropdown: Locator;
    readonly isGlobalCouponCheckbox: Locator;
    readonly expiryTimeInput: Locator;
    readonly expiryTimeUnitDropdown: Locator;
    readonly couponExpiryDatePicker: Locator;
    readonly addRegionBtn: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    /////// Confirmation Dialog Locator Properties ///////
    readonly confirmDialog: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    /////// Region Requirements Popup Locator Properties ///////
    readonly regionRequirementsDialog: Locator;

    /////// Toast Locator Properties ///////
    readonly successToast: Locator;
    readonly errorToast: Locator;

    constructor(page: Page) {
        super(page);

        /////// Landing Page Locators ///////
        this.searchNameInput = page.locator(couponLocators.searchNameInput);
        this.searchEditedByInput = page.locator(couponLocators.searchEditedByInput);
        this.selectRegionDropdown = page.locator(couponLocators.selectRegionDropdown);
        this.selectCompCodeDropdown = page.locator(couponLocators.selectCompCodeDropdown);
        this.selectRequirementTypeDropdown = page.locator(couponLocators.selectRequirementTypeDropdown);
        this.createBtn = page.getByRole('button', { name: couponLocators.createBtn });
        this.couponTable = page.locator(couponLocators.couponTable);
        this.deleteBtn = page.locator(couponLocators.deleteBtn);
        this.editBtn = page.locator(couponLocators.editBtn);
        this.ellipsisMenuBtn = page.locator(couponLocators.ellipsisMenuBtn);
        this.paginatorNext = page.locator(couponLocators.paginatorNext);
        this.paginatorPrev = page.locator(couponLocators.paginatorPrev);
        this.paginatorPages = page.locator(couponLocators.paginatorPages);
        this.paginatorRowsPerPage = page.locator(couponLocators.paginatorRowsPerPage);

        /////// Popup Dialog Locators ///////
        this.popupDialog = page.locator(couponLocators.popupDialog);
        this.popupTitle = page.locator(couponLocators.popupTitle);
        this.couponNameInput = page.getByLabel(couponLocators.couponNameInput);
        this.couponGroupInput = page.getByLabel(couponLocators.couponGroupInput);
        this.descriptionTextarea = page.getByLabel(couponLocators.descriptionTextarea);
        this.compCodeDropdown = page.getByLabel(couponLocators.compCodeDropdown);
        this.campaignDropdown = page.getByLabel(couponLocators.campaignDropdown);
        this.isGlobalCouponCheckbox = page.getByLabel(couponLocators.isGlobalCouponCheckbox);
        this.expiryTimeInput = page.getByLabel(couponLocators.expiryTimeInput);
        this.expiryTimeUnitDropdown = page.getByLabel(couponLocators.expiryTimeUnitDropdown);
        this.couponExpiryDatePicker = page.getByLabel(couponLocators.couponExpiryDatePicker);
        this.addRegionBtn = page.locator(couponLocators.addRegionBtn);
        this.saveBtn = page.locator(couponLocators.saveBtn);
        this.cancelBtn = page.locator(couponLocators.cancelBtn);

        /////// Confirmation Dialog Locators ///////
        this.confirmDialog = page.locator(couponLocators.confirmDialog);
        this.confirmYesBtn = page.locator(couponLocators.confirmYesBtn);
        this.confirmNoBtn = page.locator(couponLocators.confirmNoBtn);

        /////// Region Requirements Popup Locators ///////
        this.regionRequirementsDialog = page.locator(couponLocators.regionRequirementsDialog);

        /////// Toast Locators ///////
        this.successToast = page.locator(couponLocators.successToast);
        this.errorToast = page.locator(couponLocators.errorToast);
    }

    /////// Landing Page Methods ///////

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
        await this.couponTable.waitFor({ state: 'visible', timeout: 15000 });
    }

    async searchByName(name: string) {
        console.log(`Searching coupon by name: ${name}`);
        await this.fillInput(this.searchNameInput, name);
        await this.page.waitForTimeout(1000);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.selectDropdown(this.selectRegionDropdown, regionName);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    async selectEditedBy(editorName: string) {
        console.log(`Searching edited by: ${editorName}`);
        await this.fillInput(this.searchEditedByInput, editorName);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    async selectCompCode(compCode: string) {
        console.log(`Selecting comp code: ${compCode}`);
        await this.selectDropdown(this.selectCompCodeDropdown, compCode);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    async selectRequirementType(requirementType: string) {
        console.log(`Selecting requirement type: ${requirementType}`);
        await this.selectDropdown(this.selectRequirementTypeDropdown, requirementType);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(1000);
    }

    async clickCreate() {
        console.log('Clicking Create button...');
        await this.clickElement(this.createBtn);
        await this.popupDialog.waitFor({ state: 'visible', timeout: 10000 });
    }

    async clickDeleteForRow(rowIndex: number) {
        console.log(`Clicking Delete button for row ${rowIndex}...`);
        const deleteButton = this.couponTable.locator('tbody tr').nth(rowIndex).locator(couponLocators.deleteBtn);
        await this.clickElement(deleteButton);
    }

    async clickEditForRow(rowIndex: number) {
        console.log(`Clicking Edit button for row ${rowIndex}...`);
        const editButton = this.couponTable.locator('tbody tr').nth(rowIndex).locator(couponLocators.editBtn);
        await this.clickElement(editButton);
        await this.popupDialog.waitFor({ state: 'visible', timeout: 10000 });
    }

    async clickEllipsisMenuForRow(rowIndex: number) {
        console.log(`Clicking Ellipsis Menu for row ${rowIndex}...`);
        const ellipsisButton = this.couponTable.locator('tbody tr').nth(rowIndex).locator(couponLocators.ellipsisMenuBtn);
        await this.clickElement(ellipsisButton);
        await this.page.waitForTimeout(500);
    }

    async clickEllipsisOption(optionText: string) {
        console.log(`Clicking ellipsis menu option: ${optionText}`);
        const option = this.page.locator('.p-menu, .p-tieredmenu, .p-contextmenu, [role="menu"]')
            .getByText(optionText, { exact: true });
        await this.clickElement(option);
        await this.page.waitForTimeout(500);
    }

    async getTableColumnHeaders(): Promise<string[]> {
        const headers = this.couponTable.locator('thead th');
        const count = await headers.count();
        const headerTexts: string[] = [];
        for (let i = 0; i < count; i++) {
            headerTexts.push(await headers.nth(i).innerText());
        }
        return headerTexts;
    }

    async getTableRowCount(): Promise<number> {
        try {
            await this.couponTable.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 5000 });
        } catch (e) {
            console.log('No rows populated in coupon table after 5 seconds.');
        }
        return await this.couponTable.locator('tbody tr').count();
    }

    async getCellText(rowIndex: number, colIndex: number): Promise<string> {
        return await this.couponTable.locator('tbody tr').nth(rowIndex).locator('td').nth(colIndex).innerText();
    }

    async clickPageNumber(pageNum: number) {
        console.log(`Clicking pagination page: ${pageNum}`);
        const pageBtn = this.page.locator(`button.p-paginator-page:has-text("${pageNum}")`);
        await this.clickElement(pageBtn);
        await this.page.waitForTimeout(1000);
    }

    /////// Popup Form Methods ///////

    async fillCouponName(name: string) {
        console.log(`Filling Coupon Name: ${name}`);
        await this.fillInput(this.couponNameInput, name);
    }

    async fillCouponGroup(group: string) {
        console.log(`Filling Coupon Group: ${group}`);
        await this.fillInput(this.couponGroupInput, group);
    }

    async fillDescription(description: string) {
        console.log(`Filling Description: ${description}`);
        await this.fillInput(this.descriptionTextarea, description);
    }

    async clearDescription() {
        console.log('Clearing Description field...');
        await this.descriptionTextarea.clear();
    }

    async selectCompCodeInPopup(compCode: string) {
        console.log(`Selecting Comp Code in popup: ${compCode}`);
        await this.selectDropdown(this.compCodeDropdown, compCode);
    }

    async clearCompCodeInPopup() {
        console.log('Clearing Comp Code field...');
        // Click the clear icon if available, or clear the input
        const clearIcon = this.popupDialog.locator('.p-dropdown-clear-icon, .p-icon-times');
        if (await clearIcon.count() > 0) {
            await this.clickElement(clearIcon.first());
        } else {
            await this.compCodeDropdown.clear();
        }
    }

    async selectCampaign(campaign: string) {
        console.log(`Selecting Campaign: ${campaign}`);
        await this.selectDropdown(this.campaignDropdown, campaign);
    }

    async toggleGlobalCouponCheckbox() {
        console.log('Toggling Is Global Coupon checkbox...');
        await this.clickElement(this.isGlobalCouponCheckbox, { force: true });
        await this.page.waitForTimeout(500);
    }

    async fillExpiryTime(time: string) {
        console.log(`Filling Expiry Time: ${time}`);
        await this.fillInput(this.expiryTimeInput, time);
    }

    async selectExpiryTimeUnit(unit: string) {
        console.log(`Selecting Expiry Time Unit: ${unit}`);
        await this.selectDropdown(this.expiryTimeUnitDropdown, unit);
    }

    async setCouponExpiryDate(date: string) {
        console.log(`Setting Coupon Expiry Date: ${date}`);
        await this.couponExpiryDatePicker.click();
        await this.page.waitForTimeout(500);

        // If a specific date string is provided, type it directly
        await this.couponExpiryDatePicker.fill(date);
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(500);
    }

    async selectFutureDateFromPicker() {
        console.log('Selecting a future date from the date picker...');
        await this.couponExpiryDatePicker.click();
        await this.page.waitForTimeout(500);

        // Navigate to next month and pick the first available day
        const nextMonthBtn = this.page.locator('.p-datepicker-next');
        if (await nextMonthBtn.count() > 0) {
            await nextMonthBtn.click();
            await this.page.waitForTimeout(300);
        }
        const firstAvailableDay = this.page.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await firstAvailableDay.click({ force: true });
        await this.page.waitForTimeout(500);
    }

    async selectPastDateFromPicker() {
        console.log('Selecting a past date from the date picker...');
        await this.couponExpiryDatePicker.click();
        await this.page.waitForTimeout(500);

        // Navigate to previous month and pick the first day
        const prevMonthBtn = this.page.locator('.p-datepicker-prev');
        if (await prevMonthBtn.count() > 0) {
            await prevMonthBtn.click();
            await this.page.waitForTimeout(300);
        }
        const firstDay = this.page.locator('td:not(.p-datepicker-other-month) span').first();
        await firstDay.click({ force: true });
        await this.page.waitForTimeout(500);
    }

    async selectDistantFutureDate() {
        console.log('Selecting a distant future date from the date picker...');
        await this.couponExpiryDatePicker.click();
        await this.page.waitForTimeout(500);

        // Navigate forward multiple months (2 years ~ 24 months)
        const nextMonthBtn = this.page.locator('.p-datepicker-next');
        for (let i = 0; i < 24; i++) {
            if (await nextMonthBtn.count() > 0) {
                await nextMonthBtn.click();
                await this.page.waitForTimeout(100);
            }
        }
        const firstAvailableDay = this.page.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await firstAvailableDay.click({ force: true });
        await this.page.waitForTimeout(500);
    }

    async clickAddRegion() {
        console.log('Clicking Add Region button...');
        await this.clickElement(this.page.locator(couponLocators.addRegionBtn));
        await this.page.waitForTimeout(500);
    }

    async clickSave() {
        console.log('Clicking Save button...');
        await this.clickElement(this.saveBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickCancel() {
        console.log('Clicking Cancel button...');
        await this.clickElement(this.cancelBtn);
        await this.page.waitForTimeout(500);
    }

    /////// Region Requirements Methods ///////

    async openRegionRequirements(rowIndex: number) {
        console.log(`Opening Region Requirements for row ${rowIndex}...`);
        await this.clickEllipsisMenuForRow(rowIndex);
        await this.clickEllipsisOption('Region Requirements');
        await this.regionRequirementsDialog.waitFor({ state: 'visible', timeout: 10000 });
    }

    async getRegionSections(): Promise<Locator[]> {
        const sections = this.regionRequirementsDialog.locator('.p-card, .p-panel, [class*="region-section"]');
        const count = await sections.count();
        const result: Locator[] = [];
        for (let i = 0; i < count; i++) {
            result.push(sections.nth(i));
        }
        return result;
    }

    async addRequirementToRegion(requirementType: string) {
        console.log(`Adding requirement: ${requirementType}`);
        const addReqBtn = this.regionRequirementsDialog.locator(couponLocators.addRequirementBtn);
        await this.clickElement(addReqBtn);
        await this.page.waitForTimeout(500);

        // Select the requirement type from the newly appeared dropdown
        const lastReqDropdown = this.regionRequirementsDialog.getByLabel(couponLocators.requirementTypeDropdown).last();
        await this.selectDropdown(lastReqDropdown, requirementType);
    }

    async deleteRequirement(requirementIndex: number) {
        console.log(`Deleting requirement at index ${requirementIndex}...`);
        const deleteButtons = this.regionRequirementsDialog.locator(couponLocators.regionDeleteBtn);
        await this.clickElement(deleteButtons.nth(requirementIndex));
        await this.page.waitForTimeout(500);
    }

    async selectDataFieldRequirementType(fieldType: string) {
        console.log(`Selecting Data Field Requirement Type: ${fieldType}`);
        const dropdown = this.regionRequirementsDialog.getByLabel(couponLocators.dataFieldRequirementTypeDropdown);
        await this.selectDropdown(dropdown, fieldType);
    }

    async fillDataFieldFilterProperty(value: string) {
        console.log(`Filling Data Field Filter Property: ${value}`);
        const input = this.regionRequirementsDialog.getByLabel(couponLocators.dataFieldFilterPropertyInput);
        await this.fillInput(input, value);
    }

    async clickToggleFilters() {
        console.log('Toggling filters visibility...');
        const toggleBtn = this.regionRequirementsDialog.locator(couponLocators.hideFiltersBtn);
        await this.clickElement(toggleBtn);
        await this.page.waitForTimeout(500);
    }

    async saveRegionRequirements() {
        console.log('Saving region requirements...');
        const saveBtn = this.regionRequirementsDialog.locator(couponLocators.regionSaveBtn);
        await this.clickElement(saveBtn);
        await this.page.waitForTimeout(1000);
    }

    async closeRegionRequirements() {
        console.log('Closing region requirements dialog...');
        const closeBtn = this.regionRequirementsDialog.locator(couponLocators.regionCloseBtn);
        await this.clickElement(closeBtn);
        await this.page.waitForTimeout(500);
    }
}

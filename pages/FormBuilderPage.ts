import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { formBuilderLocators } from '../locators/formBuilderLocators';
import { CommonUtils } from '../utils/commonUtils';

export class FormBuilderPage extends BasePage {
    readonly searchInput: Locator;
    readonly regionDropdown: Locator;
    readonly createFormBtn: Locator;
    readonly firstPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly nextPageBtn: Locator;
    readonly lastPageBtn: Locator;
    readonly dialog: Locator;
    readonly editBtn: Locator;
    readonly configBtn: Locator;
    readonly duplicateBtn: Locator;
    readonly deleteBtn: Locator;
    readonly popupRegionDropdown: Locator;
    readonly popupTitleInput: Locator;
    readonly popupCodeNameInput: Locator;
    readonly popupSubTitleInput: Locator;
    readonly popupSaveBtn: Locator;
    readonly popupCancelBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput = this.page.locator(formBuilderLocators.searchInput);
        this.regionDropdown = this.page.locator(formBuilderLocators.regionDropdown);
        this.createFormBtn = this.page.locator(formBuilderLocators.createFormBtn);
        this.firstPageBtn = this.page.locator(formBuilderLocators.firstPageBtn);
        this.prevPageBtn = this.page.locator(formBuilderLocators.prevPageBtn);
        this.nextPageBtn = this.page.locator(formBuilderLocators.nextPageBtn);
        this.lastPageBtn = this.page.locator(formBuilderLocators.lastPageBtn);
        this.dialog = this.page.getByRole('dialog').first();
        this.editBtn = this.page.locator(formBuilderLocators.editBtn);
        this.configBtn = this.page.locator(formBuilderLocators.configBtn);
        this.duplicateBtn = this.page.locator(formBuilderLocators.duplicateBtn);
        this.deleteBtn = this.page.locator(formBuilderLocators.deleteBtn);
        this.popupRegionDropdown = this.dialog.locator(formBuilderLocators.popupRegionDropdown);
        this.popupTitleInput = this.page.locator(formBuilderLocators.popupTitleInput);
        this.popupCodeNameInput = this.page.locator(formBuilderLocators.popupCodeNameInput);
        this.popupSubTitleInput = this.page.locator(formBuilderLocators.popupSubTitleInput);
        this.popupSaveBtn = this.dialog.locator(formBuilderLocators.popupSaveBtn);
        this.popupCancelBtn = this.dialog.locator(formBuilderLocators.popupCancelBtn);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.clickElement(this.regionDropdown);
        await this.clickElement(this.page.getByText(regionName, { exact: true }));
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
    }

    async verifyColumnHeaders() {
        const columns = ['Region', 'Region Code', 'Form Title', 'Form Sub Title'];
        for (const col of columns) {
            const header = this.page.getByRole('columnheader', { name: col, exact: true });
            await expect(header).toBeVisible({ timeout: 20000 });
            await CommonUtils.highlightElementBorder(header);
        }
    }

    async verifySortIcons() {
        const sortableColumns = ['Region', 'Region Code', 'Form Title', 'Form Sub Title'];
        for (const col of sortableColumns) {
            const sortIcon = this.page.getByRole('columnheader', { name: col, exact: true }).locator('.p-sortable-column-icon');
            await expect(sortIcon).toBeVisible({ timeout: 20000 });
            await CommonUtils.highlightElementBorder(sortIcon);
        }
    }

    async verifyPaginationControls() {
        await expect(this.firstPageBtn).toBeVisible({ timeout: 20000 });
        await expect(this.prevPageBtn).toBeVisible({ timeout: 20000 });
        await expect(this.nextPageBtn).toBeVisible({ timeout: 20000 });
        await expect(this.lastPageBtn).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.firstPageBtn);
        await CommonUtils.highlightElementBorder(this.prevPageBtn);
        await CommonUtils.highlightElementBorder(this.nextPageBtn);
        await CommonUtils.highlightElementBorder(this.lastPageBtn);
    }

    async verifyRowActionButtons() {
        await expect(this.editBtn.first()).toBeVisible({ timeout: 20000 });
        await expect(this.configBtn.first()).toBeVisible({ timeout: 20000 });
        await expect(this.duplicateBtn.first()).toBeVisible({ timeout: 20000 });
        await expect(this.deleteBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editBtn.first());
        await CommonUtils.highlightElementBorder(this.configBtn.first());
        await CommonUtils.highlightElementBorder(this.duplicateBtn.first());
        await CommonUtils.highlightElementBorder(this.deleteBtn.first());
    }

    async verifyCreateFormPopupFields() {
        await expect(this.popupRegionDropdown).toBeVisible({ timeout: 20000 });
        await expect(this.popupTitleInput).toBeVisible({ timeout: 20000 });
        await expect(this.popupCodeNameInput).toBeVisible({ timeout: 20000 });
        await expect(this.popupSubTitleInput).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.popupRegionDropdown);
        await CommonUtils.highlightElementBorder(this.popupTitleInput);
        await CommonUtils.highlightElementBorder(this.popupCodeNameInput);
        await CommonUtils.highlightElementBorder(this.popupSubTitleInput);
    }

    async selectPopupRegion(regionName: string) {
        await this.clickElement(this.popupRegionDropdown);
        await this.page.locator(`li[role="option"][aria-label="${regionName}"]`).click();
    }

    async createForm(region: string, title: string, codeName: string, subTitle: string) {
        await this.clickElement(this.createFormBtn);
        await expect(this.dialog).toBeVisible({timeout:20000});
        await this.selectPopupRegion(region);
        await this.fillInput(this.popupTitleInput, title);
        await this.fillInput(this.popupCodeNameInput, codeName);
        await this.fillInput(this.popupSubTitleInput, subTitle);
        await this.clickElement(this.popupSaveBtn);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
    }

    async cancelCreateForm() {
        await this.clickElement(this.popupCancelBtn);
    }

    async verifyEditFormPopupFields() {
        await expect(this.popupRegionDropdown).toBeVisible({ timeout: 20000 });
        await expect(this.popupTitleInput).toBeVisible({ timeout: 20000 });
        await expect(this.popupCodeNameInput).toBeVisible({ timeout: 20000 });
        await expect(this.popupSubTitleInput).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.popupRegionDropdown);
        await CommonUtils.highlightElementBorder(this.popupTitleInput);
        await CommonUtils.highlightElementBorder(this.popupCodeNameInput);
        await CommonUtils.highlightElementBorder(this.popupSubTitleInput);
    }

    async editForm(title: string) {
        await this.popupTitleInput.clear();
        await this.fillInput(this.popupTitleInput, title);
        await this.clickElement(this.popupSaveBtn);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
    }

    async cancelEditForm() {
        await this.clickElement(this.popupCancelBtn);
    }
}

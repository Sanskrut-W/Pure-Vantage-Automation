import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { stencilConfigLocators } from '../locators/stencilConfigLocators';
import { CommonUtils } from '../utils/commonUtils';

export class StencilConfigPage extends BasePage {
    readonly searchInput: Locator;
    readonly createStencilBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;
    readonly dialog: Locator;
    readonly confirmDialog: Locator;
    readonly firstPageBtn: Locator;
    readonly prevPageBtn: Locator;
    readonly nextPageBtn: Locator;
    readonly lastPageBtn: Locator;
    readonly popupNameInput: Locator;
    readonly popupTagInput: Locator;
    readonly popupStencilURLInput: Locator;
    readonly popupSaveBtn: Locator;
    readonly popupCancelBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput = this.page.locator(stencilConfigLocators.searchInput);
        this.createStencilBtn = this.page.getByRole('button', { name: 'Create Stencil Config' });
        this.editBtn = this.page.getByRole('button', { name: 'Edit' });
        this.deleteBtn = this.page.getByRole('button', { name: 'Delete' });
        this.dialog = this.page.getByRole('dialog').first();
        this.confirmDialog = this.page.getByRole('alertdialog').first();
        this.firstPageBtn = this.page.locator(stencilConfigLocators.firstPageBtn);
        this.prevPageBtn = this.page.locator(stencilConfigLocators.prevPageBtn);
        this.nextPageBtn = this.page.locator(stencilConfigLocators.nextPageBtn);
        this.lastPageBtn = this.page.locator(stencilConfigLocators.lastPageBtn);
        this.popupNameInput = this.page.locator(stencilConfigLocators.popupNameInput);
        this.popupTagInput = this.page.locator(stencilConfigLocators.popupTagInput);
        this.popupStencilURLInput = this.page.locator(stencilConfigLocators.popupStencilURLInput);
        this.popupSaveBtn = this.dialog.getByRole('button', { name: 'Save' });
        this.popupCancelBtn = this.dialog.getByRole('button', { name: 'Cancel' });
    }

    async verifyColumnHeaders() {
        const columns = [
            stencilConfigLocators.columnName,
            stencilConfigLocators.columnStencilURL,
            stencilConfigLocators.columnTag,
        ];
        for (const col of columns) {
            const header = this.page.getByRole('columnheader', { name: col, exact: true });
            await expect(header).toBeVisible({ timeout: 20000 });
            await CommonUtils.highlightElementBorder(header);
        }
    }

    async verifySortIcons() {
        const sortableColumns = [
            stencilConfigLocators.columnName,
            stencilConfigLocators.columnStencilURL,
            stencilConfigLocators.columnTag,
        ];
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
        await expect(this.deleteBtn.first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editBtn.first());
        await CommonUtils.highlightElementBorder(this.deleteBtn.first());
    }

    async verifyCreatePopupFields() {
        await expect(this.popupNameInput).toBeVisible({ timeout: 20000 });
        await expect(this.popupTagInput).toBeVisible({ timeout: 20000 });
        await expect(this.popupStencilURLInput).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.popupNameInput);
        await CommonUtils.highlightElementBorder(this.popupTagInput);
        await CommonUtils.highlightElementBorder(this.popupStencilURLInput);
    }

    async createStencilConfig(name: string, tag: string, stencilURL: string) {
        await this.clickElement(this.createStencilBtn);
        await expect(this.dialog).toBeVisible({ timeout: 20000 });
        await this.fillInput(this.popupNameInput, name);
        await this.fillInput(this.popupTagInput, tag);
        await this.fillInput(this.popupStencilURLInput, stencilURL);
        await this.clickElement(this.popupSaveBtn);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
    }

    async editStencilConfig(name: string) {
        await this.popupNameInput.clear();
        await this.fillInput(this.popupNameInput, name);
        await this.clickElement(this.popupSaveBtn);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
    }

    async cancelCreateStencilConfig() {
        await this.clickElement(this.popupCancelBtn);
    }
}

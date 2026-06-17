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
}

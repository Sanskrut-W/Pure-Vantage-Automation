import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { messageCTALocators } from '../locators/messageCTALocators';

export class MessageCTAPage extends BasePage {
    readonly searchInput:    Locator;
    readonly regionDropdown: Locator;
    readonly refreshBtn:     Locator;
    readonly createCTABtn:   Locator;
    readonly dataTable:      Locator;
    readonly editBtn:        Locator;
    readonly deleteBtn:      Locator;
    readonly paginatorBottom:Locator;
    readonly pageButtons:    Locator;

    constructor(page: Page) {
        super(page);
        this.searchInput     = page.locator(messageCTALocators.searchInput);
        this.regionDropdown  = page.locator(messageCTALocators.regionDropdown);
        this.refreshBtn      = page.locator(messageCTALocators.refreshBtn);
        this.createCTABtn    = page.locator(messageCTALocators.createCTABtn);
        this.dataTable       = page.locator(messageCTALocators.dataTable);
        this.editBtn         = page.locator(messageCTALocators.editBtn);
        this.deleteBtn       = page.locator(messageCTALocators.deleteBtn);
        this.paginatorBottom = page.locator(messageCTALocators.paginatorBottom);
        this.pageButtons     = page.locator(messageCTALocators.pageButtons);
    }

    async clickRegionDropdown() {
        console.log('Clicking Region Dropdown...');
        await this.clickElement(this.regionDropdown);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName}`);
        await this.clickRegionDropdown();
        await this.page.waitForTimeout(500);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await optionLocator.scrollIntoViewIfNeeded();
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
        // Wait for edit buttons to confirm table fully rendered
        try {
            await this.editBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        } catch {
            console.log(`selectRegion('${regionName}'): no Edit buttons visible — table may be empty`);
        }
    }

    async searchFor(term: string) {
        console.log(`Searching for: ${term}`);
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

    async clickCreateCTA() {
        console.log('Clicking Create CTA button...');
        await this.clickElement(this.createCTABtn);
        await this.page.waitForTimeout(500);
    }

    async clickEditFirst() {
        console.log('Clicking Edit on first row...');
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickDeleteFirst() {
        console.log('Clicking Delete on first row...');
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(500);
    }

    async closeDialogWithCancel() {
        const cancelBtn = this.page.locator(messageCTALocators.dialogCancelBtn).first();
        if (await cancelBtn.isVisible()) {
            await this.clickElement(cancelBtn);
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

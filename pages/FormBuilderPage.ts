import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { formBuilderLocators } from '../locators/formBuilderLocators';

export class FormBuilderPage extends BasePage {
    readonly page: Page;
    readonly searchInput: Locator;
    readonly createFormBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.searchInput = page.locator(formBuilderLocators.searchInput);
        this.createFormBtn = page.locator(formBuilderLocators.createFormButton);
    }

    async isSearchBoxVisible() {
        await this.searchInput.waitFor({ state: 'visible', timeout: 20000 });
        return await this.searchInput.isVisible();
    }

    async regionContainerContains(text: string) {
        const region = this.page.locator(`xpath=${formBuilderLocators.regionContainerXPath}`);
        await region.waitFor({ state: 'visible', timeout: 20000 });
        await expect(region).toContainText(text, { timeout: 20000 });
        return true;
    }

    async isCreateFormButtonVisible() {
        await this.createFormBtn.waitFor({ state: 'visible', timeout: 20000 });
        return await this.createFormBtn.isVisible();
    }
}

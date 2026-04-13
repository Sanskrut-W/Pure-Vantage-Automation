import { Page, Locator } from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Waits for the page to reach network idle state, ensuring all dynamic content is fully loaded.
     */
    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Waits for an element to be visible and actionable, then clicks it.
     */
    async clickElement(locator: Locator) {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    /**
     * Waits for an input field to be visible, then fills it with a value.
     */
    async fillInput(locator: Locator, value: string) {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(value);
    }

    /**
     * Selects an option from a custom UI dropdown (common in modern frameworks).
     * Typically this involves clicking the dropdown to open it, then clicking the option text.
     */
    async selectDropdown(dropdownLocator: Locator, optionText: string) {
        await this.clickElement(dropdownLocator);
        // Assumes options are rendered in the DOM either by role="option" or generic text
        const optionLocator = this.page.getByText(optionText, { exact: true });
        await this.clickElement(optionLocator);
    }
}

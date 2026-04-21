import { Page, Locator } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Waits for the page to reach network idle state, ensuring all dynamic content is fully loaded.
     */
    async waitForPageLoad() {
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Waits for an element to be visible and actionable, highlights it smoothly, then clicks it.
     */
    async clickElement(locator: Locator, options?: { force?: boolean }) {
        await locator.waitFor({ state: 'visible' });
        
        // Magically highlight EVERY element right before clicking without repeating code
        await CommonUtils.highlightElement(locator);
        
        await locator.click(options);
        await this.waitForPageLoad();
    }

    /**
     * Waits for an input field to be visible, highlights it smoothly, then fills it with a value.
     */
    async fillInput(locator: Locator, value: string) {
        await locator.waitFor({ state: 'visible' });
        
        // Magically highlight EVERY input field right before typing
        await CommonUtils.highlightElement(locator);
        
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

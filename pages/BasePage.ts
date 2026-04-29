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

    /**
     * Navigates the browser Back (equivalent to clicking the browser Back button).
     * Includes a visual pause so the destination page is fully rendered and
     * observable in headed mode before proceeding.
     */
    async browserBack() {
        console.log('🔙 Browser Back: navigating to previous history entry');
        const urlBefore = this.page.url();
        await this.page.goBack({ waitUntil: 'domcontentloaded' });
        // Wait for SPA to fully render the previous page so it's visually observable
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
        console.log(`   URL changed: ${urlBefore} → ${this.page.url()}`);
    }

    /**
     * Navigates the browser Forward (equivalent to clicking the browser Forward button).
     * Includes a visual pause so the destination page is fully rendered and
     * observable in headed mode before proceeding.
     */
    async browserForward() {
        console.log('🔜 Browser Forward: navigating to next history entry');
        const urlBefore = this.page.url();
        await this.page.goForward({ waitUntil: 'domcontentloaded' });
        // Wait for SPA to fully render the forward page so it's visually observable
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
        console.log(`   URL changed: ${urlBefore} → ${this.page.url()}`);
    }

    /**
     * Refreshes the page. Uses Playwright's native reload so it correctly logs in traces.
     * Includes a visual pause so the reloaded page is fully rendered and
     * observable in headed mode before proceeding.
     */
    async browserRefresh() {
        console.log('🔄 Browser Refresh: reloading page');
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        // Wait for SPA to fully render the reloaded page so it's visually observable
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(5000);
    }
}

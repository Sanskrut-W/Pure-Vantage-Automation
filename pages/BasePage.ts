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
        // A global loading overlay (pure-page-loader) can linger after a page
        // transition and intercept pointer events for the content underneath —
        // confirmed live: it blocked clicks on both a page's Edit button and
        // the sidebar nav, burning the full action timeout on retries instead
        // of just clicking through once the overlay clears.
        await this.page.locator('.pure__loader-container').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
        await locator.click(options);
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
        const panel = this.page.locator('.p-dropdown-panel').last();

        // If panel not visible yet, try re-clicking the dropdown once
        if (!await panel.isVisible().catch(() => false)) {
            await this.page.waitForTimeout(300);
            await dropdownLocator.click({ force: true }).catch(() => {});
            await this.page.waitForTimeout(300);
        }

        if (await panel.isVisible().catch(() => false)) {
            // Long option lists (e.g. all Betway regions) are virtualized — only the items
            // currently in the scroll viewport exist in the DOM. Alphabetically-early options
            // (like "Betway Ghana") render immediately, but later ones (like "Betway Zambia")
            // don't, so waiting for them times out even though the panel is open. Typing into
            // the panel's own filter box (what a human does to search instead of scrolling)
            // narrows the list so the target option actually renders.
            const filterInput = panel.locator('input[type="text"]').first();
            if (await filterInput.isVisible().catch(() => false)) {
                await filterInput.fill(optionText);
                await this.page.waitForTimeout(300);
            }

            // Preferred path: click the option within the scoped panel
            const optionLocator = panel.locator('.p-dropdown-item', { hasText: optionText }).first();
            await this.clickElement(optionLocator);
        } else {
            // Fallback: search dropdown-specific selectors only (never global getByText — causes
            // strict-mode violation and hangs on hidden <option> elements for 120s)
            const fallback = this.page
                .locator('.p-dropdown-items .p-dropdown-item, [role="option"]')
                .filter({ hasText: optionText })
                .first();
            if (await fallback.isVisible().catch(() => false)) {
                await this.clickElement(fallback);
            }
            // If still nothing, silently skip — the dropdown may already have the value
        }
    }


    async selectDropdownWithParentLocator(dropdownLocator: Locator, optionText: string, parentLocator?: Locator) {
        await this.clickElement(dropdownLocator);
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('ArrowDown');
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('ArrowDown');
        await this.page.waitForTimeout(1000);
        await this.page.keyboard.press('Enter');
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
        await this.page.waitForTimeout(500);
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
        await this.page.waitForTimeout(500);
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
        await this.page.waitForTimeout(500);
    }

    async verifyToast() {
        await this.page.locator('.p-toast-message-text').waitFor({ state: 'visible' });
        const toastmessage = await this.page.locator('.p-toast-message-text').textContent();
        console.log("Toast message = ", toastmessage);
        console.log('Toast message verified');
        await CommonUtils.highlightElement(this.page.locator('.p-toast-message-text'));
        await this.page.waitForTimeout(2000);

        if (toastmessage != null && toastmessage.includes('Success')) {
            return true;
        }
        return false;

    }
}

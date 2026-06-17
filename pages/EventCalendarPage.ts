import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { eventCalendarLocators } from '../locators/eventCalendarLocators';
import { CommonUtils } from '../utils/commonUtils';

export class EventCalendarPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly viewDropdown: Locator;

    constructor(page: Page) {
        super(page);
        // Target the visible span text inside the dropdown for visibility assertions
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${eventCalendarLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.viewDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${eventCalendarLocators.dropdownSelectView}"]) span.p-dropdown-label`);
    }

    /**
     * Opens a PrimeVue dropdown by clicking the hidden accessible input inside it.
     * PrimeVue binds its open/close handler to this focusable input (tabindex=0),
     * not the visible span (tabindex=-1).
     */
    private async openDropdown(ariaLabel: string) {
        const hiddenInput = this.page.locator(
            `div.p-dropdown:has(.p-dropdown-trigger[aria-label="${ariaLabel}"]) .p-hidden-accessible input`
        );
        await hiddenInput.waitFor({ state: 'attached' });
        await hiddenInput.focus();
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
    }

    /**
     * Selects a region from the Event Calendar region dropdown.
     */
    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Event Calendar...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openDropdown(eventCalendarLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Selects a view from the Event Calendar view dropdown.
     */
    async selectView(viewName: string) {
        console.log(`Selecting view: ${viewName} on Event Calendar...`);
        await CommonUtils.highlightElement(this.viewDropdown);
        await this.openDropdown(eventCalendarLocators.dropdownSelectView);
        const optionLocator = this.page.getByRole('option', { name: viewName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Selects both Region and View in sequence.
     */
    async selectRegionAndView(regionName: string, viewName: string) {
        await this.selectRegion(regionName);
        await this.selectView(viewName);
    }
}

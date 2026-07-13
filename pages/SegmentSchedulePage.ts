import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentScheduleLocators } from '../locators/segmentScheduleLocators';
import { CommonUtils } from '../utils/commonUtils';

export class SegmentSchedulePage extends BasePage {
    readonly regionDropdown: Locator;
    readonly scheduleSegmentBtn: Locator;

    constructor(page: Page) {
        super(page);
        // Target the visible span text inside the dropdown for visibility assertions
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${segmentScheduleLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.scheduleSegmentBtn = page.getByRole('button', { name: segmentScheduleLocators.buttonScheduleSegment });
    }

    /**
     * Opens a PrimeVue dropdown by focusing the hidden accessible input and pressing Space.
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
     * Selects a region from the Segment Schedule region dropdown.
     */
    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Segment Schedule...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openDropdown(segmentScheduleLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Clicks the Schedule Segment button if visible.
     */
    async clickScheduleSegment() {
        console.log('Clicking Schedule Segment button...');
        if (await this.scheduleSegmentBtn.count() > 0) {
            await this.clickElement(this.scheduleSegmentBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Selects Region and then clicks Schedule Segment in sequence.
     */
    async selectRegionAndSchedule(regionName: string) {
        await this.selectRegion(regionName);
        await this.clickScheduleSegment();
    }
}

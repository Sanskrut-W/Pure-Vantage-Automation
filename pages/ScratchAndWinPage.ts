import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { scratchAndWinLocators } from '../locators/scratchAndWinLocators';

export class ScratchAndWinPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createPromotionBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${scratchAndWinLocators.dropdownRegion}"]) span.p-dropdown-label`).first();
        this.createPromotionBtn = this.page.locator(scratchAndWinLocators.createPromotionBtn);
    }

    private async openDropdown(ariaLabel: string) {
        const hiddenInput = this.page.locator(
            `div.p-dropdown:has(.p-dropdown-trigger[aria-label="${ariaLabel}"]) .p-hidden-accessible input`
        ).first();
        await hiddenInput.waitFor({ state: 'attached' });
        await hiddenInput.focus();
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Scratch And Win Management...`);
        await this.openDropdown(scratchAndWinLocators.dropdownRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    async clickCreatePromotion() {
        console.log('Clicking Create Promotion button...');
        await this.clickElement(this.createPromotionBtn);
    }
}

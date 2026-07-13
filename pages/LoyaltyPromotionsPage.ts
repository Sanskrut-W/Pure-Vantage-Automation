import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { loyaltyPromotionsLocators } from '../locators/loyaltyPromotionsLocators';
import { CommonUtils } from '../utils/commonUtils';

export class LoyaltyPromotionsPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createLoyaltyPromotionBtn: Locator;

    constructor(page: Page) {
        super(page);
        // Target the visible span text inside the dropdown for visibility assertions
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${loyaltyPromotionsLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.createLoyaltyPromotionBtn = page.getByRole('button', { name: loyaltyPromotionsLocators.buttonCreateLoyaltyPromotion });
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
     * Selects a region from the Loyalty Promotions region dropdown.
     */
    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Loyalty Promotions...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openDropdown(loyaltyPromotionsLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Clicks the Create Loyalty Promotion button if visible.
     */
    async clickCreateLoyaltyPromotion() {
        console.log('Clicking Create Loyalty Promotion button...');
        if (await this.createLoyaltyPromotionBtn.count() > 0) {
            await this.clickElement(this.createLoyaltyPromotionBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Selects Region and then clicks Create Loyalty Promotion in sequence.
     */
    async selectRegionAndCreate(regionName: string) {
        await this.selectRegion(regionName);
        await this.clickCreateLoyaltyPromotion();
    }
}

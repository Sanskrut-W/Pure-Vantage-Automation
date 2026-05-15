import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { promotionOrderingLocators } from '../locators/promotionOrderingLocators';

export class PromotionOrderingPage extends BasePage {
    readonly promoTypeDropdown: Locator;
    readonly regionDropdown: Locator;
    readonly addPromotionBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.promoTypeDropdown = this.page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${promotionOrderingLocators.dropdownPromoType}"]) span.p-dropdown-label`).first();
        this.regionDropdown = this.page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${promotionOrderingLocators.dropdownRegion}"]) span.p-dropdown-label`).first();
        this.addPromotionBtn = this.page.locator(promotionOrderingLocators.addPromotionBtn);
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

    async selectPromoType(promoType: string) {
        console.log(`Selecting Promo Type: ${promoType} on Promotion Ordering...`);
        await this.openDropdown(promotionOrderingLocators.dropdownPromoType);
        const optionLocator = this.page.getByRole('option', { name: promoType, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000); 
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName} on Promotion Ordering...`);
        await this.openDropdown(promotionOrderingLocators.dropdownRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000); 
    }

    async clickAddPromotion() {
        console.log('Clicking Add New Promotion To Vertical button...');
        await this.clickElement(this.addPromotionBtn);
    }
}

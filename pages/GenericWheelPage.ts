import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { genericWheelLocators } from '../locators/genericWheelLocators';

export class GenericWheelPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createPromotionBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${genericWheelLocators.dropdownSelectRegion}"]) span.p-dropdown-label`).first();
        this.createPromotionBtn = this.page.locator(genericWheelLocators.createPromotionBtn);
        this.editBtn = this.page.locator(genericWheelLocators.editBtn);
        this.deleteBtn = this.page.locator(genericWheelLocators.deleteBtn);
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
        console.log(`Selecting region: ${regionName} on Generic Wheel...`);
        await this.openDropdown(genericWheelLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    async clickCreatePromotion() {
        console.log('Clicking Create Promotion button...');
        await this.clickElement(this.createPromotionBtn);
    }

    async clickEditFirstPromotion() {
        console.log('Clicking Edit button for the first Promotion...');
        await this.clickElement(this.editBtn.first());
    }

    async clickDeleteFirstPromotion() {
        console.log('Clicking Delete button for the first Promotion...');
        await this.clickElement(this.deleteBtn.first());
    }
}

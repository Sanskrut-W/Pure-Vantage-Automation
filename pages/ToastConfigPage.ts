import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { toastConfigLocators } from '../locators/toastConfigLocators';
import { CommonUtils } from '../utils/commonUtils';

export class ToastConfigPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createToastConfigBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${toastConfigLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.createToastConfigBtn = page.getByRole('button', { name: toastConfigLocators.buttonCreateToastConfig, exact: true });
        this.editBtn = page.getByRole('button', { name: toastConfigLocators.buttonEdit, exact: true });
        this.deleteBtn = page.getByRole('button', { name: toastConfigLocators.buttonDelete, exact: true });
    }

    private async openDropdown(ariaLabel: string) {
        const hiddenInput = this.page.locator(
            `div.p-dropdown:has(.p-dropdown-trigger[aria-label="${ariaLabel}"]) .p-hidden-accessible input`
        );
        await hiddenInput.waitFor({ state: 'attached' });
        await hiddenInput.focus();
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Toast Configuration...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openDropdown(toastConfigLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000);
    }

    async clickCreateToastConfig() {
        console.log('Clicking Create Toast Config button...');
        await this.clickElement(this.createToastConfigBtn);
        await this.page.waitForTimeout(1000);
    }

    async clickEditFirstToastConfig() {
        console.log('Clicking Edit button for the first Toast Configuration...');
        if (await this.editBtn.count() > 0) {
            await this.clickElement(this.editBtn.first());
            await this.page.waitForTimeout(1000);
        }
    }

    async clickDeleteFirstToastConfig() {
        console.log('Clicking Delete button for the first Toast Configuration...');
        if (await this.deleteBtn.count() > 0) {
            await this.clickElement(this.deleteBtn.first());
            await this.page.waitForTimeout(1000);
        }
    }
}

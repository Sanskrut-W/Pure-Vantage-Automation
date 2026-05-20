import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { genericWheelLocators } from '../locators/genericWheelLocators';

export class GenericWheelPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly createPromotionBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;
    readonly promotionNameInput: Locator;
    readonly allocationStrategyDropdown: Locator;
    readonly startDateCalendar: Locator;
    readonly endDateCalendar: Locator;
    readonly spinsPerUserInput: Locator;
    readonly dailySpinLimitInput: Locator;
    readonly spinValidityDaysInput: Locator;
    readonly numberOfSlicesInput: Locator;
    readonly redirectUrlInput: Locator;
    readonly ticketPrefixInput: Locator;
    readonly minimumWagerInput: Locator;
    readonly notificationDropdown: Locator;
    readonly hasSpinAgain: Locator;
    readonly requiresOptIn: Locator;
    readonly allocateTicketOnAllPrizes: Locator;
    readonly saveButton: Locator;
    readonly cancelButton: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = this.page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${genericWheelLocators.dropdownSelectRegion}"]) span.p-dropdown-label`).first();
        this.createPromotionBtn = this.page.locator(genericWheelLocators.createPromotionBtn);
        this.editBtn = this.page.locator(genericWheelLocators.editBtn);
        this.deleteBtn = this.page.locator(genericWheelLocators.deleteBtn);
        this.promotionNameInput = this.page.locator(genericWheelLocators.promotionNameInput);
        this.allocationStrategyDropdown = this.page.locator(genericWheelLocators.allocationStrategyDropdown);
        this.startDateCalendar = this.page.locator(genericWheelLocators.startDateCalendar);
        this.endDateCalendar = this.page.locator(genericWheelLocators.endDateCalendar);
        this.spinsPerUserInput = this.page.locator(genericWheelLocators.spinsPerUserInput);
        this.dailySpinLimitInput = this.page.locator(genericWheelLocators.dailySpinLimitInput);
        this.spinValidityDaysInput = this.page.locator(genericWheelLocators.spinValidityDaysInput);
        this.numberOfSlicesInput = this.page.locator(genericWheelLocators.numberOfSlicesInput);
        this.redirectUrlInput = this.page.locator(genericWheelLocators.redirectUrlInput);
        this.ticketPrefixInput = this.page.locator(genericWheelLocators.ticketPrefixInput);
        this.minimumWagerInput = this.page.locator(genericWheelLocators.minimumWagerInput);
        this.notificationDropdown = this.page.locator(genericWheelLocators.notificationDropdown);
        this.hasSpinAgain = this.page.locator(genericWheelLocators.hasSpinAgain);
        this.requiresOptIn = this.page.locator(genericWheelLocators.requiresOptIn);
        this.allocateTicketOnAllPrizes = this.page.locator(genericWheelLocators.allocateTicketOnAllPrizes);
        this.saveButton = this.page.locator(genericWheelLocators.saveButton);
        this.cancelButton = this.page.locator(genericWheelLocators.cancelButton);
    }

    private async openDropdown() {
        await this.clickElement(this.regionDropdown);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Generic Wheel...`);
        await this.openDropdown();
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000);
    }

    async selectAllocationStrategy(strategyName: string) {
        console.log(`Selecting allocation strategy: ${strategyName} on Generic Wheel...`);
        await this.clickElement(this.allocationStrategyDropdown);
        const optionLocator = this.page.getByRole('option', { name: strategyName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000);
    }

    async selectRegionInPopup(regionName: string) {
        console.log(`Selecting region: ${regionName} on Generic Wheel...`);
        await this.clickElement(this.regionDropdown);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true }).first();
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000);
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

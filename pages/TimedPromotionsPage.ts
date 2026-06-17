import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { timedPromotionsLocators } from '../locators/timedPromotionsLocators';
import { CommonUtils } from '../utils/commonUtils';

export class TimedPromotionsPage extends BasePage {
    // Scoped container
    readonly container: Locator;

    // Landing Page Locators (Scoped inside container)
    readonly createTimedPromotionBtn: Locator;
    readonly searchInput: Locator;
    readonly hideInactiveSwitch: Locator;
    readonly ellipsisBtn: Locator;
    readonly tableRows: Locator;

    // Dialog Locators (Appended to body)
    readonly dialog: Locator;
    readonly name: Locator;
    readonly description: Locator;
    readonly regionsId: Locator;
    readonly startDate: Locator;
    readonly endDate: Locator;
    readonly multiCompFrequency: Locator;
    readonly multiCompFrequencyValue: Locator
    readonly isTesting: Locator;
    readonly isManual: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;

    // Edit Page Form Locators (Direct on page)
    readonly editName: Locator;
    readonly editDescription: Locator;
    readonly editStartDate: Locator;
    readonly editEndDate: Locator;
    readonly editRegionId: Locator;
    readonly updateBtn: Locator;

    readonly startTime: Locator;
    readonly endTime: Locator;
    readonly activeDays: Locator;
    readonly chanceToWinStart: Locator;
    readonly chanceToWinEnd: Locator;

    readonly type: Locator;
    readonly minWager: Locator;
    readonly minOdds: Locator;

    readonly createOptInBtn: Locator;
    readonly createHorlyConfigBtn: Locator;

    constructor(page: Page) {
        super(page);

        // Get container and scope all landing page elements within it
        this.container = this.page.locator('timed-promotions');

        this.createTimedPromotionBtn = this.container.locator(timedPromotionsLocators.createTimedPromotionBtn);
        this.searchInput = this.container.locator(timedPromotionsLocators.searchInput);
        this.hideInactiveSwitch = this.container.locator(timedPromotionsLocators.hideInactiveSwitch);
        this.ellipsisBtn = this.container.locator(timedPromotionsLocators.ellipsisBtn);
        this.tableRows = this.container.locator('tbody tr');

        // Dialog elements (rendered at body root level by PrimeVue)
        this.dialog = this.page.locator(timedPromotionsLocators.dialog).first();
        this.name = this.dialog.locator(timedPromotionsLocators.name);
        this.description = this.dialog.locator(timedPromotionsLocators.description);
        this.regionsId = this.dialog.locator(timedPromotionsLocators.regionsId);
        this.startDate = this.dialog.locator(timedPromotionsLocators.startDate);
        this.endDate = this.dialog.locator(timedPromotionsLocators.endDate);
        this.multiCompFrequency = this.dialog.locator(timedPromotionsLocators.multiCompFrequency)
        this.multiCompFrequencyValue = this.dialog.locator(timedPromotionsLocators.multiCompFrequencyValue)
        this.isTesting = this.dialog.locator(timedPromotionsLocators.isTesting)
        this.isManual = this.dialog.locator(timedPromotionsLocators.isManual)
        this.saveBtn = this.dialog.locator(timedPromotionsLocators.saveBtn);
        this.cancelBtn = this.dialog.locator(timedPromotionsLocators.cancelBtn);

        // Edit page form elements (when navigating to edit page)
        this.editName = this.page.locator(timedPromotionsLocators.editName);
        this.editDescription = this.page.locator(timedPromotionsLocators.editDescription);
        this.editStartDate = this.page.locator(timedPromotionsLocators.editStartDate);
        this.editEndDate = this.page.locator(timedPromotionsLocators.editEndDate);
        this.editRegionId = this.page.locator(timedPromotionsLocators.editRegionId);
        this.updateBtn = this.page.locator(timedPromotionsLocators.updateBtn);

        // Opt in elements
        this.type = this.page.locator(timedPromotionsLocators.type);
        this.minWager = this.page.locator(timedPromotionsLocators.minWager);
        this.minOdds = this.page.locator(timedPromotionsLocators.minOdds);

        // Hourly Configuration elements
        this.startTime = this.page.locator(timedPromotionsLocators.startTime);
        this.endTime = this.page.locator(timedPromotionsLocators.endTime);
        this.activeDays = this.page.locator(timedPromotionsLocators.activeDays);
        this.chanceToWinStart = this.page.locator(timedPromotionsLocators.chanceToWinStart);
        this.chanceToWinEnd = this.page.locator(timedPromotionsLocators.chanceToWinEnd);

        this.createOptInBtn = this.page.locator(timedPromotionsLocators.createOptInBtn);
        this.createHorlyConfigBtn = this.page.locator(timedPromotionsLocators.createHorlyConfigBtn);

    }


    async clickCreateTimedPromotion() {
        console.log('Clicking Create Timed Promotion button...');
        await this.clickElement(this.createTimedPromotionBtn);
    }

    async clickEllipsisMenuForRow(rowIndex: number) {
        console.log(`Clicking Ellipsis Menu for row ${rowIndex}...`);
        const ellipsis = this.ellipsisBtn.nth(rowIndex);
        await this.clickElement(ellipsis);
    }

    async clickEllipsisMenuForPromo(promoName: string) {
        console.log(`Clicking Ellipsis Menu for promo: ${promoName}`);
        const row = this.tableRows.filter({ hasText: promoName });
        const ellipsis = row.locator(timedPromotionsLocators.ellipsisBtn);
        await this.clickElement(ellipsis);
    }

    async clickEllipsisOption(optionText: string) {
        console.log(`Clicking ellipsis option: ${optionText}`);
        const option = this.page.locator('.p-menu, .p-tieredmenu, [role="menu"]').getByText(optionText, { exact: true });
        await this.clickElement(option);
    }

    async clickCancelBtn() {
        await this.clickElement(this.cancelBtn);
    }

    async setDateRange(startDate?: string, endDate?: string) {
        console.log(`Setting start and end dates dynamically via calendar panels...`);

        await this.clickElement(this.startDate);
        const startPanel = this.page.locator('#startDate_panel');
        await startPanel.waitFor({ state: 'visible' });

        const activeStartDay = startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeStartDay, { force: true });
        await this.page.waitForTimeout(500);

        await this.clickElement(this.endDate);
        const endPanel = this.page.locator('#endDate_panel');
        await endPanel.waitFor({ state: 'visible' });

        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(500);
    }

    async setTimeRange() {
        let startTime = '02:30';
        let endTime = '22:00';
        await this.fillInput(this.startTime, startTime);
        await this.fillInput(this.endTime, endTime);
        await this.chanceToWinEnd.dblclick();

    }

    async editDateRange(startDate?: string, endDate?: string) {
        console.log(`Setting edit start and end dates dynamically via calendar panels...`);

        await this.clickElement(this.editStartDate);
        const startPanel = this.page.locator('#startDate_panel');
        await startPanel.waitFor({ state: 'visible' });

        const activeStartDay = startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeStartDay, { force: true });
        await this.page.waitForTimeout(500);

        await this.clickElement(this.editEndDate);
        const endPanel = this.page.locator('#endDate_panel');
        await endPanel.waitFor({ state: 'visible' });

        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(500);
    }

    async createTimedPromotion(nameText: string, descriptionText: string) {
        await this.clickCreateTimedPromotion();
        await this.fillInput(this.name, nameText);
        await this.fillInput(this.description, descriptionText);
        await this.selectDropdownWithParentLocator(this.regionsId, 'BWA', this.dialog.getByRole('listbox'));
        await this.setDateRange();
        await this.selectDropdownWithParentLocator(this.multiCompFrequency, 'Daily', this.dialog);
        await this.fillInput(this.multiCompFrequencyValue.locator('input'), "1");
        await this.clickElement(this.saveBtn);
        await this.page.waitForLoadState('networkidle');
        await expect(this.verifyToast()).resolves.toBe(true);
    }

    async editTimedPromotion(promoName: string, newPromoName: string) {
        await this.clickEllipsisMenuForPromo(promoName);
        await this.clickEllipsisOption('Edit');
        await this.page.waitForLoadState('networkidle');

        await this.fillInput(this.name, newPromoName);
        await this.editDateRange();
        await this.clickElement(this.saveBtn);
        await this.page.waitForLoadState('networkidle');
        await expect(this.verifyToast()).resolves.toBe(true);
    }

    async DeleteFirstTimedPromotion(promoName: string) {
        await this.clickEllipsisMenuForPromo(promoName);
        await this.clickEllipsisOption('Delete');

        const confirmDialog = this.container.getByText('Delete Timed Promotion');
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        const yesButton = confirmDialog.locator('..').locator('..').getByRole('button').filter({ hasText: 'Yes' });
        await this.clickElement(yesButton);
        await this.page.waitForLoadState('networkidle');
        await this.verifyToast();
    }

    async verifyEditPageContent() {
        await expect(this.editName).toBeVisible({ timeout: 20000 });
        await expect(this.editDescription).toBeVisible({ timeout: 20000 });
        await expect(this.editStartDate).toBeVisible({ timeout: 20000 });
        await expect(this.editEndDate).toBeVisible({ timeout: 20000 });
        await expect(this.regionsId).toBeVisible({ timeout: 20000 });
        await expect(this.saveBtn).toBeVisible({ timeout: 20000 });
        await expect(this.cancelBtn).toBeVisible({ timeout: 20000 });
        await expect(this.isManual).toBeVisible({ timeout: 20000 });
        await expect(this.isTesting).toBeVisible({ timeout: 20000 });

        await CommonUtils.highlightElement(this.editName);
        await CommonUtils.highlightElement(this.editDescription);
        await CommonUtils.highlightElement(this.editStartDate);
        await CommonUtils.highlightElement(this.editEndDate);
        await CommonUtils.highlightElement(this.regionsId);
        await CommonUtils.highlightElement(this.saveBtn);
        await CommonUtils.highlightElement(this.cancelBtn);
        await CommonUtils.highlightElement(this.isManual);
        await CommonUtils.highlightElement(this.isTesting);
    }

    async activateTimedPromotion(promoName: string, confirm: boolean) {
        await this.clickEllipsisMenuForPromo(promoName);
        await this.clickEllipsisOption('Activate');

        const confirmDialog = this.container.getByText('Activate Timed Promotion').or(this.container.getByText('Are you sure you want to activate')).first();
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        const buttonText = confirm ? 'Yes' : 'No';
        const button = confirmDialog.locator('..').locator('..').getByRole('button').filter({ hasText: buttonText }).first();
        await this.clickElement(button);
        await this.page.waitForLoadState('networkidle');
        if (confirm) {
            await expect(this.verifyToast()).resolves.toBe(true);
        }
    }

    async approveTimedPromotion(promoName: string, confirm: boolean) {
        await this.clickEllipsisMenuForPromo(promoName);
        await this.clickEllipsisOption('Approve');

        const confirmDialog = this.container.getByText('Approve Timed Promotion').or(this.container.getByText('Are you sure you want to approve')).first();
        await expect(confirmDialog).toBeVisible({ timeout: 20000 });
        const buttonText = confirm ? 'Yes' : 'No';
        const button = confirmDialog.locator('..').locator('..').getByRole('button').filter({ hasText: buttonText }).first();
        await this.clickElement(button);
        await this.page.waitForLoadState('networkidle');
        if (confirm) {
            await expect(this.verifyToast()).resolves.toBe(true);
        }
    }

    async openOptInTriggers(promoName: string) {
        const row = this.tableRows.filter({ hasText: promoName });
        const cell = row.locator('td').nth(7);
        await CommonUtils.highlightElement(cell);
        const optInValue = (await cell.innerText()).trim();
        await this.clickEllipsisMenuForPromo(promoName);
        await this.clickEllipsisOption('Opt In Triggers');

        await expect(this.page).toHaveURL(/.*opt-in-triggers/, { timeout: 20000 });
        return optInValue === '—' ? 0 : parseInt(optInValue, 10);
    }

    async openHourlyConfiguration(promoName: string) {
        const row = this.tableRows.filter({ hasText: promoName });
        const cell = row.locator('td').nth(6);
        await CommonUtils.highlightElement(cell);
        const hourlyConfig = (await cell.innerText()).trim();

        await this.clickEllipsisMenuForPromo(promoName);
        await this.clickEllipsisOption('Hourly Configuration');

        await expect(this.page).toHaveURL(/.*hourly-configuration/, { timeout: 20000 });
        return hourlyConfig === '—' ? 0 : parseInt(hourlyConfig, 10);

    }

    async getApprovedByValue(promoName: string): Promise<string> {
        const row = this.tableRows.filter({ hasText: promoName });
        const cell = row.locator('td').nth(8);
        return (await cell.innerText()).trim();
    }

    async createOptIn(optInValue: number) {
        await this.page.getByRole('button').filter({ hasText: "Create Opt-In Trigger" }).click();
        await this.dialog.waitFor({ state: 'visible', timeout: 20000 });
        await this.selectDropdownWithParentLocator(this.type, 'On Bet Placement', this.dialog);
        await this.fillInput(this.minWager, '1')
        await this.fillInput(this.minOdds, '1')
        await this.saveBtn.click();
        await expect(this.verifyToast()).resolves.toBe(true);
        await this.page.waitForLoadState('networkidle')
        await this.page.locator('#component-container').getByRole('button').first().click();
        return optInValue + 1;
    }

    async createHourlyConfig(hourlyConfig: number) {
        await this.page.getByRole('button').filter({ hasText: "Create Hourly Configuration" }).click();
        await this.dialog.waitFor({ state: 'visible', timeout: 20000 });
        await this.selectDropdownWithParentLocator(this.activeDays, 'On Bet Placement', this.dialog);
        await this.setTimeRange();
        await this.dialog.getByText('Create Hourly Configuration').first().dblclick();
        await this.fillInput(this.chanceToWinEnd, '1');
        await this.fillInput(this.chanceToWinStart, '1');
        await this.clickElement(this.saveBtn);
        await expect(this.verifyToast()).resolves.toBe(true);
        await this.page.waitForLoadState('networkidle')
        await this.page.locator('#component-container').getByRole('button').first().click();
        return hourlyConfig + 1;
    }

    async searchTimedPromo() {
        await this.container.getByPlaceholder('Search').fill('Automation Test');
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle');
        await expect(this.tableRows.filter({ hasText: 'Automation Test' }).first()).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.tableRows.filter({ hasText: 'Automation Test' }).first());
    }

    async verifyOptInValues(optin: number, promoName: string) {
        const row = this.tableRows.filter({ hasText: promoName });
        const cell = row.locator('td').nth(7);
        const optInValue = await cell.innerText();
        await expect(parseInt(optInValue)).toBe(optin);
        await CommonUtils.highlightElement(cell)
    }

    async verifyHourlyConfigValues(optin: number, promoName: string) {
        const row = this.tableRows.filter({ hasText: promoName });
        const cell = row.locator('td').nth(6);
        const hourlyConfigValue = await cell.innerText();
        await expect(parseInt(hourlyConfigValue)).toBe(optin);
        await CommonUtils.highlightElement(cell)
    }
}

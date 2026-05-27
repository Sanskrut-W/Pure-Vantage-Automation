import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { promotionConfigLocators } from '../locators/promotionConfigLocators';
import { CommonUtils } from '../utils/commonUtils';

export class PromotionConfigPage extends BasePage {
    readonly createPromotionBtn: Locator;
    readonly editBtn: Locator;
    readonly copyBtn: Locator;
    readonly scheduleBtn: Locator;
    readonly deleteBtn: Locator;
    readonly dialog: Locator;
    readonly name: Locator;
    readonly promotionType: Locator;
    readonly vertical: Locator;
    readonly verticalCategory: Locator;
    readonly casinoGameCategory: Locator;
    readonly casinoGamePrvider: Locator;
    readonly startDate: Locator;
    readonly endDate: Locator;
    readonly cancelBtn: Locator;
    readonly saveBtn: Locator;
    readonly logout: Locator;
    readonly regionId: Locator;
    readonly optIn: Locator;

    readonly clonePromotionName: Locator;
    readonly cloneBtn: Locator;
    readonly editName: Locator;
    readonly editpromotionType: Locator;
    readonly editVertical: Locator;
    readonly editVerticalCategory: Locator;
    readonly editCasinoGameCategory: Locator;
    readonly editCasinoGamePrvider: Locator;
    readonly editStartDate: Locator;
    readonly editEndDate: Locator;
    readonly editRegionId: Locator;
    readonly editOptIn: Locator;
    readonly editLoggedout: Locator;
    readonly dynamicCTAInput: Locator;
    readonly IncludeAccTag: Locator;
    readonly ExcludeAccTag: Locator;

    constructor(page: Page) {
        super(page);
        this.createPromotionBtn = this.page.locator(promotionConfigLocators.createPromotionBtn);
        this.editBtn = this.page.locator(promotionConfigLocators.editBtn);
        this.copyBtn = this.page.locator(promotionConfigLocators.copyBtn);
        this.scheduleBtn = this.page.locator(promotionConfigLocators.scheduleBtn);
        this.deleteBtn = this.page.locator(promotionConfigLocators.deleteBtn);
        this.dialog = this.page.getByRole('dialog').first();
        this.name = this.dialog.locator(promotionConfigLocators.name);
        this.promotionType = this.dialog.locator(promotionConfigLocators.promotionType);
        this.vertical = this.dialog.locator(promotionConfigLocators.vertical);
        this.verticalCategory = this.dialog.locator(promotionConfigLocators.verticalCategory);
        this.casinoGamePrvider = this.dialog.locator(promotionConfigLocators.casinoGamePrvider);
        this.casinoGameCategory = this.dialog.locator(promotionConfigLocators.casinoGameCategory);
        this.endDate = this.dialog.locator(promotionConfigLocators.endDate);
        this.startDate = this.dialog.locator(promotionConfigLocators.startDate);
        this.logout = this.dialog.locator(promotionConfigLocators.logout);
        this.regionId = this.dialog.locator(promotionConfigLocators.regionId);
        this.optIn = this.dialog.locator(promotionConfigLocators.optIn);

        this.saveBtn = this.dialog.locator(promotionConfigLocators.saveBtn);
        this.cancelBtn = this.dialog.locator(promotionConfigLocators.cancelBtn);
        this.cloneBtn = this.dialog.getByRole('button', { name: 'Clone' });

        // Edit form locators (some may overlap with create form if they share the same dialog structure, but we define them separately for clarity and potential future divergence)    
        this.editName = this.page.locator(promotionConfigLocators.name);
        this.editpromotionType = this.page.locator(promotionConfigLocators.promotionType);
        this.editVertical = this.page.locator(promotionConfigLocators.vertical);
        this.editVerticalCategory = this.page.locator(promotionConfigLocators.verticalCategory);
        this.editCasinoGameCategory = this.page.locator(promotionConfigLocators.casinoGameCategory);
        this.editCasinoGamePrvider = this.page.locator(promotionConfigLocators.casinoGamePrvider);
        this.editStartDate = this.page.locator(promotionConfigLocators.startDate);
        this.editEndDate = this.page.locator(promotionConfigLocators.endDate);
        this.editRegionId = this.page.locator(promotionConfigLocators.regionId);
        this.editOptIn = this.page.locator(promotionConfigLocators.optIn);


        this.editLoggedout = this.page.locator(promotionConfigLocators.logout);
        this.dynamicCTAInput = this.page.locator(promotionConfigLocators.dynamicCtaInput);
        this.IncludeAccTag = this.page.getByText('Included Account Tags');
        this.ExcludeAccTag = this.page.getByText('Excluded Account Tags');


        this.clonePromotionName = this.dialog.locator(promotionConfigLocators.clonePromotionName);
    }

    async clickCreatePromotion() {
        console.log('Clicking Create Promotion button...');
        await this.clickElement(this.createPromotionBtn);
    }

    // Usually these button actions might require rows to be present
    // Leaving standard methods if the test suite ever uses them

    async clickEditFirstPromotion() {
        console.log('Clicking Edit button for the first Promotion Config...');
        if (await this.editBtn.count() > 0) {
            await this.clickElement(this.editBtn.first());
        }
    }

    async clickCopyFirstPromotion() {
        console.log('Clicking Copy button for the first Promotion Config...');
        if (await this.copyBtn.count() > 0) {
            await this.clickElement(this.copyBtn.first());
        }
    }

    async clickScheduleFirstPromotion() {
        console.log('Clicking Schedule button for the first Promotion Config...');
        if (await this.scheduleBtn.count() > 0) {
            await this.clickElement(this.scheduleBtn.first());
        }
    }

    async clickDeleteFirstPromotion() {
        console.log('Clicking Delete button for the first Promotion Config...');
        if (await this.deleteBtn.count() > 0) {
            await this.clickElement(this.deleteBtn.first());
            return this.deleteBtn.first().locator('..').locator('..').locator('..'); // Navigating up the DOM to the row level, adjust as necessary based on actual structure
        }
    }

    async selectDropdown(dropdownLocator: Locator, optionText: string) {
        await this.clickElement(dropdownLocator);
        // Assumes options are rendered in the DOM either by role="option" or generic text
        const optionLocator = this.page.getByText(optionText, { exact: true });
        await this.clickElement(optionLocator);
    }

    async setDateRange(startDate?: string, endDate?: string) {
        console.log(`Setting start and end dates dynamically via strictly enabled UI calendar nodes...`);

        await this.clickElement(this.startDate);
        const startPanel = this.page.locator('#startDate_panel');
        await startPanel.waitFor({ state: 'visible' });

        // Dynamically find the first currently ENABLED valid day in the active month 
        // We use span:not(.p-disabled) to dodge historical dates strictly enforced by PrimeVue
        const activeStartDay = startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeStartDay, { force: true });
        await this.page.waitForTimeout(500);
        await this.clickElement(this.endDate);
        const endPanel = this.page.locator('#endDate_panel');
        await endPanel.waitFor({ state: 'visible' });

        // Finding the LAST valid enable day guarantees it will always geometrically succeed the start date
        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(500);
        // await this.page.mouse.click(0, 0)
    }

    async editDateRange(startDate?: string, endDate?: string) {
        console.log(`Setting start and end dates dynamically via strictly enabled UI calendar nodes...`);

        await this.clickElement(this.editStartDate);
        const startPanel = this.page.locator('#startDate_panel');
        await startPanel.waitFor({ state: 'visible' });

        // Dynamically find the first currently ENABLED valid day in the active month 
        // We use span:not(.p-disabled) to dodge historical dates strictly enforced by PrimeVue
        const activeStartDay = startPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').first();
        await this.clickElement(activeStartDay, { force: true });
        await this.page.waitForTimeout(500);
        await this.dialog.click();

        await this.clickElement(this.editEndDate);
        const endPanel = this.page.locator('#endDate_panel');
        await endPanel.waitFor({ state: 'visible' });

        // Finding the LAST valid enable day guarantees it will always geometrically succeed the start date
        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(500);
        await this.dialog.click();
    }

    async createPromotion(name: string) {
        await this.clickElement(this.createPromotionBtn);
        await this.selectDropdown(this.promotionType, 'Top Up Tuesday')
        await this.selectDropdown(this.vertical, 'Casino')
        await this.verticalCategory.fill('test')
        await this.casinoGameCategory.fill('test')
        await this.casinoGamePrvider.fill('test')
        await this.optIn.fill('test')
        await this.selectDropdown(this.regionId, 'BW - en')
        await this.setDateRange('05/15/2024', '06/20/2024')
        await this.name.dblclick();
        await this.name.fill(name);
        await this.logout.click();
        await this.page.waitForTimeout(5000);
        await this.clickElement(this.dialog.getByRole('button', { name: 'Save' }));
    }

    async editPromotion(promoName: string) {
        if (!promoName) {
            console.error('Promo name not defined clicking the first edit button');
            promoName = await this.clonePromotion();
        }
        let row = await this.page.getByText(promoName);
        await row.locator('..').locator(promotionConfigLocators.editBtn).click();
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(5000);
        await this.editName.fill('test-automation');
        await this.selectDropdown(this.editpromotionType, 'Top Up Tuesday')
        await this.selectDropdown(this.editVertical, 'Casino')
        await this.editVerticalCategory.fill('test')
        await this.editCasinoGameCategory.fill('test')
        await this.editCasinoGamePrvider.fill('test')
        await this.editOptIn.fill('test')
        await this.editDateRange('05/15/2024', '06/20/2024')
        await this.page.waitForTimeout(5000);
        await this.page.getByRole('button', { name: 'Update Promotion Details' }).click();
        await this.page.getByText('Promotion details updated successfully').waitFor({ state: 'visible', timeout: 10000 });
        await CommonUtils.highlightElement(this.page.getByText('Promotion details updated successfully'));
        return 'test-automation';
    }


    async clonePromotion() {

        await this.copyBtn.first().click();
        // await expect(this.dialog).toBeVisible({timeout:20000}); 
        const copyName = await this.clonePromotionName.inputValue();
        console.log(copyName);
        await this.setDateRange('05/15/2024', '06/20/2024');
        await this.clickElement(this.cloneBtn);
        await this.page.waitForLoadState('networkidle');
        return copyName;
    }

    async DeleteFirstPromotion(RowName: string, confirm: boolean) {
        await expect(this.page.getByText(RowName)).toBeVisible({ timeout: 20000 });
        let row = await this.page.getByText(RowName);
        await row.locator('..').locator(promotionConfigLocators.deleteBtn).click();
        await expect(this.dialog).toBeVisible({ timeout: 20000 });
        if (confirm) {
            await CommonUtils.highlightElement(this.page.getByRole('button', { name: "Yes" }))
            await this.clickElement(this.page.getByRole('button', { name: "Yes" }));
        } else {
            await CommonUtils.highlightElement(this.page.getByRole('button', { name: "No" }))
            await this.clickElement(this.page.getByRole('button', { name: "No" }));
        }

    }

    async verifyTags() {
        await expect(this.IncludeAccTag).toBeVisible({ timeout: 20000 });
        await expect(this.ExcludeAccTag).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.IncludeAccTag);
        await CommonUtils.highlightElement(this.ExcludeAccTag);

        // await expect(this.IncludeAccTag.locator('..').getByText('Select A Tag')).toBeVisible({timeout:20000});
        // await expect(this.ExcludeAccTag.locator('..').getByText('Select A Tag')).toBeVisible({timeout:20000});
        // await CommonUtils.highlightElement(this.IncludeAccTag.locator('..').getByText('Select A Tag'));
        // await CommonUtils.highlightElement(this.ExcludeAccTag.locator('..').getByText('Select A Tag'));

        await expect(this.IncludeAccTag.locator('..').getByPlaceholder('Tag Value')).toBeVisible({ timeout: 20000 });
        await expect(this.ExcludeAccTag.locator('..').getByPlaceholder('Tag Value')).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.IncludeAccTag.locator('..').getByPlaceholder('Tag Value'));
        await CommonUtils.highlightElement(this.ExcludeAccTag.locator('..').getByPlaceholder('Tag Value'));

        await expect(this.IncludeAccTag.locator('..').getByRole('button').nth(0)).toBeVisible({ timeout: 20000 });
        await expect(this.IncludeAccTag.locator('..').getByRole('button').nth(1)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.IncludeAccTag.locator('..').getByRole('button').nth(0));
        await CommonUtils.highlightElement(this.IncludeAccTag.locator('..').getByRole('button').nth(1));

        await expect(this.ExcludeAccTag.locator('..').getByRole('button').nth(1)).toBeVisible({ timeout: 20000 });
        await expect(this.ExcludeAccTag.locator('..').getByRole('button').nth(1)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.ExcludeAccTag.locator('..').getByRole('button').nth(1));
        await CommonUtils.highlightElement(this.ExcludeAccTag.locator('..').getByRole('button').nth(1));
    }

    async verifyDynamicCTAInput() {
        await expect(this.dynamicCTAInput).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.dynamicCTAInput);
    }

    async verifyRegionConfiguration() {
        await expect(this.page.locator(promotionConfigLocators.regionConfiguration)).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.page.locator(promotionConfigLocators.regionConfiguration));
    }

    async editLoggedOut() {
        await expect(this.editLoggedout).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElement(this.editLoggedout);
    }

    async verifyPlayerReminderSection() {
        await expect(this.page.getByText('Player Reminder')).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.page.getByText('Player Reminder').locator('..').locator('..').locator('..'));
    }

    async verifyAddPlayerReminderButton() {
        await expect(this.page.getByRole('button', { name: 'Add New Reminder' })).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.page.getByRole('button', { name: 'Add New Reminder' }));
    }

    async verifyClonePromoRegionConfigButton() {
        await expect(this.page.getByRole('button', { name: 'Clone Promo Region Config' })).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.page.getByRole('button', { name: 'Clone Promo Region Config' }));
    }

    async verifyCreatePromotionRegionConfigurationButton() {
        await expect(this.page.getByRole('button', { name: 'Create Promotion Region Configuration' })).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.page.getByRole('button', { name: 'Create Promotion Region Configuration' }));
    }

    async verifyEditNameField() {
        await expect(this.editName).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editName);
    }

    async verifyEditPromotionTypeDropdown() {
        await expect(this.editpromotionType).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editpromotionType);
    }

    async verifyEditVerticalDropdown() {
        await expect(this.editVertical).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editVertical);
    }

    async verifyEditVerticalCategoryField() {
        await expect(this.editVerticalCategory).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editVerticalCategory);
    }

    async verifyEditCasinoGameCategoryField() {
        await expect(this.editCasinoGameCategory).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editCasinoGameCategory);
    }

    async verifyEditCasinoGameProviderField() {
        await expect(this.editCasinoGamePrvider).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editCasinoGamePrvider);
    }

    async verifyEditStartDateField() {
        await expect(this.editStartDate).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editStartDate);
    }

    async verifyEditEndDateField() {
        await expect(this.editEndDate).toBeVisible({ timeout: 20000 });
        await CommonUtils.highlightElementBorder(this.editEndDate);
    }

    async VerifyEditPageContent() {
        await this.verifyRegionConfiguration();
        await this.verifyEditNameField();
        await this.verifyEditPromotionTypeDropdown();
        await this.verifyEditVerticalDropdown();
        await this.verifyEditVerticalCategoryField();
        await this.verifyEditCasinoGameCategoryField();
        await this.verifyEditCasinoGameProviderField();
        await this.verifyEditStartDateField();
        await this.verifyEditEndDateField();
        await this.verifyTags();
        await this.verifyRegionConfiguration();
        await this.verifyDynamicCTAInput();
        await this.editLoggedOut();
        await this.verifyPlayerReminderSection();
        await this.verifyAddPlayerReminderButton();
        await this.verifyClonePromoRegionConfigButton();
        await this.verifyCreatePromotionRegionConfigurationButton();

    }
}

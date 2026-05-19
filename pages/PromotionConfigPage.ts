import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { promotionConfigLocators } from '../locators/promotionConfigLocators';
import { CommonUtils } from '../utils/commonUtils';

export class PromotionConfigPage extends BasePage {
    readonly createPromotionBtn: Locator;
    readonly editBtn: Locator;
    readonly copyBtn: Locator;
    readonly scheduleBtn: Locator;
    readonly deleteBtn: Locator;
    readonly dialog:Locator;
    readonly name:Locator;
    readonly promotionType:Locator;
    readonly vertical:Locator;
    readonly verticalCategory:Locator;
    readonly casinoGameCategory:Locator;
    readonly casinoGamePrvider:Locator;
    readonly startDate:Locator;
    readonly endDate:Locator;
    readonly cancelBtn:Locator;
    readonly saveBtn:Locator;
    readonly logout:Locator;
    readonly regionId:Locator;
    readonly optIn:Locator;

    readonly clonePromotionName:Locator;
    readonly cloneBtn:Locator;


    constructor(page: Page) {
        super(page);
        this.createPromotionBtn = this.page.locator(promotionConfigLocators.createPromotionBtn);
        this.editBtn = this.page.locator(promotionConfigLocators.editBtn);
        this.copyBtn = this.page.locator(promotionConfigLocators.copyBtn);
        this.scheduleBtn = this.page.locator(promotionConfigLocators.scheduleBtn);
        this.deleteBtn = this.page.locator(promotionConfigLocators.deleteBtn);
        this.dialog=this.page.getByRole('dialog').first();
        this.name=this.dialog.locator(promotionConfigLocators.name);
        this.promotionType=this.dialog.locator(promotionConfigLocators.promotionType);
        this.vertical=this.dialog.locator(promotionConfigLocators.vertical);
        this.verticalCategory=this.dialog.locator(promotionConfigLocators.verticalCategory);
        this.casinoGamePrvider=this.dialog.locator(promotionConfigLocators.casinoGamePrvider);
        this.casinoGameCategory=this.dialog.locator(promotionConfigLocators.casinoGameCategory);
        this.endDate=this.dialog.locator(promotionConfigLocators.endDate);
        this.startDate=this.dialog.locator(promotionConfigLocators.startDate);
        this.logout=this.dialog.locator(promotionConfigLocators.logout);
        this.regionId=this.dialog.locator(promotionConfigLocators.regionId);
        this.optIn=this.dialog.locator(promotionConfigLocators.optIn);
        
        this.saveBtn=this.dialog.locator(promotionConfigLocators.saveBtn);
        this.cancelBtn=this.dialog.locator(promotionConfigLocators.cancelBtn);
        this.cloneBtn=this.dialog.getByRole('button',{name:'Clone'});


        this.clonePromotionName=this.dialog.locator(promotionConfigLocators.clonePromotionName);
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
        await this.dialog.click();
        
        await this.clickElement(this.endDate);
        const endPanel = this.page.locator('#endDate_panel');
        await endPanel.waitFor({ state: 'visible' });
        
        // Finding the LAST valid enable day guarantees it will always geometrically succeed the start date
        const activeEndDay = endPanel.locator('td:not(.p-datepicker-other-month) span:not(.p-disabled)').last();
        await this.clickElement(activeEndDay, { force: true });
        await this.page.waitForTimeout(500);
        await this.dialog.click();
    }

    async createPromotion(){
        await this.clickElement(this.createPromotionBtn);
        await this.name.fill('test');
        await this.selectDropdown(this.promotionType,'Top Up Tuesday')
        await this.selectDropdown(this.vertical,'Casino')
        await this.verticalCategory.fill('test')
        await this.casinoGameCategory.fill('test')
        await this.casinoGamePrvider.fill('test')
        await this.optIn.fill('test')
        await this.selectDropdown(this.regionId,'BW - en')
        await this.setDateRange('05/15/2024', '06/20/2024')
        await this.logout.click();
        await this.page.waitForTimeout(5000);
        
        CommonUtils.highlightElement(this.dialog.getByRole('button',{name:'Save'}));
        CommonUtils.highlightElement(this.dialog.getByRole('button',{name:'Cancel'}));
    }

    async clonePromotion(){
        
        await this.copyBtn.first().click();
        // await expect(this.dialog).toBeVisible({timeout:20000}); 
        const copyName=await this.clonePromotionName.inputValue();
        console.log(copyName);
        await this.setDateRange('05/15/2024', '06/20/2024');
        await this.clickElement(this.cloneBtn);
        await this.page.waitForLoadState('networkidle');
        return copyName;
    }
}

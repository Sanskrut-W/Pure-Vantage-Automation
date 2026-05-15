import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { promotionConfigLocators } from '../locators/promotionConfigLocators';

export class PromotionConfigPage extends BasePage {
    readonly createPromotionBtn: Locator;
    readonly editBtn: Locator;
    readonly copyBtn: Locator;
    readonly scheduleBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createPromotionBtn = this.page.locator(promotionConfigLocators.createPromotionBtn);
        this.editBtn = this.page.locator(promotionConfigLocators.editBtn);
        this.copyBtn = this.page.locator(promotionConfigLocators.copyBtn);
        this.scheduleBtn = this.page.locator(promotionConfigLocators.scheduleBtn);
        this.deleteBtn = this.page.locator(promotionConfigLocators.deleteBtn);
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
}

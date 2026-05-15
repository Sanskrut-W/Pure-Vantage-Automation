import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { tagConfigLocators } from '../locators/tagConfigLocators';

export class TagConfigPage extends BasePage {
    readonly createTagBtn: Locator;
    readonly editBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createTagBtn = this.page.locator(tagConfigLocators.createTagBtn);
        this.editBtn = this.page.locator(tagConfigLocators.editBtn).first();
    }

    async clickCreateTag() {
        console.log('Clicking Create Tag button...');
        await this.clickElement(this.createTagBtn);
    }

    async clickEdit() {
        console.log('Clicking Edit button...');
        await this.clickElement(this.editBtn);
    }
}

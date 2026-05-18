import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { messageCategoriesLocators } from '../locators/messageCategoriesLocators';

export class MessageCategoriesPage extends BasePage {
    readonly createCategoryBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createCategoryBtn = this.page.locator(messageCategoriesLocators.createCategoryBtn);
        this.editBtn = this.page.locator(messageCategoriesLocators.editBtn).first();
        this.deleteBtn = this.page.locator(messageCategoriesLocators.deleteBtn).first();
    }

    async clickCreateCategory() {
        console.log('Clicking Create Category button...');
        await this.clickElement(this.createCategoryBtn);
    }

    async clickEdit() {
        console.log('Clicking Edit button...');
        await this.clickElement(this.editBtn);
    }

    async clickDelete() {
        console.log('Clicking Delete button...');
        await this.clickElement(this.deleteBtn);
    }
}

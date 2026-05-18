import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { transactionTypesLocators } from '../locators/transactionTypesLocators';

export class TransactionTypesPage extends BasePage {
    readonly createTransactionTypeBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createTransactionTypeBtn = this.page.locator(transactionTypesLocators.createTransactionTypeBtn);
        this.editBtn = this.page.locator(transactionTypesLocators.editBtn).first();
        this.deleteBtn = this.page.locator(transactionTypesLocators.deleteBtn).first();
    }

    async clickCreateTransactionType() {
        console.log('Clicking Create Transaction Type button...');
        await this.clickElement(this.createTransactionTypeBtn);
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

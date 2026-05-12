import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { fanExclusiveLocators } from '../locators/fanExclusiveLocators';

export class FanExclusivePage extends BasePage {
    readonly createFanExclusiveBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createFanExclusiveBtn = page.getByRole('button', { name: fanExclusiveLocators.buttonCreateFanExclusive });
        this.editBtn = page.getByRole('button', { name: fanExclusiveLocators.buttonEdit, exact: true });
        this.deleteBtn = page.getByRole('button', { name: fanExclusiveLocators.buttonDelete, exact: true });
    }

    /**
     * Clicks the Create Fan Exclusive button if visible.
     */
    async clickCreateFanExclusive() {
        console.log('Clicking Create Fan Exclusive button...');
        if (await this.createFanExclusiveBtn.count() > 0) {
            await this.clickElement(this.createFanExclusiveBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Clicks the Edit button on the first Fan Exclusive entry.
     */
    async clickEditFirstFanExclusive() {
        console.log('Clicking Edit button on first Fan Exclusive...');
        await this.clickElement(this.editBtn.first());
    }

    /**
     * Clicks the Delete button on the first Fan Exclusive entry.
     */
    async clickDeleteFirstFanExclusive() {
        console.log('Clicking Delete button on first Fan Exclusive...');
        await this.clickElement(this.deleteBtn.first());
    }
}

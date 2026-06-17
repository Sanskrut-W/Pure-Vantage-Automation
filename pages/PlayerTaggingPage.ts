import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { playerTaggingLocators } from '../locators/playerTaggingLocators';

export class PlayerTaggingPage extends BasePage {
    readonly tagPlayerBtn: Locator;
    readonly tagListBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.tagPlayerBtn = this.page.locator(playerTaggingLocators.tagPlayerBtn);
        this.tagListBtn = this.page.locator(playerTaggingLocators.tagListBtn);
    }

    async clickTagPlayer() {
        console.log('Clicking Tag Player button...');
        await this.clickElement(this.tagPlayerBtn);
    }

    async clickTagList() {
        console.log('Clicking Tag List button...');
        await this.clickElement(this.tagListBtn);
    }
}

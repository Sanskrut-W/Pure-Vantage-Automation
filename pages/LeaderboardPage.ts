import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { leaderboardLocators } from '../locators/leaderboardLocators';

export class LeaderboardPage extends BasePage {
    readonly createLeaderboardBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createLeaderboardBtn = page.getByRole('button', { name: leaderboardLocators.buttonCreateLeaderboard });
        this.editBtn = page.getByRole('button', { name: leaderboardLocators.buttonEdit, exact: true });
        this.deleteBtn = page.getByRole('button', { name: leaderboardLocators.buttonDelete, exact: true });
    }

    /**
     * Clicks the Create Leaderboard button if visible.
     */
    async clickCreateLeaderboard() {
        console.log('Clicking Create Leaderboard button...');
        if (await this.createLeaderboardBtn.count() > 0) {
            await this.clickElement(this.createLeaderboardBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Clicks the Edit button on the first Leaderboard entry.
     */
    async clickEditFirstLeaderboard() {
        console.log('Clicking Edit button on first Leaderboard...');
        await this.clickElement(this.editBtn.first());
    }

    /**
     * Clicks the Delete button on the first Leaderboard entry.
     */
    async clickDeleteFirstLeaderboard() {
        console.log('Clicking Delete button on first Leaderboard...');
        await this.clickElement(this.deleteBtn.first());
    }
}

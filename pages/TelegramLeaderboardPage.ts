import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { telegramLeaderboardLocators } from '../locators/telegramLeaderboardLocators';
import { CommonUtils } from '../utils/commonUtils';

export class TelegramLeaderboardPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly editBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.regionDropdown = page.locator(`div.p-dropdown:has(.p-dropdown-trigger[aria-label="${telegramLeaderboardLocators.dropdownSelectRegion}"]) span.p-dropdown-label`);
        this.editBtn = page.getByRole('button', { name: telegramLeaderboardLocators.buttonEdit, exact: true });
    }

    private async openDropdown(ariaLabel: string) {
        const hiddenInput = this.page.locator(
            `div.p-dropdown:has(.p-dropdown-trigger[aria-label="${ariaLabel}"]) .p-hidden-accessible input`
        );
        await hiddenInput.waitFor({ state: 'attached' });
        await hiddenInput.focus();
        await this.page.keyboard.press('Space');
        await this.page.waitForTimeout(500);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName} on Telegram Leaderboard...`);
        await CommonUtils.highlightElement(this.regionDropdown);
        await this.openDropdown(telegramLeaderboardLocators.dropdownSelectRegion);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    async clickEditFirstTelegramLeaderboard() {
        console.log('Clicking Edit button for the first Telegram Leaderboard...');
        if (await this.editBtn.count() > 0) {
            await this.clickElement(this.editBtn.first());
            await this.page.waitForTimeout(1000);
        }
    }

    async selectRegionAndEdit(regionName: string) {
        await this.selectRegion(regionName);
        await this.clickEditFirstTelegramLeaderboard();
    }
}

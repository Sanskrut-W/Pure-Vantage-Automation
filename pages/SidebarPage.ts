import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { sidebarLocators } from '../locators/sidebarLocators';

export class SidebarPage extends BasePage {
    readonly marketingNode: Locator;
    readonly bannerManagementNode: Locator;
    readonly bannerConfigNode: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize Locators in the constructor
        this.marketingNode = this.page.getByText(sidebarLocators.menuMarketing, { exact: true });
        this.bannerManagementNode = this.page.getByText(sidebarLocators.menuBannerManagement, { exact: true });
        this.bannerConfigNode = this.page.getByText(sidebarLocators.menuBannerConfig, { exact: true });
    }

    /**
     * Navigates down the menu hierarchy: Marketing -> Banner Management -> Banner Config
     */
    async navigateToBannerConfig() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Config');

        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        // await this.page.waitForTimeout(5000);
        await this.clickElement(this.bannerManagementNode);
        // await this.page.waitForTimeout(5000);

        await this.clickElement(this.bannerConfigNode);
        await this.clickElement(this.bannerConfigNode);
        await this.page.waitForTimeout(10000);

    }
}

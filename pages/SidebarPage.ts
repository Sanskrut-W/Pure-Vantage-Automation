import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { sidebarLocators } from '../locators/sidebarLocators';

export class SidebarPage extends BasePage {
    readonly marketingNode: Locator;
    readonly bannerManagementNode: Locator;
    readonly bannerConfigNode: Locator;
    readonly bannerOrderingNode: Locator;
    readonly tutorialNode: Locator;
    readonly tutorialConfigNode: Locator;
    readonly campaignNode: Locator;
    readonly cashbackPromotionsNode: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize Locators in the constructor
        this.marketingNode = this.page.getByText(sidebarLocators.menuMarketing, { exact: true });
        this.bannerManagementNode = this.page.getByText(sidebarLocators.menuBannerManagement, { exact: true });
        this.bannerConfigNode = this.page.getByText(sidebarLocators.menuBannerConfig, { exact: true });
        this.bannerOrderingNode = this.page.getByText(sidebarLocators.menuBannerOrdering, { exact: true });
        this.tutorialNode = this.page.getByText(sidebarLocators.menuTutorial, { exact: true });
        this.tutorialConfigNode = this.page.getByText(sidebarLocators.menuTutorialConfig, { exact: true });
        this.campaignNode = this.page.getByText(sidebarLocators.menuCampaign, { exact: true });
        this.cashbackPromotionsNode = this.page.getByText(sidebarLocators.menuCashbackPromotions, { exact: true });
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
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToCampaign() {
        console.log('Navigating via Sidebar: Marketing -> Campaign Management');
        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.campaignNode);
        await this.clickElement(this.campaignNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToCashbackPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Cashback Promotions');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.cashbackPromotionsNode);
        await this.clickElement(this.cashbackPromotionsNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToBannerOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Ordering');

        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(2000); // Allow animation to expand

        await this.clickElement(this.bannerManagementNode);
        await this.page.waitForTimeout(2000); // Allow animation to expand

        await this.clickElement(this.bannerOrderingNode);
        // Double-clicking just in case it was explicitly needed by the app
        await this.clickElement(this.bannerOrderingNode);

        await this.waitForPageLoad();
    }

    async navigateToTutorialConfig() {
        console.log('Navigating via Sidebar: Marketing -> Tutorial -> Tutorial Config');

        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        // await this.page.waitForTimeout(5000);
        await this.clickElement(this.tutorialNode);
        // await this.page.waitForTimeout(5000);

        await this.clickElement(this.tutorialConfigNode);
        await this.clickElement(this.tutorialConfigNode);
        await this.page.waitForLoadState('domcontentloaded');
    }
}

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
    readonly compensationNode: Locator;
    readonly couponManagementNode: Locator;
    readonly campaignNode: Locator;
    readonly cashbackPromotionsNode: Locator;
    readonly eventCalendarNode: Locator;
    readonly fanExclusiveNode: Locator;
    readonly platformNode: Locator;
    readonly formBuilderConfigurationNode: Locator;
    readonly formBuilderNode: Locator;
    readonly leaderboardNode: Locator;
    readonly loyaltyPromotionsNode: Locator;
    readonly segmentScheduleNode: Locator;
    readonly segmentationNode: Locator;
    readonly telegramLeaderboardNode: Locator;
    readonly toastConfigNode: Locator;
    readonly promotionsNode: Locator;
    readonly genericWheelNode: Locator;
    readonly systemAdminNode: Locator;
    readonly internalNotificationNode: Locator;

    constructor(page: Page) {
        super(page);

        // Initialize Locators in the constructor
        this.marketingNode = this.page.getByText(sidebarLocators.menuMarketing, { exact: true });
        this.bannerManagementNode = this.page.getByText(sidebarLocators.menuBannerManagement, { exact: true });
        this.bannerConfigNode = this.page.getByText(sidebarLocators.menuBannerConfig, { exact: true });
        this.bannerOrderingNode = this.page.getByText(sidebarLocators.menuBannerOrdering, { exact: true });
        this.tutorialNode = this.page.getByText(sidebarLocators.menuTutorial, { exact: true });
        this.tutorialConfigNode = this.page.getByText(sidebarLocators.menuTutorialConfig, { exact: true });
        this.compensationNode = this.page.getByText(sidebarLocators.menuCompensation, { exact: true });
        this.couponManagementNode = this.page.getByText(sidebarLocators.menuCouponManagement, { exact: true });
        this.campaignNode = this.page.getByText(sidebarLocators.menuCampaign, { exact: true });
        this.cashbackPromotionsNode = this.page.getByText(sidebarLocators.menuCashbackPromotions, { exact: true });
        this.eventCalendarNode = this.page.getByText(sidebarLocators.menuEventCalendar, { exact: true });
        this.fanExclusiveNode = this.page.getByText(sidebarLocators.menuFanExclusive, { exact: true }).first();
        this.platformNode = this.page.getByText(sidebarLocators.menuPlatform, { exact: true });
        this.formBuilderConfigurationNode = this.page.getByText(sidebarLocators.menuFormBuilderConfiguration, { exact: true });
        this.formBuilderNode = this.page.getByText(sidebarLocators.menuFormBuilder, { exact: true });
        this.leaderboardNode = this.page.getByText(sidebarLocators.menuLeaderboard, { exact: true });
        this.loyaltyPromotionsNode = this.page.getByText(sidebarLocators.menuLoyaltyPromotions, { exact: true });
        this.segmentScheduleNode = this.page.getByText(sidebarLocators.menuSegmentSchedule, { exact: true });
        this.segmentationNode = this.page.getByText(sidebarLocators.menuSegmentation, { exact: true });
        this.telegramLeaderboardNode = this.page.getByText(sidebarLocators.menuTelegramLeaderboard, { exact: true });
        this.toastConfigNode = this.page.getByText(sidebarLocators.menuToastConfig, { exact: true });
        this.promotionsNode = this.page.getByText(sidebarLocators.menuPromotions, { exact: true });
        this.genericWheelNode = this.page.getByText(sidebarLocators.menuGenericWheel, { exact: true });
        this.systemAdminNode = this.page.locator('span.menuitem-text').filter({ hasText: sidebarLocators.menuSystemAdmin });
        this.internalNotificationNode = this.page.getByRole('link', { name: sidebarLocators.menuInternalNotification });
    }

    /**
     * Navigates down the menu hierarchy: Marketing -> Banner Management -> Banner Config
     */
    async navigateToBannerConfig() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Config');

        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(5000);
        await this.clickElement(this.bannerManagementNode);
        await this.page.waitForTimeout(5000);

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

    async navigateToCouponManagement() {
        console.log('Navigating via Sidebar: Compensation -> Coupon Management');
        await this.clickElement(this.marketingNode);
        // Utilize the parent BasePage generic click functionality
        // await this.clickElement(this.compensationNode);
        // await this.page.waitForTimeout(2000); // Allow animation to expand

        await this.clickElement(this.couponManagementNode);
        await this.clickElement(this.couponManagementNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToEventCalendar() {
        console.log('Navigating via Sidebar: Marketing -> Event Calendar');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.eventCalendarNode);
        await this.clickElement(this.eventCalendarNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToFanExclusive() {
        console.log('Navigating via Sidebar: Marketing -> Fan Exclusive');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.fanExclusiveNode);
        await this.clickElement(this.fanExclusiveNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToFormBuilder() {
        console.log('Navigating via Sidebar: Platform -> Form Builder Configuration -> Form Builder');
        await this.clickElement(this.platformNode);
        await this.page.waitForTimeout(1000);
        await this.clickElement(this.formBuilderConfigurationNode);
        await this.page.waitForTimeout(1000);
        await this.clickElement(this.formBuilderNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToLeaderboard() {
        console.log('Navigating via Sidebar: Marketing -> Leaderboard');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.leaderboardNode);
        await this.clickElement(this.leaderboardNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToLoyaltyPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Loyalty Promotions');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.loyaltyPromotionsNode);
        await this.clickElement(this.loyaltyPromotionsNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToSegmentSchedule() {
        console.log('Navigating via Sidebar: Marketing -> Segment Schedule');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.segmentScheduleNode);
        await this.clickElement(this.segmentScheduleNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToSegmentation() {
        console.log('Navigating via Sidebar: Marketing -> Segmentation');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.segmentationNode);
        await this.clickElement(this.segmentationNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToTelegramLeaderboard() {
        console.log('Navigating via Sidebar: Marketing -> Telegram Leaderboard');
        await this.clickElement(this.marketingNode);
        await this.clickElement(this.telegramLeaderboardNode);
        await this.clickElement(this.telegramLeaderboardNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToToastConfig() {
        console.log('Navigating via Sidebar: Marketing -> Toast Configuration');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(1000); // Wait for the menu to fully expand
        await this.toastConfigNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.toastConfigNode, { force: true });
        await this.page.waitForTimeout(500);
        await this.clickElement(this.toastConfigNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToInternalNotifications() {
        console.log('Navigating via Sidebar: System Admin -> Internal Notification');
        await this.clickElement(this.systemAdminNode);
        await this.page.waitForTimeout(1000);
        await this.clickElement(this.internalNotificationNode);
        await this.clickElement(this.internalNotificationNode);
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToGenericWheel() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Generic Wheel');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(1000); // Wait for Marketing menu to fully expand
        await this.promotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionsNode);
        await this.page.waitForTimeout(1000); // Wait for Promotions menu to fully expand
        await this.genericWheelNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.genericWheelNode, { force: true });
        await this.page.waitForTimeout(500);
        await this.clickElement(this.genericWheelNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }
}

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
    readonly promotionConfigNode: Locator;
    readonly promotionOrderingNode: Locator;
    readonly scratchAndWinNode: Locator;
    readonly timedPromotionsNode: Locator;
    readonly tagManagementNode: Locator;
    readonly playerTaggingNode: Locator;
    readonly playerTaggingLogsNode: Locator;
    readonly segmentTaggingNode: Locator;
    readonly tagConfigNode: Locator;
    readonly tutorialOrderingNode: Locator;
    readonly marketingCompsNode: Locator;
    readonly compAlertsNode: Locator;
    readonly compsBulkNode: Locator;
    readonly compConfigNode: Locator;
    readonly manualCompsNode: Locator;
    readonly transactionTypesNode: Locator;
    readonly whitelistTestAccountsNode: Locator;
    readonly notificationManagementNode: Locator;
    readonly adminAccountsNode: Locator;
    readonly messageCategoriesNode: Locator;
    readonly messageCTANode: Locator;
    readonly messageTemplatesNode: Locator;
    readonly notificationScheduleNode: Locator;
    readonly formBuilderConfigNode: Locator;
    readonly stencilConfigNode: Locator;

    constructor(page: Page) {
        super(page);

        this.internalNotificationNode = this.page.getByRole('link', { name: sidebarLocators.menuInternalNotification });

        // All sidebar nodes use span.menuitem-text:text-is("...") — scoped to the Angular sidebar
        // label class AND exact-text matched so "Promotions" never matches "Cashback Promotions",
        // "Tutorial" never matches "Tutorial Config", etc. Also prevents strict-mode violations
        // from <h2> headings and breadcrumbs that repeat the same text after navigation.
        const menu = (label: string) =>
            this.page.locator(`span.menuitem-text:text-is("${label}")`).first();

        this.marketingNode                = menu(sidebarLocators.menuMarketing);
        this.bannerManagementNode         = menu(sidebarLocators.menuBannerManagement);
        this.bannerConfigNode             = menu(sidebarLocators.menuBannerConfig);
        this.bannerOrderingNode           = menu(sidebarLocators.menuBannerOrdering);
        this.tutorialNode                 = menu(sidebarLocators.menuTutorial);
        this.tutorialConfigNode           = menu(sidebarLocators.menuTutorialConfig);
        this.compensationNode             = menu(sidebarLocators.menuCompensation);
        this.couponManagementNode         = menu(sidebarLocators.menuCouponManagement);
        this.campaignNode                 = menu(sidebarLocators.menuCampaign);
        this.cashbackPromotionsNode       = menu(sidebarLocators.menuCashbackPromotions);
        this.eventCalendarNode            = menu(sidebarLocators.menuEventCalendar);
        this.fanExclusiveNode             = menu(sidebarLocators.menuFanExclusive);
        this.leaderboardNode              = menu(sidebarLocators.menuLeaderboard);
        this.loyaltyPromotionsNode        = menu(sidebarLocators.menuLoyaltyPromotions);
        this.segmentScheduleNode          = menu(sidebarLocators.menuSegmentSchedule);
        this.segmentationNode             = menu(sidebarLocators.menuSegmentation);
        this.telegramLeaderboardNode      = menu(sidebarLocators.menuTelegramLeaderboard);
        this.toastConfigNode              = menu(sidebarLocators.menuToastConfig);
        this.promotionsNode               = menu(sidebarLocators.menuPromotions);
        this.genericWheelNode             = menu(sidebarLocators.menuGenericWheel);
        this.promotionConfigNode          = menu(sidebarLocators.menuPromotionConfig);
        this.promotionOrderingNode        = menu(sidebarLocators.menuPromotionOrdering);
        this.scratchAndWinNode            = menu(sidebarLocators.menuScratchAndWin);
        this.timedPromotionsNode          = menu(sidebarLocators.menuTimedPromotions);
        this.tagManagementNode            = menu(sidebarLocators.menuTagManagement);
        this.playerTaggingNode            = menu(sidebarLocators.menuPlayerTagging);
        this.playerTaggingLogsNode        = menu(sidebarLocators.menuPlayerTaggingLogs);
        this.segmentTaggingNode           = menu(sidebarLocators.menuSegmentTagging);
        this.tagConfigNode                = menu(sidebarLocators.menuTagConfig);
        this.tutorialOrderingNode         = menu(sidebarLocators.menuTutorialOrdering);
        this.marketingCompsNode           = menu(sidebarLocators.menuMarketingComps);
        this.compAlertsNode               = menu(sidebarLocators.menuCompAlerts);
        this.compsBulkNode                = menu(sidebarLocators.menuCompsBulk);
        this.compConfigNode               = menu(sidebarLocators.menuCompConfig);
        this.manualCompsNode              = menu(sidebarLocators.menuManualComps);
        this.transactionTypesNode         = menu(sidebarLocators.menuTransactionTypes);
        this.whitelistTestAccountsNode    = menu(sidebarLocators.menuWhitelistTestAccounts);
        this.notificationManagementNode   = menu(sidebarLocators.menuNotificationManagement);
        this.adminAccountsNode            = menu(sidebarLocators.menuAdminAccounts);
        this.messageCategoriesNode        = menu(sidebarLocators.menuMessageCategories);
        this.messageCTANode               = menu(sidebarLocators.menuMessageCTA);
        this.messageTemplatesNode         = menu(sidebarLocators.menuMessageTemplates);
        this.notificationScheduleNode     = menu(sidebarLocators.menuNotificationSchedule);
        this.platformNode                 = menu(sidebarLocators.menuPlatform);
        this.formBuilderConfigurationNode = menu(sidebarLocators.menuFormBuilderConfiguration);
        this.formBuilderConfigNode        = menu(sidebarLocators.menuFormBuilderConfig);
        this.formBuilderNode              = menu(sidebarLocators.menuFormBuilder);
        this.systemAdminNode              = menu(sidebarLocators.menuSystemAdmin);
        this.stencilConfigNode            = menu(sidebarLocators.menuStencilConfig);
    }

    /**
     * Confirms the app actually finished loading after a fresh page.goto/reload — the
     * sidebar (and "Marketing" specifically) can intermittently fail to render on the
     * first load. If "Marketing" isn't visible within the timeout, reloads and checks
     * again (a few times) rather than immediately failing whatever test called this.
     */
    async waitForAppReady() {
        const maxAttempts = 3;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await this.page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
            const ready = await this.marketingNode.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
            if (ready) return;

            console.log(`App not ready after load (attempt ${attempt}/${maxAttempts}) — reloading...`);
            await this.page.reload();
            await this.page.waitForLoadState('domcontentloaded');
        }
        // Final attempt: let the caller's own error surface if this still isn't visible.
        await this.marketingNode.waitFor({ state: 'visible' });
    }

    /**
     * Expands a parent menu node ONLY if its child item is not already visible.
     * Menu clicks toggle: clicking an already-expanded node collapses it and hides
     * its children, so mid-test navigation (menu state unknown) must check first.
     */
    private async ensureMenuExpanded(parentNode: Locator, childNode: Locator) {
        const alreadyExpanded = await childNode
            .waitFor({ state: 'visible', timeout: 1500 })
            .then(() => true).catch(() => false);
        if (alreadyExpanded) return;

        await parentNode.scrollIntoViewIfNeeded();
        await this.clickElement(parentNode);
        await this.page.waitForTimeout(500); // allow expand animation
        await childNode.waitFor({ state: 'visible', timeout: 10000 });
    }

    /**
     * Navigates down the menu hierarchy: Marketing -> Banner Management -> Banner Config
     */
    async navigateToBannerConfig() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Config');

        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.clickElement(this.bannerManagementNode);
        await this.page.waitForTimeout(500);

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
        await this.page.waitForTimeout(500);
        await this.cashbackPromotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.cashbackPromotionsNode, { force: true });
        await this.page.waitForTimeout(300);
        await this.clickElement(this.cashbackPromotionsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToBannerOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Banner Management -> Banner Ordering');

        // Utilize the parent BasePage generic click functionality
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Allow animation to expand

        await this.clickElement(this.bannerManagementNode);
        await this.page.waitForTimeout(500); // Allow animation to expand

        await this.clickElement(this.bannerOrderingNode);
        // Double-clicking just in case it was explicitly needed by the app
        await this.clickElement(this.bannerOrderingNode);

        await this.waitForPageLoad();
    }

    async navigateToTutorialConfig() {
        console.log('Navigating via Sidebar: Marketing -> Tutorials -> Tutorial Configuration');
        // Must tolerate being called both from a fresh page load (Marketing/Tutorials
        // collapsed) and mid-test, navigating away and back from an already-expanded state
        // (e.g. tutorialOrdering TC-17). Unconditionally clicking each parent — like
        // navigateToBannerConfig does — collapses an already-open section instead of
        // expanding it, hiding "Tutorials" and causing an endless click-intercept loop.
        // ensureMenuExpanded checks first, so it's safe in both cases.
        // The final click uses dispatchEvent rather than a real mouse click: when this method
        // is called mid-test (navigating away from Tutorial Ordering and back), a lingering
        // PrimeNG tooltip overlay from earlier in the test can permanently intercept pointer
        // events near "Tutorials" — a forced click just activates whatever's actually on top at
        // those coordinates, since force:true only skips Playwright's own checks, not the
        // browser's real hit-testing. dispatchEvent fires the click directly at our chosen node
        // via JS, sidestepping hit-testing (and any animation/overlap) entirely.
        await this.ensureMenuExpanded(this.marketingNode, this.tutorialNode);
        await this.ensureMenuExpanded(this.tutorialNode, this.tutorialConfigNode);
        await this.tutorialConfigNode.scrollIntoViewIfNeeded();
        const tutorialConfigLink = this.page.locator('a', { has: this.tutorialConfigNode });
        await tutorialConfigLink.dispatchEvent('click');
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
        // Wait out the app's own page-loader overlay (pure-page-loader) before touching the
        // sidebar — clicking through it just times out waiting for it to go away on its own.
        await this.page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
        await this.marketingNode.dispatchEvent('click');
        await this.page.waitForTimeout(500);
        // dispatchEvent bypasses mouse hit-testing — needed because a lingering root-level
        // menu item can permanently overlap "Segmentation" here, the same interception bug
        // seen on Tutorial Config/Ordering (see navigateToTutorialConfig for the full story).
        await this.segmentationNode.dispatchEvent('click');
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
        await this.page.waitForTimeout(500); // Wait for the menu to fully expand
        await this.toastConfigNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.toastConfigNode, { force: true });
        await this.page.waitForTimeout(300);
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
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.promotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionsNode);
        await this.page.waitForTimeout(500); // Wait for Promotions menu to fully expand
        await this.genericWheelNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.genericWheelNode, { force: true });
        await this.page.waitForTimeout(500);
        await this.clickElement(this.genericWheelNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToPromotionConfig() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Promotion Config');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.promotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionsNode);
        await this.page.waitForTimeout(500); // Wait for Promotions menu to fully expand
        await this.promotionConfigNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionConfigNode, { force: true });
        await this.page.waitForTimeout(500);
        await this.clickElement(this.promotionConfigNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToPromotionOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Promotion Ordering');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.promotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionsNode);
        await this.page.waitForTimeout(500); // Wait for Promotions menu to fully expand
        await this.promotionOrderingNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionOrderingNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToScratchAndWin() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Scratch And Win Management');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.promotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionsNode);
        await this.page.waitForTimeout(500); // Wait for Promotions menu to fully expand
        await this.scratchAndWinNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.scratchAndWinNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToTimedPromotions() {
        console.log('Navigating via Sidebar: Marketing -> Promotions -> Timed Promotions');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.promotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.promotionsNode);
        await this.page.waitForTimeout(500); // Wait for Promotions menu to fully expand
        await this.timedPromotionsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.timedPromotionsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToPlayerTagging() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Player Tagging');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.tagManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.tagManagementNode);
        await this.page.waitForTimeout(500); // Wait for Tag Management menu to fully expand
        await this.playerTaggingNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.playerTaggingNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToPlayerTaggingLogs() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Player Tagging Logs');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.tagManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.tagManagementNode);
        await this.page.waitForTimeout(500); // Wait for Tag Management menu to fully expand
        await this.playerTaggingLogsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.playerTaggingLogsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToSegmentTagging() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Segment Tagging');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.tagManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.tagManagementNode);
        await this.page.waitForTimeout(500); // Wait for Tag Management menu to fully expand
        await this.segmentTaggingNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.segmentTaggingNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToTagConfig() {
        console.log('Navigating via Sidebar: Marketing -> Tag Management -> Tag Configuration');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500); // Wait for Marketing menu to fully expand
        await this.tagManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.tagManagementNode);
        await this.page.waitForTimeout(500); // Wait for Tag Management menu to fully expand
        await this.tagConfigNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.tagConfigNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToTutorialOrdering() {
        console.log('Navigating via Sidebar: Marketing -> Tutorial -> Tutorial Ordering');
        // See navigateToTutorialConfig for why this uses ensureMenuExpanded (safe whether
        // Marketing/Tutorials start collapsed or are already open from a prior navigation).
        // Unlike "Tutorial Configuration", "Tutorial Ordering" (the last item in the Tutorials
        // submenu) has a genuine, permanent DOM/CSS overlap with "Whitelist Test Accounts" — this
        // isn't an animation race, it reproduces every time, isolated or not. A forced click still
        // activates "Whitelist Test Accounts", because force:true only skips Playwright's own
        // pre-click checks — the browser still delivers a real mouse click to whichever element is
        // actually topmost at those coordinates. Keyboard (focus + Enter) doesn't trigger this
        // app's Angular (click) handler either. dispatchEvent fires the click event directly at
        // our chosen node via JS, with no hit-testing or event-type translation involved.
        await this.ensureMenuExpanded(this.marketingNode, this.tutorialNode);
        await this.ensureMenuExpanded(this.tutorialNode, this.tutorialOrderingNode);
        await this.tutorialOrderingNode.scrollIntoViewIfNeeded();
        const tutorialOrderingLink = this.page.locator('a', { has: this.tutorialOrderingNode });
        await tutorialOrderingLink.dispatchEvent('click');
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToCompAlerts() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comp Alerts');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.marketingCompsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.marketingCompsNode);
        await this.page.waitForTimeout(500); // Wait for Marketing Comps menu to fully expand
        await this.compAlertsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.compAlertsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToCompsBulk() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comps Bulk');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.marketingCompsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.marketingCompsNode);
        await this.page.waitForTimeout(500); // Wait for Marketing Comps menu to fully expand
        await this.compsBulkNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.compsBulkNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToCompConfig() {
        console.log('Navigating via Sidebar: Marketing Comps -> Comp Config');
        // Wait out the app's own page-loader overlay before touching the sidebar — clicking
        // "Marketing" while it's still up gets intercepted (same issue fixed for Segmentation).
        await this.page.locator('pure-page-loader').first().waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.marketingCompsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.marketingCompsNode);
        await this.page.waitForTimeout(500); // Wait for Marketing Comps menu to fully expand
        await this.compConfigNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.compConfigNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToManualComps() {
        console.log('Navigating via Sidebar: Marketing Comps -> Manual Comps');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.marketingCompsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.marketingCompsNode);
        await this.page.waitForTimeout(500); // Wait for Marketing Comps menu to fully expand
        await this.manualCompsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.manualCompsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToTransactionTypes() {
        console.log('Navigating via Sidebar: Marketing Comps -> Transaction Types');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.marketingCompsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.marketingCompsNode);
        await this.page.waitForTimeout(500); // Wait for Marketing Comps menu to fully expand
        await this.transactionTypesNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.transactionTypesNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToAdminAccounts() {
        console.log('Navigating via Sidebar: Notification Management -> Admin Accounts');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.notificationManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.notificationManagementNode);
        await this.page.waitForTimeout(500); // Wait for menu to expand
        await this.adminAccountsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.adminAccountsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToMessageCategories() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Message Categories');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.notificationManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.notificationManagementNode);
        await this.page.waitForTimeout(500);
        await this.messageCategoriesNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.messageCategoriesNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToMessageTemplates() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Message Templates');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.notificationManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.notificationManagementNode);
        await this.page.waitForTimeout(500);
        await this.messageTemplatesNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.messageTemplatesNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToMessageCTA() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Message CTA');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.notificationManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.notificationManagementNode);
        await this.page.waitForTimeout(500);
        await this.messageCTANode.scrollIntoViewIfNeeded();
        await this.clickElement(this.messageCTANode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToWhitelistTestAccounts() {
        console.log('Navigating via Sidebar: Marketing -> Whitelist Test Accounts');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.whitelistTestAccountsNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.whitelistTestAccountsNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToNotificationSchedule() {
        console.log('Navigating via Sidebar: Marketing -> Notification Management -> Notification Schedule');
        await this.clickElement(this.marketingNode);
        await this.page.waitForTimeout(500);
        await this.notificationManagementNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.notificationManagementNode);
        await this.page.waitForTimeout(500);
        await this.notificationScheduleNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.notificationScheduleNode, { force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToFormBuilder() {
        console.log('Navigating via Sidebar: Platform -> Form Builder Configuration -> Form Builder');
        await this.clickElement(this.platformNode);
        await this.page.waitForTimeout(1000);
        await this.formBuilderConfigNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.formBuilderConfigNode);
        await this.page.waitForTimeout(1000);
        await this.formBuilderNode.scrollIntoViewIfNeeded();
        await this.clickElement(this.formBuilderNode, { force: true });
        await this.page.waitForURL(/.*form-builder/, { timeout: 30000 });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
    }

    async navigateToStencilConfig() {
        console.log('Navigating via Sidebar: System Admin -> Stencil Configuration');
        // System Admin is at the bottom of the sidebar — must scroll to it before clicking
        await this.systemAdminNode.scrollIntoViewIfNeeded();
        await this.systemAdminNode.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(this.systemAdminNode, { force: true });
        await this.page.waitForTimeout(1000);
        await this.stencilConfigNode.scrollIntoViewIfNeeded();
        await this.stencilConfigNode.waitFor({ state: 'visible', timeout: 10000 });
        await this.clickElement(this.stencilConfigNode, { force: true });
        await this.clickElement(this.stencilConfigNode, { force: true });
        await this.page.waitForURL(/.*stencil/, { timeout: 30000 });
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(1000);
    }
}

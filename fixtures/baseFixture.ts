import { test as base } from '@playwright/test';
import { SidebarPage } from '../pages/SidebarPage';
import { BannerPage } from '../pages/BannerPage';
import { TutorialPage } from '../pages/TutorialPage';
import { CouponPage } from '../pages/CouponPage';
import { CampaignPage } from '../pages/CampaignPage';
import { CashbackPage } from '../pages/CashbackPage';
import { EventCalendarPage } from '../pages/EventCalendarPage';
import { FanExclusivePage } from '../pages/FanExclusivePage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { LoyaltyPromotionsPage } from '../pages/LoyaltyPromotionsPage';
import { SegmentSchedulePage } from '../pages/SegmentSchedulePage';
import { SegmentationPage } from '../pages/SegmentationPage';
import { TelegramLeaderboardPage } from '../pages/TelegramLeaderboardPage';
import { ToastConfigPage } from '../pages/ToastConfigPage';
import { GenericWheelPage } from '../pages/GenericWheelPage';
import { PromotionConfigPage } from '../pages/PromotionConfigPage';
import { PromotionOrderingPage } from '../pages/PromotionOrderingPage';
import { ScratchAndWinPage } from '../pages/ScratchAndWinPage';
import { TimedPromotionsPage } from '../pages/TimedPromotionsPage';
import { PlayerTaggingPage } from '../pages/PlayerTaggingPage';
import { PlayerTaggingLogsPage } from '../pages/PlayerTaggingLogsPage';
import { SegmentTaggingPage } from '../pages/SegmentTaggingPage';
import { TagConfigPage } from '../pages/TagConfigPage';
import { TutorialConfigPage } from '../pages/TutorialConfigPage';
import { TutorialOrderingPage } from '../pages/TutorialOrderingPage';
import { CompAlertsPage } from '../pages/CompAlertsPage';
import { CompsBulkPage } from '../pages/CompsBulkPage';
import { CompConfigPage } from '../pages/CompConfigPage';
import { ManualCompsPage } from '../pages/ManualCompsPage';
import { TransactionTypesPage } from '../pages/TransactionTypesPage';
import { AdminAccountsPage } from '../pages/AdminAccountsPage';
import { MessageCategoriesPage } from '../pages/MessageCategoriesPage';
import { MessageCTAPage } from '../pages/MessageCTAPage';
import { MessageTemplatesPage } from '../pages/MessageTemplatesPage';
import { NotificationSchedulePage } from '../pages/NotificationSchedulePage';
import { WhitelistTestAccountsPage } from '../pages/WhitelistTestAccountsPage';
import { FormBuilderPage } from '../pages/FormBuilderPage';
import { StencilConfigPage } from '../pages/StencilConfigPage';
import fs from 'fs';
import path from 'path';

// Declare types for custom fixtures
type MyFixtures = {
    // Shared setup for authenticated session (retained from original framework setup)
    authenticatedSession: void;
    // Page objects
    sidebarPage: SidebarPage;
    bannerPage: BannerPage;
    tutorialPage: TutorialPage;
    couponPage: CouponPage;
    campaignPage: CampaignPage;
    cashbackPage: CashbackPage;
    eventCalendarPage: EventCalendarPage;
    fanExclusivePage: FanExclusivePage;
    leaderboardPage: LeaderboardPage;
    loyaltyPromotionsPage: LoyaltyPromotionsPage;
    segmentSchedulePage: SegmentSchedulePage;
    segmentationPage: SegmentationPage;
    telegramLeaderboardPage: TelegramLeaderboardPage;
    toastConfigPage: ToastConfigPage;
    genericWheelPage: GenericWheelPage;
    promotionConfigPage: PromotionConfigPage;
    promotionOrderingPage: PromotionOrderingPage;
    scratchAndWinPage: ScratchAndWinPage;
    timedPromotionsPage: TimedPromotionsPage;
    playerTaggingPage: PlayerTaggingPage;
    playerTaggingLogsPage: PlayerTaggingLogsPage;
    segmentTaggingPage: SegmentTaggingPage;
    tagConfigPage: TagConfigPage;
    tutorialConfigPage: TutorialConfigPage;
    tutorialOrderingPage: TutorialOrderingPage;
    compAlertsPage: CompAlertsPage;
    compsBulkPage: CompsBulkPage;
    compConfigPage: CompConfigPage;
    manualCompsPage: ManualCompsPage;
    transactionTypesPage: TransactionTypesPage;
    adminAccountsPage: AdminAccountsPage;
    messageCategoriesPage: MessageCategoriesPage;
    messageCTAPage: MessageCTAPage;
    messageTemplatesPage: MessageTemplatesPage;
    notificationSchedulePage: NotificationSchedulePage;
    whitelistTestAccountsPage: WhitelistTestAccountsPage;
    formBuilderPage: FormBuilderPage;
    stencilConfigPage: StencilConfigPage;
};

// Extend basic test setup with page object initialization
export const test = base.extend<MyFixtures>({

    // Inject session storage before tests run
    authenticatedSession: [async ({ page }, use) => {
        const sessionPath = path.join(__dirname, '../session.json');
        if (fs.existsSync(sessionPath)) {
            const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
            await page.addInitScript((data) => {
                if (window.location.hostname.includes('osiristrading.net') || window.location.hostname.includes('osiristrading.com')) {
                    for (const [key, value] of Object.entries(data)) {
                        // Skip 'initialRoute' so the SPA router uses the current URL
                        // path on reload instead of always redirecting to /main/home
                        if (key === 'initialRoute') continue;
                        window.sessionStorage.setItem(key, value as string);
                    }
                }
            }, sessionData);
            console.log('✅ SessionStorage injected from fixture');
        } else {
            console.warn('⚠️ No session.json found. Tests requiring auth might fail.');
        }

        await use();
    }, { auto: true }], // Auto runs for every test

    // Instantiate and provide SidebarPage
    sidebarPage: async ({ page, authenticatedSession }, use) => {
        const sidebarPage = new SidebarPage(page);
        await use(sidebarPage);
    },

    // Instantiate and provide BannerPage
    bannerPage: async ({ page, authenticatedSession }, use) => {
        const bannerPage = new BannerPage(page);
        await use(bannerPage);
    },

    // Instantiate and provide TutorialPage
    tutorialPage: async ({ page, authenticatedSession }, use) => {
        const tutorialPage = new TutorialPage(page);
        await use(tutorialPage);
    },

    // Instantiate and provide CouponPage
    couponPage: async ({ page, authenticatedSession }, use) => {
        const couponPage = new CouponPage(page);
        await use(couponPage);
    },

    // Instantiate and provide CampaignPage
    campaignPage: async ({ page, authenticatedSession }, use) => {
        const campaignPage = new CampaignPage(page);
        await use(campaignPage);
    },

    // Instantiate and provide CashbackPage
    cashbackPage: async ({ page, authenticatedSession }, use) => {
        const cashbackPage = new CashbackPage(page);
        await use(cashbackPage);
    },

    // Instantiate and provide EventCalendarPage
    eventCalendarPage: async ({ page, authenticatedSession }, use) => {
        const eventCalendarPage = new EventCalendarPage(page);
        await use(eventCalendarPage);
    },

    // Instantiate and provide FanExclusivePage
    fanExclusivePage: async ({ page, authenticatedSession }, use) => {
        const fanExclusivePage = new FanExclusivePage(page);
        await use(fanExclusivePage);
    },

    // Instantiate and provide LeaderboardPage
    leaderboardPage: async ({ page, authenticatedSession }, use) => {
        const leaderboardPage = new LeaderboardPage(page);
        await use(leaderboardPage);
    },

    // Instantiate and provide LoyaltyPromotionsPage
    loyaltyPromotionsPage: async ({ page, authenticatedSession }, use) => {
        const loyaltyPromotionsPage = new LoyaltyPromotionsPage(page);
        await use(loyaltyPromotionsPage);
    },

    // Instantiate and provide SegmentSchedulePage
    segmentSchedulePage: async ({ page, authenticatedSession }, use) => {
        const segmentSchedulePage = new SegmentSchedulePage(page);
        await use(segmentSchedulePage);
    },

    // Instantiate and provide SegmentationPage
    segmentationPage: async ({ page, authenticatedSession }, use) => {
        const segmentationPage = new SegmentationPage(page);
        await use(segmentationPage);
    },

    // Instantiate and provide TelegramLeaderboardPage
    telegramLeaderboardPage: async ({ page, authenticatedSession }, use) => {
        const telegramLeaderboardPage = new TelegramLeaderboardPage(page);
        await use(telegramLeaderboardPage);
    },

    // Instantiate and provide ToastConfigPage
    toastConfigPage: async ({ page, authenticatedSession }, use) => {
        const toastConfigPage = new ToastConfigPage(page);
        await use(toastConfigPage);
    },

    // Instantiate and provide GenericWheelPage
    genericWheelPage: async ({ page, authenticatedSession }, use) => {
        const genericWheelPage = new GenericWheelPage(page);
        await use(genericWheelPage);
    },

    // Instantiate and provide PromotionConfigPage
    promotionConfigPage: async ({ page, authenticatedSession }, use) => {
        const promotionConfigPage = new PromotionConfigPage(page);
        await use(promotionConfigPage);
    },

    // Instantiate and provide PromotionOrderingPage
    promotionOrderingPage: async ({ page, authenticatedSession }, use) => {
        const promotionOrderingPage = new PromotionOrderingPage(page);
        await use(promotionOrderingPage);
    },

    // Instantiate and provide ScratchAndWinPage
    scratchAndWinPage: async ({ page, authenticatedSession }, use) => {
        const scratchAndWinPage = new ScratchAndWinPage(page);
        await use(scratchAndWinPage);
    },

    // Instantiate and provide TimedPromotionsPage
    timedPromotionsPage: async ({ page, authenticatedSession }, use) => {
        const timedPromotionsPage = new TimedPromotionsPage(page);
        await use(timedPromotionsPage);
    },

    // Instantiate and provide PlayerTaggingPage
    playerTaggingPage: async ({ page, authenticatedSession }, use) => {
        const playerTaggingPage = new PlayerTaggingPage(page);
        await use(playerTaggingPage);
    },

    // Instantiate and provide PlayerTaggingLogsPage
    playerTaggingLogsPage: async ({ page, authenticatedSession }, use) => {
        const playerTaggingLogsPage = new PlayerTaggingLogsPage(page);
        await use(playerTaggingLogsPage);
    },

    // Instantiate and provide SegmentTaggingPage
    segmentTaggingPage: async ({ page, authenticatedSession }, use) => {
        const segmentTaggingPage = new SegmentTaggingPage(page);
        await use(segmentTaggingPage);
    },

    // Instantiate and provide TagConfigPage
    tagConfigPage: async ({ page, authenticatedSession }, use) => {
        const tagConfigPage = new TagConfigPage(page);
        await use(tagConfigPage);
    },

    // Instantiate and provide TutorialConfigPage
    tutorialConfigPage: async ({ page, authenticatedSession }, use) => {
        const tutorialConfigPage = new TutorialConfigPage(page);
        await use(tutorialConfigPage);
    },

    // Instantiate and provide TutorialOrderingPage
    tutorialOrderingPage: async ({ page, authenticatedSession }, use) => {
        const tutorialOrderingPage = new TutorialOrderingPage(page);
        await use(tutorialOrderingPage);
    },

    // Instantiate and provide CompAlertsPage
    compAlertsPage: async ({ page, authenticatedSession }, use) => {
        const compAlertsPage = new CompAlertsPage(page);
        await use(compAlertsPage);
    },

    // Instantiate and provide CompsBulkPage
    compsBulkPage: async ({ page, authenticatedSession }, use) => {
        const compsBulkPage = new CompsBulkPage(page);
        await use(compsBulkPage);
    },

    // Instantiate and provide CompConfigPage
    compConfigPage: async ({ page, authenticatedSession }, use) => {
        const compConfigPage = new CompConfigPage(page);
        await use(compConfigPage);
    },

    // Instantiate and provide ManualCompsPage
    manualCompsPage: async ({ page, authenticatedSession }, use) => {
        const manualCompsPage = new ManualCompsPage(page);
        await use(manualCompsPage);
    },

    // Instantiate and provide TransactionTypesPage
    transactionTypesPage: async ({ page, authenticatedSession }, use) => {
        const transactionTypesPage = new TransactionTypesPage(page);
        await use(transactionTypesPage);
    },

    // Instantiate and provide AdminAccountsPage
    adminAccountsPage: async ({ page, authenticatedSession }, use) => {
        const adminAccountsPage = new AdminAccountsPage(page);
        await use(adminAccountsPage);
    },

    // Instantiate and provide MessageCategoriesPage
    messageCategoriesPage: async ({ page, authenticatedSession }, use) => {
        const messageCategoriesPage = new MessageCategoriesPage(page);
        await use(messageCategoriesPage);
    },

    // Instantiate and provide MessageTemplatesPage
    messageTemplatesPage: async ({ page, authenticatedSession }, use) => {
        const messageTemplatesPage = new MessageTemplatesPage(page);
        await use(messageTemplatesPage);
    },

    // Instantiate and provide MessageCTAPage
    messageCTAPage: async ({ page, authenticatedSession }, use) => {
        const messageCTAPage = new MessageCTAPage(page);
        await use(messageCTAPage);
    },

    // Instantiate and provide NotificationSchedulePage
    notificationSchedulePage: async ({ page, authenticatedSession }, use) => {
        const notificationSchedulePage = new NotificationSchedulePage(page);
        await use(notificationSchedulePage);
    },

    // Instantiate and provide WhitelistTestAccountsPage
    whitelistTestAccountsPage: async ({ page, authenticatedSession }, use) => {
        const whitelistTestAccountsPage = new WhitelistTestAccountsPage(page);
        await use(whitelistTestAccountsPage);
    },

    // Instantiate and provide FormBuilderPage
    formBuilderPage: async ({ page, authenticatedSession }, use) => {
        const formBuilderPage = new FormBuilderPage(page);
        await use(formBuilderPage);
    },

    // Instantiate and provide StencilConfigPage
    stencilConfigPage: async ({ page, authenticatedSession }, use) => {
        const stencilConfigPage = new StencilConfigPage(page);
        await use(stencilConfigPage);
    },
});

export { expect } from '@playwright/test';

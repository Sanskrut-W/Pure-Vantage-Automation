import { test as base } from '@playwright/test';
import { SidebarPage } from '../pages/SidebarPage';
import { BannerPage } from '../pages/BannerPage';
import { TutorialPage } from '../pages/TutorialPage';
import { CouponPage } from '../pages/CouponPage';
import { CampaignPage } from '../pages/CampaignPage';
import { CashbackPage } from '../pages/CashbackPage';
import { EventCalendarPage } from '../pages/EventCalendarPage';
import { FanExclusivePage } from '../pages/FanExclusivePage';
import { FormBuilderPage } from '../pages/FormBuilderPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { LoyaltyPromotionsPage } from '../pages/LoyaltyPromotionsPage';
import { SegmentSchedulePage } from '../pages/SegmentSchedulePage';
import { SegmentationPage } from '../pages/SegmentationPage';
import { TelegramLeaderboardPage } from '../pages/TelegramLeaderboardPage';
import { ToastConfigPage } from '../pages/ToastConfigPage';
import { GenericWheelPage } from '../pages/GenericWheelPage';
import { InternalNotificationPage } from '../pages/InternalNotificationPage';
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
    formBuilderPage: FormBuilderPage;
    leaderboardPage: LeaderboardPage;
    loyaltyPromotionsPage: LoyaltyPromotionsPage;
    segmentSchedulePage: SegmentSchedulePage;
    segmentationPage: SegmentationPage;
    telegramLeaderboardPage: TelegramLeaderboardPage;
    toastConfigPage: ToastConfigPage;
    genericWheelPage: GenericWheelPage;
    internalNotificationPage: InternalNotificationPage;
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

    // Instantiate and provide FormBuilderPage
    formBuilderPage: async ({ page, authenticatedSession }, use) => {
        const formBuilderPage = new FormBuilderPage(page);
        await use(formBuilderPage);
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

    // Instantiate and provide InternalNotificationPage
    internalNotificationPage: async ({ page, authenticatedSession }, use) => {
        const internalNotificationPage = new InternalNotificationPage(page);
        await use(internalNotificationPage);
    },
});

export { expect } from '@playwright/test';

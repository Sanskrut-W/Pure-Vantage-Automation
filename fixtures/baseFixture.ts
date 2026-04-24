import { test as base } from '@playwright/test';
import { SidebarPage } from '../pages/SidebarPage';
import { BannerPage } from '../pages/BannerPage';
import { TutorialPage } from '../pages/TutorialPage';
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
    }
});

export { expect } from '@playwright/test';

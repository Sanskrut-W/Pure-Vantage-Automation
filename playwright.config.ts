import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { envConfig } from './config/envConfig';

export default defineConfig({
    testDir: './tests',
    timeout: 1200000,
    expect: {
        timeout: 20000, // Globally grant up to 20s for any expect() assertion
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 1, // At least 1 retry locally, 2 on CI
    workers: process.env.CI ? 1 : 7,

    // Reporters configuration
    reporter: [
        ['list'],
        ['html', { outputFolder: 'reports/playwright-report', open: 'never' }]
    ],

    use: {
        // Base URL from environment config
        baseURL: envConfig.baseURL,

        // Ignore HTTPS errors for non-secure connection testing
        ignoreHTTPSErrors: true,

        // Fail tests if a single action (click, fill, etc.) takes longer than 2 minutes
        actionTimeout: 120000,

        // Artifacts
        trace: 'on',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // Use the saved auth state
        storageState: path.join(__dirname, 'auth.json'),
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});

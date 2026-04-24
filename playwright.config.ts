import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { envConfig } from './config/envConfig';

export default defineConfig({
    testDir: './tests',
    timeout: 1200000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 0 : 0, // At least 1 retry locally, 2 on CI
    workers: process.env.CI ? 1 : 5,

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

        // Artifacts
        trace: 'on-first-retry',
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

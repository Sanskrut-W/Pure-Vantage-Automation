import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../auth.json');
const sessionFile = path.join(__dirname, '../session.json');

(async () => {
    // Launch Chrome in non-headless mode so the user can interact
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();

    console.log('Navigating to the application...');

    // Using the dev URL directly here for manual setup 
    // You can change this if you want to auth against staging/prod
    await page.goto('https://purevantage-dev.osiristrading.com/main');

    console.log('\n--------------------------------------------------------------------------------');
    console.log('👉 MANUAL ACTION REQUIRED:');
    console.log('1. Please complete the Microsoft Single Sign-On process in the opened browser window.');
    console.log('2. Once you are successfully logged in and the dashboard is fully loaded, DO NOT CLOSE THE BROWSER.');
    console.log('3. Return to this terminal and press [ENTER]. The script will save your session and close the browser for you!');
    console.log('--------------------------------------------------------------------------------\n');

    // Wait for the user to press Enter in the terminal
    await new Promise(resolve => process.stdin.once('data', resolve));

    console.log('Saving session state...');

    try {
        // Wait a small buffer to ensure the page has completely finished writing to storage
        await page.waitForTimeout(3000);

        // 1. Capture Standard Storage State (Cookies & LocalStorage)
        await context.storageState({ path: authFile });
        console.log(`✅ Standard state (Cookies/Local) saved to ${authFile}`);

        // 2. Capture SessionStorage (as required by this specific application architecture)
        const sessionStorageData = await page.evaluate(() => JSON.stringify(sessionStorage));
        fs.writeFileSync(sessionFile, sessionStorageData);
        console.log(`✅ SessionStorage saved to ${sessionFile}`);

        console.log('\nAuthentication setup is complete! You can now run your tests headless.');
    } catch (error) {
        console.error('❌ Failed to save session:', error);
    }

    await browser.close();
    process.exit(0);
})();

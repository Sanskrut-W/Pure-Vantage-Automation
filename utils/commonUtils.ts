import { Locator, Page, TestInfo } from '@playwright/test';

export class CommonUtils {
    /**
     * Pauses execution for a specified duration in milliseconds.
     * Note: Should only be used for debugging.
     */
    static async pause(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generates a random alphanumeric string of a given length.
     */
    static generateRandomString(length: number = 8): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Highlights an element with a red border and background to make it visible
     * during test execution or debugging.
     */
    static async highlightElement(locator: Locator | null) {
        if (locator) {
            await locator.evaluate((el: HTMLElement) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.border = '2px solid red';
                el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            });
        } else {
            console.warn('Tried to highlight an empty locator.');
        }
    }

    /**
     * Highlights an element with a red border only.
     */
    static async highlightElementBorder(locator: Locator | null) {
        if (locator) {
            await locator.evaluate((el: HTMLElement) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.style.border = '2px solid red';
            });
        } else {
            console.warn('Tried to highlight an empty locator.');
        }
    }

    /**
     * Takes a screenshot of the current page state, saves it to a directory, 
     * and automatically attaches it to the Playwright HTML report.
     */
    static async captureScreenshot(page: Page, testInfo: TestInfo, screenshotDir: string, testId: string) {
        const screenshotPath = `${screenshotDir}/${testId}.png`;
        
        // Wait briefly for UI to stabilize
        await page.waitForTimeout(2000); 
        await page.screenshot({ path: screenshotPath, fullPage: false });
        
        await testInfo.attach(testId, { 
            path: screenshotPath,
            contentType: 'image/png'
        });
    }
}

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
     * Highlights an element with a glowing yellow-orange border, waits so it is
     * clearly visible in headed runs, then restores the original style.
     *
     * Usage — call exactly like captureScreenshot:
     *   await CommonUtils.highlight(locator);
     *   await CommonUtils.highlight(locator, 600);   // custom duration in ms
     */
    static async highlight(locator: Locator, durationMs: number = 500) {
        if (!locator) return;
        try {
            // Apply glowing highlight and save original styles
            await locator.evaluate((el: HTMLElement) => {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (el as any).__highlightPrev = {
                    outline:         el.style.outline,
                    backgroundColor: el.style.backgroundColor,
                    boxShadow:       el.style.boxShadow,
                    transition:      el.style.transition,
                };
                el.style.transition      = 'all 0.15s ease';
                el.style.outline         = '3px solid #f5a623';
                el.style.backgroundColor = 'rgba(245, 166, 35, 0.25)';
                el.style.boxShadow       = '0 0 10px 3px rgba(245, 166, 35, 0.7)';
            });

            // Wait so the highlight is visible to the tester
            await locator.page().waitForTimeout(durationMs);

            // Restore original styles
            await locator.evaluate((el: HTMLElement) => {
                const prev = (el as any).__highlightPrev;
                if (prev) {
                    el.style.outline         = prev.outline;
                    el.style.backgroundColor = prev.backgroundColor;
                    el.style.boxShadow       = prev.boxShadow;
                    el.style.transition      = prev.transition;
                    delete (el as any).__highlightPrev;
                }
            }).catch(() => {/* element may have been removed — ignore */});
        } catch {
            // Silently skip if element is gone or not yet rendered
        }
    }

    /**
     * Takes a screenshot of the current page state, saves it to a directory,
     * and automatically attaches it to the Playwright HTML report.
     */
    static async captureScreenshot(page: Page, testInfo: TestInfo, screenshotDir: string, testId: string) {
        const screenshotPath = `${screenshotDir}/${testId}.png`;
        
        // Wait briefly for UI to stabilize
        await page.waitForTimeout(500); 
        await page.screenshot({ path: screenshotPath, fullPage: false });
        
        await testInfo.attach(testId, { 
            path: screenshotPath,
            contentType: 'image/png'
        });
    }
}

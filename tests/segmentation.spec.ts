// npx playwright test tests/segmentation.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { SidebarPage } from '../pages/SidebarPage';
import { SegmentationPage } from '../pages/SegmentationPage';
import { envConfig } from '../config/envConfig';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToSegmentation(page: any, sidebarPage: any, segmentationPage: any) {
    await page.goto('/main/home');
    // Let the initial navigation's requests settle before reloading — reload() cancels
    // any still-in-flight requests from goto(), which can otherwise abort the user
    // role/permissions fetch and leave the app with incomplete permission data.
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    // Confirms the sidebar actually rendered before navigating — reloads and
    // re-checks a few times if not, instead of failing on a half-loaded page.
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToSegmentation();
    // Segmentation's own landing content (the Create Segment button) can independently
    // take well over a minute to render even after the sidebar/page shell is ready.
    await segmentationPage.createSegmentBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreateSegmentPopup(segmentationPage: any) {
    await segmentationPage.clickCreateSegment();
    await segmentationPage.waitForPopupLoad();
}

// Fills Segmentation Name, Description, and a full valid rule (Field/Operator/Value)
// on rule row 1 — the minimum needed for Create Query / Preview Query to enable.
async function fillMandatoryQueryFields(page: any, segmentationPage: any, name: string, description: string, value: string) {
    await segmentationPage.fillSegmentationName(name);
    await segmentationPage.fillDescription(description);
    await segmentationPage.fillValidRuleRow(1, value);
    await page.waitForTimeout(500);
}

// Creates a fresh, disposable segment for Edit/Delete tests to act on — each test gets its
// own record rather than relying on whatever pre-existing data happens to be in the table.
// Returns the created Name/Description so tests can search for and assert against them.
async function createDisposableSegment(page: any, segmentationPage: any): Promise<{ name: string; description: string }> {
    const name = `Segment_${CommonUtils.generateRandomString(8)}`;
    const description = `Automated setup ${CommonUtils.generateRandomString(8)}`;

    await openCreateSegmentPopup(segmentationPage);
    await fillMandatoryQueryFields(page, segmentationPage, name, description, 'TestValue');
    await expect(segmentationPage.createQueryBtn, 'Expected Create Query to enable while creating the disposable setup segment').toBeEnabled({ timeout: 10000 });
    await segmentationPage.clickCreateQuery();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText, 'Expected a toast confirming the disposable setup segment was created').toBeVisible({ timeout: 15000 });

    // The dialog may not auto-close on success — close it explicitly if it's still up, so the
    // table underneath is reachable (same quirk observed for the plain Create Query flow).
    const dialogClosedOnItsOwn = await segmentationPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
    if (!dialogClosedOnItsOwn) {
        await segmentationPage.clickCancelQuery().catch(() => {});
    }
    await page.waitForLoadState('networkidle').catch(() => {});

    const isPresent = await segmentationPage.isSegmentVisibleByName(name);
    if (!isPresent) {
        throw new Error(`Setup failed: disposable segment "${name}" was not found in the table after creation.`);
    }

    return { name, description };
}

// ─── Shared cross-worker segment for the Export Tests suite ───────────────────────
// The 16 Export tests run fully parallel across this project's up to 8 workers — each worker
// is a SEPARATE OS PROCESS, so "create the segment exactly once" can't be coordinated with an
// in-memory flag. These two helpers coordinate via a filesystem lock in the OS temp dir instead.
const EXPORT_SEGMENT_CACHE_PATH = path.join(os.tmpdir(), 'pv-segmentation-export-test-segment.json');
const EXPORT_SEGMENT_LOCK_PATH = path.join(os.tmpdir(), 'pv-segmentation-export-test-segment.lock');

// Builds a fully authenticated Page + page objects by hand, for use in beforeAll/afterAll hooks
// where test-scoped fixtures (page/sidebarPage/segmentationPage) aren't available. Mirrors
// baseFixture.ts's authenticatedSession fixture and playwright.config.ts's storageState exactly.
async function createAuthenticatedPage(browser: any): Promise<{ page: any; sidebarPage: any; segmentationPage: any; context: any }> {
    const context = await browser.newContext({
        baseURL: envConfig.baseURL,
        ignoreHTTPSErrors: true,
        storageState: path.join(__dirname, '../auth.json'),
    });
    const page = await context.newPage();

    const sessionPath = path.join(__dirname, '../session.json');
    if (fs.existsSync(sessionPath)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        await page.addInitScript((data: Record<string, string>) => {
            if (window.location.hostname.includes('osiristrading.net') || window.location.hostname.includes('osiristrading.com')) {
                for (const [key, value] of Object.entries(data)) {
                    if (key === 'initialRoute') continue;
                    window.sessionStorage.setItem(key, value as string);
                }
            }
        }, sessionData);
    }

    const sidebarPage = new SidebarPage(page);
    const segmentationPage = new SegmentationPage(page);
    return { page, sidebarPage, segmentationPage, context };
}

// Returns the ONE shared disposable segment for the Export Tests suite, creating it if no other
// worker has already done so. fs.writeFileSync(..., { flag: 'wx' }) is an atomic exclusive
// create at the OS level: it either succeeds (this worker won the race and must create the
// segment) or throws because the file already exists (another worker is already creating it, or
// already finished) — so exactly one worker ever performs the actual UI creation.
// Generously longer than a legitimate creation could ever take — navigateToSegmentation alone
// allows up to 180s for this app's slowest page loads, so anything idle far past that means the
// worker that acquired the lock crashed/was interrupted before finishing, not that it's just slow.
const EXPORT_SEGMENT_LOCK_STALE_MS = 4 * 60 * 1000;

async function getOrCreateSharedExportSegment(browser: any): Promise<{ name: string; description: string }> {
    for (let attempt = 0; attempt < 240; attempt++) {
        if (fs.existsSync(EXPORT_SEGMENT_CACHE_PATH)) {
            return JSON.parse(fs.readFileSync(EXPORT_SEGMENT_CACHE_PATH, 'utf-8'));
        }

        // A lock left over from a crashed/interrupted previous run would otherwise block every
        // future run forever — nothing would ever satisfy "wait for the cache file" below, since
        // the worker that was supposed to create it is gone. Confirmed live. Clear it if it's
        // far older than any real creation could take, so a fresh attempt can proceed.
        try {
            const lockAgeMs = Date.now() - fs.statSync(EXPORT_SEGMENT_LOCK_PATH).mtimeMs;
            if (lockAgeMs > EXPORT_SEGMENT_LOCK_STALE_MS) {
                console.warn(`Clearing stale Export Tests segment lock (${Math.round(lockAgeMs / 1000)}s old) left by an interrupted previous run.`);
                fs.unlinkSync(EXPORT_SEGMENT_LOCK_PATH);
            }
        } catch {
            // Lock file doesn't exist — nothing to clear.
        }

        let acquiredLock = false;
        try {
            fs.writeFileSync(EXPORT_SEGMENT_LOCK_PATH, String(process.pid), { flag: 'wx' });
            acquiredLock = true;
        } catch {
            // Another worker holds the lock — wait for it to finish and publish the cache file.
        }

        if (!acquiredLock) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
        }

        console.log('This worker won the race to create the shared Export Tests segment.');
        const { page, sidebarPage, segmentationPage, context } = await createAuthenticatedPage(browser);
        try {
            await navigateToSegmentation(page, sidebarPage, segmentationPage);
            const created = await createDisposableSegment(page, segmentationPage);
            fs.writeFileSync(EXPORT_SEGMENT_CACHE_PATH, JSON.stringify(created));
            console.log(`Created shared disposable segment "${created.name}" for all Export test cases.`);
            return created;
        } finally {
            await context.close().catch(() => {});
        }
    }

    throw new Error('Timed out waiting for another worker to create the shared Export Tests segment.');
}

// Deletes the one shared segment once the whole suite finishes. afterAll also runs once PER
// WORKER, so the same lock-file trick is reused in reverse: fs.unlinkSync is atomic — only the
// one worker that actually removes the cache file (the "last one out") proceeds to delete the
// segment via the UI; every other worker hits ENOENT (file already gone) and skips, since the
// segment — or another worker's in-progress deletion of it — is already handled.
async function releaseSharedExportSegment(browser: any, segment: { name: string; description: string } | undefined): Promise<void> {
    if (!segment) return;

    let shouldCleanup = false;
    try {
        fs.unlinkSync(EXPORT_SEGMENT_CACHE_PATH);
        shouldCleanup = true;
    } catch {
        // Already removed by another worker.
    }
    try {
        fs.unlinkSync(EXPORT_SEGMENT_LOCK_PATH);
    } catch {
        // Already removed, or never existed.
    }

    if (!shouldCleanup) return;

    const { page, sidebarPage, segmentationPage, context } = await createAuthenticatedPage(browser);
    try {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        await segmentationPage.clickDeleteForSegment(segment.name).catch(() => {});
        await segmentationPage.clickConfirmYes().catch(() => {});
        await page.waitForTimeout(1000).catch(() => {});
        console.log(`Deleted shared disposable segment "${segment.name}" after the Export Tests suite finished.`);
    } finally {
        await context.close().catch(() => {});
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
    });

    test('TC-1 Verify Segmentation page is accessible via Marketing -> Segmentation', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.createSegmentBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_segmentation_page_accessible');
        console.log('Segmentation page is accessible with Create Segment button visible.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-2 to TC-13 — Create Segment Popup Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Create Segment Popup Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        await openCreateSegmentPopup(segmentationPage);
    });

    test('TC-2 Verify clicking Create Segment opens the Create Segment popup', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.popupDialog).toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_create_segment_popup_open');
        console.log('Create Segment popup opened successfully.');
    });

    test('TC-3 Verify all mandatory fields and footer buttons are present in the popup', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.segmentationNameInput).toBeVisible();
        await expect(segmentationPage.descriptionInput).toBeVisible();
        await expect(segmentationPage.fieldDropdownAt(1)).toBeVisible();
        await expect(segmentationPage.operatorDropdownAt(1)).toBeVisible();
        await expect(segmentationPage.valueInputAt(1)).toBeVisible();

        await expect(segmentationPage.addRuleBtn.first()).toBeVisible();
        await expect(segmentationPage.addSortBtn).toBeVisible();

        await expect(segmentationPage.createQueryBtn).toBeVisible();
        await expect(segmentationPage.previewQueryBtn).toBeVisible();
        await expect(segmentationPage.clearQueryBtn).toBeVisible();
        await expect(segmentationPage.cancelQueryBtn).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_all_fields_present');
        console.log('All mandatory fields and footer buttons verified in the Create Segment popup.');
    });

    test('TC-4 Verify Create Query button is disabled when all fields are empty', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.createQueryBtn).toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_create_query_disabled_empty');
        console.log('Create Query button confirmed disabled with all fields empty.');
    });

    test('TC-5 Verify Preview Query button is disabled when all fields are empty', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.previewQueryBtn).toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_preview_query_disabled_empty');
        console.log('Preview Query button confirmed disabled with all fields empty.');
    });

    test('TC-6 Verify Operator dropdown is disabled until Field is selected', async ({ page, segmentationPage }, testInfo) => {
        expect(await segmentationPage.isOperatorDisabledAt(1)).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_operator_disabled_until_field');
        console.log('Operator dropdown confirmed disabled before a Field is selected.');
    });

    test('TC-7 Verify Value field is disabled until Field and Operator are selected', async ({ page, segmentationPage }, testInfo) => {
        expect(await segmentationPage.isValueDisabledAt(1)).toBe(true);

        await segmentationPage.selectFirstFieldOption(1);
        expect(await segmentationPage.isValueDisabledAt(1)).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_value_disabled_until_field_and_operator');
        console.log('Value field confirmed disabled until both Field and Operator are selected.');
    });

    test('TC-8 Verify Operator dropdown becomes enabled after selecting Field', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.selectFirstFieldOption(1);
        await page.waitForTimeout(500);
        expect(await segmentationPage.isOperatorDisabledAt(1)).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_operator_enabled_after_field');
        console.log('Operator dropdown became enabled after selecting a Field.');
    });

    test('TC-9 Verify Value field becomes enabled after selecting Field and Operator', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.selectFirstFieldOption(1);
        await segmentationPage.selectFirstOperatorOption(1);
        await page.waitForTimeout(500);
        expect(await segmentationPage.isValueDisabledAt(1)).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_value_enabled_after_field_and_operator');
        console.log('Value field became enabled after selecting both Field and Operator.');
    });

    test('TC-10 Verify changing Field clears Operator and Value on the same row', async ({ page, segmentationPage }, testInfo) => {
        const firstField = await segmentationPage.selectFieldOptionByIndex(1, 0);
        await segmentationPage.selectFirstOperatorOption(1);
        await segmentationPage.fillValueAt(1, 'TestValue');
        await page.waitForTimeout(500);

        // Re-select a DIFFERENT Field on the same row — re-picking the identical option
        // is a no-op as far as the app's value-change handler is concerned, so the change
        // must be a genuinely different value to exercise the clear-on-change behavior.
        const secondField = await segmentationPage.selectFieldOptionByIndex(1, 1);
        expect(secondField).not.toBe(firstField);
        await page.waitForTimeout(500);

        expect(await segmentationPage.isOperatorClearedAt(1)).toBe(true);
        expect(await segmentationPage.valueInputAt(1).inputValue()).toBe('');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_field_change_clears_operator_value');
        console.log('Changing Field cleared Operator and Value on the same row.');
    });

    test('TC-12 Verify Create Query button becomes enabled once all mandatory fields are filled', async ({ page, segmentationPage }, testInfo) => {
        const segName = `Segment_${CommonUtils.generateRandomString(6)}`;
        await fillMandatoryQueryFields(page, segmentationPage, segName, `Automated test description ${CommonUtils.generateRandomString(8)}`, 'TestValue');

        await expect(segmentationPage.createQueryBtn).toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_create_query_enabled');
        console.log('Create Query button became enabled once all mandatory fields were filled.');
    });

    test('TC-13 Verify Cancel button closes the popup without creating a segment', async ({ page, segmentationPage }, testInfo) => {
        const draftName = `Draft_${CommonUtils.generateRandomString(6)}`;
        await segmentationPage.fillSegmentationName(draftName);
        await segmentationPage.fillDescription('Draft description');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_step1_draft_filled');

        await segmentationPage.clickCancelQuery();
        await expect(segmentationPage.popupDialog).not.toBeVisible({ timeout: 10000 });

        const isPresent = await page.locator(`text=${draftName}`).isVisible().catch(() => false);
        expect(isPresent).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_step2_popup_closed');
        console.log(`✅ TC-13 PASSED — Cancel closed the popup and draft "${draftName}" was not created.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-14 to TC-20 — Add Rule (+) Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Add Rule (+) Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        await openCreateSegmentPopup(segmentationPage);
    });

    test('TC-14 Verify clicking + adds a new Field/Operator/Value rule row', async ({ page, segmentationPage }, testInfo) => {
        const countBefore = await segmentationPage.getRuleRowCount();
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);
        const countAfter = await segmentationPage.getRuleRowCount();

        expect(countAfter).toBe(countBefore + 1);
        await expect(segmentationPage.fieldDropdownAt(2)).toBeVisible();
        await expect(segmentationPage.operatorDropdownAt(2)).toBeVisible();
        await expect(segmentationPage.valueInputAt(2)).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_add_rule_row');
        console.log(`Rule row count increased from ${countBefore} to ${countAfter} after clicking +.`);
    });

    test('TC-15 Verify an AND/OR toggle appears between rule rows after adding a rule', async ({ page, segmentationPage }, testInfo) => {
        const toggleCountBefore = await segmentationPage.getAndOrToggleCount();
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);
        const toggleCountAfter = await segmentationPage.getAndOrToggleCount();

        expect(toggleCountAfter).toBeGreaterThan(toggleCountBefore);
        await expect(segmentationPage.andOrToggleAt(toggleCountAfter - 1)).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_and_or_toggle_appears');
        console.log('AND/OR toggle appeared between rule rows after clicking +.');
    });

    test('TC-16 Verify clicking the AND toggle switches it to OR', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);

        const toggle = segmentationPage.andOrToggleAt(0);
        await expect(toggle).toHaveText('AND');

        await segmentationPage.toggleAndOr(0);
        await page.waitForTimeout(300);
        await expect(toggle).toHaveText('OR');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_and_to_or');
        console.log('AND toggle switched to OR after click.');
    });

    test('TC-17 Verify clicking the OR toggle switches it back to AND', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);

        const toggle = segmentationPage.andOrToggleAt(0);
        await segmentationPage.toggleAndOr(0);
        await page.waitForTimeout(300);
        await expect(toggle).toHaveText('OR');

        await segmentationPage.toggleAndOr(0);
        await page.waitForTimeout(300);
        await expect(toggle).toHaveText('AND');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_or_back_to_and');
        console.log('OR toggle switched back to AND after a second click.');
    });

    test('TC-18 Verify Operator and Value on a newly added rule row are disabled until its own Field is selected', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);

        expect(await segmentationPage.isOperatorDisabledAt(2)).toBe(true);
        expect(await segmentationPage.isValueDisabledAt(2)).toBe(true);

        await segmentationPage.selectFirstFieldOption(2);
        await page.waitForTimeout(500);
        expect(await segmentationPage.isOperatorDisabledAt(2)).toBe(false);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_new_row_dependency_chain');
        console.log('Newly added rule row followed the same Field -> Operator -> Value dependency chain.');
    });

    test('TC-19 Verify multiple rule rows can be added by clicking + more than once', async ({ page, segmentationPage }, testInfo) => {
        const countBefore = await segmentationPage.getRuleRowCount();

        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);

        const countAfter = await segmentationPage.getRuleRowCount();
        expect(countAfter).toBe(countBefore + 2);
        await expect(segmentationPage.fieldDropdownAt(3)).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_multiple_rule_rows');
        console.log(`Rule row count increased from ${countBefore} to ${countAfter} after clicking + twice.`);
    });

    test('TC-20 Verify the Delete button removes an added rule row', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);
        const countAfterAdd = await segmentationPage.getRuleRowCount();

        const deleteButtonCount = await segmentationPage.getDeleteRuleButtonCount();
        expect(deleteButtonCount).toBeGreaterThan(0);

        await segmentationPage.deleteRuleAt(deleteButtonCount - 1);
        await page.waitForTimeout(500);
        const countAfterDelete = await segmentationPage.getRuleRowCount();

        expect(countAfterDelete).toBe(countAfterAdd - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_delete_rule_row');
        console.log(`Rule row count decreased from ${countAfterAdd} to ${countAfterDelete} after clicking Delete.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-21 to TC-23 — Sorting Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Sorting Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        await openCreateSegmentPopup(segmentationPage);
    });

    test('TC-21 Verify clicking Add Sort adds Sort Field and Order dropdowns', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddSort();
        await page.waitForTimeout(500);

        await expect(segmentationPage.sortFieldDropdownAt(0)).toBeVisible();
        await expect(segmentationPage.sortOrderDropdownAt(0)).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_add_sort_fields_appear');
        console.log('Sort Field and Order dropdowns appeared after clicking Add Sort.');
    });

    test('TC-22 Verify a delete (Remove sort) button is available for the sort row', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddSort();
        await page.waitForTimeout(500);

        await expect(segmentationPage.deleteSortButtons.first()).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_remove_sort_button_visible');
        console.log('Remove sort (delete) button is visible for the sort row.');
    });

    test('TC-23 Verify clicking Remove sort removes the sort row', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddSort();
        await page.waitForTimeout(500);
        const countAfterAdd = await segmentationPage.getSortRowCount();

        await segmentationPage.deleteSortAt(0);
        await page.waitForTimeout(500);
        const countAfterDelete = await segmentationPage.getSortRowCount();

        expect(countAfterDelete).toBeLessThan(countAfterAdd);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_remove_sort_row');
        console.log(`Sort row count decreased from ${countAfterAdd} to ${countAfterDelete} after clicking Remove sort.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-24 to TC-28 — Query Actions Tests (Preview / Clear / Create)
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Query Actions Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        await openCreateSegmentPopup(segmentationPage);
    });

    test('TC-24 Verify Preview Query shows a toast message once mandatory fields are filled', async ({ page, segmentationPage }, testInfo) => {
        const segName = `Segment_${CommonUtils.generateRandomString(6)}`;
        await fillMandatoryQueryFields(page, segmentationPage, segName, `Automated preview test ${CommonUtils.generateRandomString(8)}`, 'TestValue');
        await expect(segmentationPage.previewQueryBtn).toBeEnabled({ timeout: 10000 });

        await segmentationPage.clickPreviewQuery();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText).toBeVisible({ timeout: 10000 });
        console.log('Preview Query toast message:', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_preview_query_toast');
        console.log('Toast message displayed after clicking Preview Query.');
    });

    test('TC-25 Verify Clear button resets Segmentation Name and Description to blank', async ({ page, segmentationPage }, testInfo) => {
        const segName = `Segment_${CommonUtils.generateRandomString(6)}`;
        await segmentationPage.fillSegmentationName(segName);
        await segmentationPage.fillDescription('Some description to clear');

        await segmentationPage.clickClearQuery();
        await page.waitForTimeout(500);

        expect(await segmentationPage.segmentationNameInput.inputValue()).toBe('');
        expect(await segmentationPage.descriptionInput.inputValue()).toBe('');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_clear_resets_name_description');
        console.log('Clear button reset Segmentation Name and Description to blank.');
    });

    test('TC-26 Verify Clear button clears Field/Operator/Value and disables Create Query again', async ({ page, segmentationPage }, testInfo) => {
        const segName = `Segment_${CommonUtils.generateRandomString(6)}`;
        await fillMandatoryQueryFields(page, segmentationPage, segName, `Automated clear test ${CommonUtils.generateRandomString(8)}`, 'TestValue');
        await expect(segmentationPage.createQueryBtn).toBeEnabled({ timeout: 10000 });

        await segmentationPage.clickClearQuery();
        await page.waitForTimeout(500);

        expect(await segmentationPage.valueInputAt(1).inputValue()).toBe('');
        await expect(segmentationPage.createQueryBtn).toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_clear_resets_rule_and_disables_create');
        console.log('Clear button reset the rule row and disabled Create Query again.');
    });

    test('TC-27 Verify Clear button removes rule rows added via + and sort rows added via Add Sort', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddRule();
        await page.waitForTimeout(500);
        await segmentationPage.clickAddSort();
        await page.waitForTimeout(500);

        const ruleCountBeforeClear = await segmentationPage.getRuleRowCount();
        const sortCountBeforeClear = await segmentationPage.getSortRowCount();
        expect(ruleCountBeforeClear).toBeGreaterThan(1);
        expect(sortCountBeforeClear).toBeGreaterThan(0);

        await segmentationPage.clickClearQuery();
        await page.waitForTimeout(500);

        const ruleCountAfterClear = await segmentationPage.getRuleRowCount();
        const sortCountAfterClear = await segmentationPage.getSortRowCount();
        expect(ruleCountAfterClear).toBeLessThan(ruleCountBeforeClear);
        expect(sortCountAfterClear).toBeLessThan(sortCountBeforeClear);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_clear_removes_added_rows');
        console.log(`Clear reduced rule rows ${ruleCountBeforeClear} -> ${ruleCountAfterClear} and sort rows ${sortCountBeforeClear} -> ${sortCountAfterClear}.`);
    });

    test('TC-28 Verify Create Query successfully creates a segment when all mandatory fields are filled', async ({ page, segmentationPage }, testInfo) => {
        const segName = `Segment_${CommonUtils.generateRandomString(8)}`;
        // Description must be unique too — the app rejects Create Query with a duplicate
        // description even when the Segmentation Name is unique.
        const segDescription = `Automated creation test ${CommonUtils.generateRandomString(8)}`;
        await fillMandatoryQueryFields(page, segmentationPage, segName, segDescription, 'TestValue');
        await expect(segmentationPage.createQueryBtn).toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step1_form_filled');

        await segmentationPage.clickCreateQuery();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText).toBeVisible({ timeout: 15000 });
        console.log('Create Query toast message:', await toastText.textContent());

        // The dialog may not auto-close on success (some builds leave the query
        // builder open to let you create another segment) — close it explicitly
        // via Cancel if it's still up, so the table underneath is reachable.
        const dialogClosedOnItsOwn = await segmentationPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await segmentationPage.clickCancelQuery().catch(() => {});
        }
        await page.waitForLoadState('networkidle').catch(() => {});

        // The Segmentation table is server-paginated (multiple pages) — a newly
        // created record isn't reliably on whatever page happens to be showing,
        // so search for it by name rather than scanning the current page's DOM.
        const isPresent = await segmentationPage.isSegmentVisibleByName(segName);
        expect(isPresent).toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_step2_segment_created');
        console.log(`✅ TC-28 PASSED — Segment "${segName}" created and verified.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-29 to TC-34 — Edit Tests
//  Each test creates its own disposable segment first, so Edit only ever acts on
//  automation's own data. The Edit popup is assumed to be the same dialog/component as
//  Create Segment (same footer button styling, same field ids), just with Create Query
//  swapped for Update Query — unconfirmed beyond what the provided markup shows, so the
//  first two tests specifically verify that assumption before the rest rely on it.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Edit Tests', () => {
    let segment: { name: string; description: string };

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        segment = await createDisposableSegment(page, segmentationPage);
    });

    test('TC-29 Verify clicking Edit opens the Edit Segment popup pre-filled with the existing Name and Description', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickEditForSegment(segment.name);
        await segmentationPage.waitForPopupLoad();

        await expect(segmentationPage.segmentationNameInput, 'Expected Segmentation Name to be pre-filled with the existing value').toHaveValue(segment.name);
        await expect(segmentationPage.descriptionInput, 'Expected Description to be pre-filled with the existing value').toHaveValue(segment.description);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_edit_popup_prefilled');
        console.log(`Edit popup opened pre-filled for segment "${segment.name}".`);
    });

    test('TC-30 Verify the Edit Segment popup shows Update Query, Preview Query, Clear and Cancel (not Create Query)', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickEditForSegment(segment.name);
        await segmentationPage.waitForPopupLoad();

        await expect(segmentationPage.updateQueryBtn, 'Expected Update Query button to be visible in the Edit popup').toBeVisible();
        await expect(segmentationPage.previewQueryBtn).toBeVisible();
        await expect(segmentationPage.clearQueryBtn).toBeVisible();
        await expect(segmentationPage.cancelQueryBtn).toBeVisible();
        expect(await segmentationPage.createQueryBtn.count(), 'Expected Create Query to NOT appear in the Edit popup').toBe(0);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_edit_popup_footer_buttons');
        console.log('Edit popup shows Update Query in place of Create Query, alongside Preview Query/Clear/Cancel.');
    });

    test('TC-31 Verify Cancel on the Edit Segment popup closes it without changing the segment', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickEditForSegment(segment.name);
        await segmentationPage.waitForPopupLoad();

        const draftDescription = `Draft_${CommonUtils.generateRandomString(8)}`;
        await segmentationPage.fillDescription(draftDescription);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_step1_draft_edited');

        await segmentationPage.clickCancelQuery();
        await expect(segmentationPage.popupDialog, 'Expected the Edit popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await segmentationPage.searchSegment(segment.name);
        await expect(segmentationPage.getRowByName(segment.name), 'Expected the original Description to remain after cancelling Edit')
            .toContainText(segment.description);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_step2_unchanged_in_table');
        console.log(`✅ TC-31 PASSED — Cancel discarded the draft edit; "${segment.name}" still shows its original Description.`);
    });

    test('TC-32 Verify Preview Query shows a toast on the Edit Segment popup', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickEditForSegment(segment.name);
        await segmentationPage.waitForPopupLoad();

        await expect(segmentationPage.previewQueryBtn, 'Expected Preview Query to be enabled — the segment being edited is already valid').toBeEnabled({ timeout: 10000 });
        await segmentationPage.clickPreviewQuery();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText).toBeVisible({ timeout: 10000 });
        console.log('Preview Query toast message (Edit popup):', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_edit_preview_query_toast');
        console.log('Toast message displayed after clicking Preview Query on the Edit popup.');
    });

    test('TC-33 Verify updating the Description and clicking Update Query saves the change', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickEditForSegment(segment.name);
        await segmentationPage.waitForPopupLoad();

        const updatedDescription = `Updated_${CommonUtils.generateRandomString(8)}`;
        await segmentationPage.fillDescription(updatedDescription);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_step1_description_updated');

        await expect(segmentationPage.updateQueryBtn, 'Expected Update Query to be enabled with a valid edited form').toBeEnabled({ timeout: 10000 });
        await segmentationPage.clickUpdateQuery();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the update').toBeVisible({ timeout: 15000 });
        console.log('Update Query toast message:', await toastText.textContent());

        const dialogClosedOnItsOwn = await segmentationPage.popupDialog.waitFor({ state: 'hidden', timeout: 10000 }).then(() => true).catch(() => false);
        if (!dialogClosedOnItsOwn) {
            await segmentationPage.clickCancelQuery().catch(() => {});
        }
        await page.waitForLoadState('networkidle').catch(() => {});

        await segmentationPage.searchSegment(segment.name);
        await expect(segmentationPage.getRowByName(segment.name), 'Expected the table to show the updated Description')
            .toContainText(updatedDescription, { timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_step2_updated_in_table');
        console.log(`✅ TC-33 PASSED — "${segment.name}" now shows updated Description "${updatedDescription}".`);
    });

    test('TC-34 Verify Clear on the Edit Segment popup resets Name and Description to blank', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickEditForSegment(segment.name);
        await segmentationPage.waitForPopupLoad();

        await segmentationPage.clickClearQuery();
        await page.waitForTimeout(500);

        expect(await segmentationPage.segmentationNameInput.inputValue()).toBe('');
        expect(await segmentationPage.descriptionInput.inputValue()).toBe('');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_edit_clear_resets_fields');
        console.log('Clear button reset Segmentation Name and Description to blank on the Edit popup.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-35 to TC-37 — Delete Tests
//  Each test creates its own disposable segment first, so Delete only ever removes
//  automation's own data. Delete opens a PrimeNG ConfirmDialog (Yes/No), matching the
//  pattern already established for Lapse Comp's Approve/Mark For Processing/Delete flows.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Delete Tests', () => {
    let segment: { name: string; description: string };

    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        segment = await createDisposableSegment(page, segmentationPage);
    });

    test('TC-35 Verify clicking Delete opens a Yes/No confirmation dialog', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickDeleteForSegment(segment.name);

        await expect(segmentationPage.confirmDialogAcceptBtn, 'Expected a Yes button on the delete confirmation dialog').toBeVisible({ timeout: 10000 });
        await expect(segmentationPage.confirmDialogRejectBtn, 'Expected a No button on the delete confirmation dialog').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_delete_confirmation_dialog');
        console.log('Delete confirmation dialog (Yes/No) opened successfully.');
    });

    test('TC-36 Verify clicking No cancels deletion and the segment remains', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickDeleteForSegment(segment.name);
        await expect(segmentationPage.confirmDialogRejectBtn).toBeVisible({ timeout: 10000 });

        await segmentationPage.clickConfirmNo();
        await expect(segmentationPage.confirmDialogAcceptBtn, 'Expected the confirmation dialog to close after clicking No').not.toBeVisible({ timeout: 10000 });

        await segmentationPage.searchSegment(segment.name);
        await expect(segmentationPage.getRowByName(segment.name), 'Expected the segment to remain after cancelling Delete with No')
            .toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-36_delete_cancelled_segment_remains');
        console.log(`✅ TC-36 PASSED — "${segment.name}" remained after cancelling Delete (No).`);
    });

    test('TC-37 Verify clicking Yes deletes the segment', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickDeleteForSegment(segment.name);
        await expect(segmentationPage.confirmDialogAcceptBtn).toBeVisible({ timeout: 10000 });

        await segmentationPage.clickConfirmYes();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the deletion').toBeVisible({ timeout: 15000 });
        console.log('Delete toast message:', await toastText.textContent());

        await segmentationPage.searchSegment(segment.name);
        await expect(segmentationPage.getRowByName(segment.name), 'Expected no row for the deleted segment to remain')
            .not.toBeVisible({ timeout: 15000 });
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-37_segment_deleted');
        console.log(`✅ TC-37 PASSED — "${segment.name}" deleted successfully.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-38 to TC-53 — Export Tests
//  Each test creates its own disposable segment first, so Export only ever acts on
//  automation's own data. The Export Properties popup lets you split a segment's export
//  across multiple "Segmentation Group" / "Percentage" pairs; Save requires every row to
//  be valid (non-empty group, 1-100 percentage) AND the combined Total to not exceed 100%.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segmentation - Export Tests', () => {
    // No mode:'serial' here — the 16 tests below run fully parallel across this project's up
    // to 8 workers. Since each worker is a SEPARATE OS PROCESS with its own memory, "create the
    // segment exactly once" can't be coordinated with an in-memory flag; getOrCreateSharedExportSegment
    // below uses a filesystem lock (atomic exclusive file-create) so whichever worker's
    // beforeAll gets there first does the actual creation, and every other worker just waits
    // and reuses it.
    let segment: { name: string; description: string };

    test.beforeAll(async ({ browser }) => {
        segment = await getOrCreateSharedExportSegment(browser);
    });

    // Cleans up the one shared segment after the whole suite finishes. afterAll also runs once
    // PER WORKER — releaseSharedExportSegment uses the same lock-file trick so only whichever
    // worker finishes last (and wins the race to delete the cache file) performs the actual
    // deletion, instead of every worker trying to delete an already-gone segment.
    test.afterAll(async ({ browser }) => {
        await releaseSharedExportSegment(browser, segment);
    });

    // Each test still gets its own normal fixture-provided page — only the segment itself is
    // shared. This re-opens a fresh Export Properties popup for that same segment before every
    // test, so no test starts from another test's leftover filled-in values.
    test.beforeEach(async ({ page, sidebarPage, segmentationPage }) => {
        await navigateToSegmentation(page, sidebarPage, segmentationPage);
        await segmentationPage.clickExportForSegment(segment.name);
        await segmentationPage.popupDialog.waitFor({ state: 'visible', timeout: 15000 });
    });

    test('TC-38 Verify clicking Export opens the Export Properties popup', async ({ page }, testInfo) => {
        // beforeEach already opened it — this test just confirms that state directly.
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-38_export_popup_open');
        console.log('Export Properties popup opened successfully.');
    });

    test('TC-39 Verify the Export Properties popup shows Segmentation Group, Percentage, Add, Save and Cancel', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.segmentationGroupInputAt(0), 'Expected a Segmentation Group input').toBeVisible();
        await expect(segmentationPage.percentageInputAt(0), 'Expected a Percentage input').toBeVisible();
        await expect(segmentationPage.addExportRowBtn, 'Expected an Add button').toBeVisible();
        await expect(segmentationPage.exportSaveBtn, 'Expected a Save button').toBeVisible();
        await expect(segmentationPage.exportCancelBtn, 'Expected a Cancel button').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-39_export_fields_present');
        console.log('All Export Properties fields and buttons verified.');
    });

    test('TC-40 Verify Save is disabled by default (fields empty/invalid)', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.exportSaveBtn).toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-40_export_save_disabled_default');
        console.log('Save button confirmed disabled with Export Properties untouched.');
    });

    test('TC-41 Verify Save stays disabled when only Segmentation Group is filled', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportSaveBtn, 'Expected Save to stay disabled without a valid Percentage').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-41_save_disabled_group_only');
        console.log('Save stayed disabled with only Segmentation Group filled.');
    });

    test('TC-42 Verify Save stays disabled when Percentage is 0 (below the 1-100 range)', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '0');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportSaveBtn, 'Expected Save to stay disabled with Percentage below 1').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-42_save_disabled_percentage_zero');
        console.log('Save stayed disabled with Percentage at 0.');
    });

    test('TC-43 Verify Save stays disabled when Percentage exceeds 100', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '101');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportSaveBtn, 'Expected Save to stay disabled with Percentage above 100').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-43_save_disabled_percentage_over_100');
        console.log('Save stayed disabled with Percentage at 101.');
    });

    test('TC-44 Verify Save enables once Segmentation Group and a valid Percentage (1-100) are filled', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '50');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportSaveBtn, 'Expected Save to enable with a fully valid single row').toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-44_save_enabled_valid_row');
        console.log('Save enabled with a single valid Segmentation Group/Percentage row.');
    });

    test('TC-45 Verify the Total reflects the entered Percentage value', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '35');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportTotalDisplay, 'Expected Total to reflect the entered Percentage').toContainText('35', { timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-45_total_reflects_percentage');
        console.log(`Total display now reads: "${await segmentationPage.getExportTotalText()}"`);
    });

    test('TC-46 Verify clicking Add appends a second Segmentation Group and Percentage row', async ({ page, segmentationPage }, testInfo) => {
        const countBefore = await segmentationPage.getExportRowCount();
        await segmentationPage.clickAddExportRow();
        await page.waitForTimeout(300);
        const countAfter = await segmentationPage.getExportRowCount();

        expect(countAfter, 'Expected row count to increase by 1 after clicking Add').toBe(countBefore + 1);
        await expect(segmentationPage.segmentationGroupInputAt(1)).toBeVisible();
        await expect(segmentationPage.percentageInputAt(1)).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-46_add_export_row');
        console.log(`Export row count increased from ${countBefore} to ${countAfter} after clicking Add.`);
    });

    test('TC-47 Verify a Delete button appears for rows once a second row is added', async ({ page, segmentationPage }, testInfo) => {
        await expect(segmentationPage.deleteExportRowButtons, 'Expected no Delete button with only one row').toHaveCount(0);

        await segmentationPage.clickAddExportRow();
        await page.waitForTimeout(300);

        const deleteCount = await segmentationPage.deleteExportRowButtons.count();
        expect(deleteCount, 'Expected a Delete button for each row once a second row exists').toBe(2);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-47_delete_buttons_appear');
        console.log(`${deleteCount} Delete buttons visible after adding a second row.`);
    });

    test('TC-48 Verify the Delete button removes an export row', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.clickAddExportRow();
        await page.waitForTimeout(300);
        const countAfterAdd = await segmentationPage.getExportRowCount();

        await segmentationPage.deleteExportRowAt(0);
        await page.waitForTimeout(300);
        const countAfterDelete = await segmentationPage.getExportRowCount();

        expect(countAfterDelete, 'Expected row count to decrease by 1 after clicking Delete').toBe(countAfterAdd - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-48_delete_export_row');
        console.log(`Export row count decreased from ${countAfterAdd} to ${countAfterDelete} after clicking Delete.`);
    });

    test('TC-49 Verify the Total sums Percentage values across multiple rows', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '30');

        await segmentationPage.clickAddExportRow();
        await page.waitForTimeout(300);
        await segmentationPage.fillSegmentationGroupAt(1, 'GroupB');
        await segmentationPage.fillPercentageAt(1, '20');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportTotalDisplay, 'Expected Total to reflect the sum of both rows (50)').toContainText('50', { timeout: 5000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-49_total_sums_multiple_rows');
        console.log(`Total display now reads: "${await segmentationPage.getExportTotalText()}" for 30% + 20%.`);
    });

    test('TC-50 Verify Save disables when the combined Total exceeds 100', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '60');

        await segmentationPage.clickAddExportRow();
        await page.waitForTimeout(300);
        await segmentationPage.fillSegmentationGroupAt(1, 'GroupB');
        await segmentationPage.fillPercentageAt(1, '50');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportTotalDisplay, 'Expected Total to show 110').toContainText('110', { timeout: 5000 });
        await expect(segmentationPage.exportSaveBtn, 'Expected Save to disable once the combined Total exceeds 100').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-50_save_disabled_total_exceeds_100');
        console.log('Save disabled with combined Total of 110% (60% + 50%).');
    });

    test('TC-51 Verify Save enables when the combined Total is 100 or less with all rows valid', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '60');

        await segmentationPage.clickAddExportRow();
        await page.waitForTimeout(300);
        await segmentationPage.fillSegmentationGroupAt(1, 'GroupB');
        await segmentationPage.fillPercentageAt(1, '40');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportTotalDisplay, 'Expected Total to show 100').toContainText('100', { timeout: 5000 });
        await expect(segmentationPage.exportSaveBtn, 'Expected Save to enable with a combined Total of exactly 100').toBeEnabled({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-51_save_enabled_total_100');
        console.log('Save enabled with combined Total of 100% (60% + 40%).');
    });

    test('TC-52 Verify Cancel closes the Export Properties popup without saving', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '50');
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52_step1_draft_filled');

        await segmentationPage.clickExportCancel();
        await expect(segmentationPage.popupDialog, 'Expected the Export Properties popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-52_step2_popup_closed');
        console.log('Cancel closed the Export Properties popup without saving.');
    });

    test('TC-53 Verify Save shows a toast message once the export is valid and submitted', async ({ page, segmentationPage }, testInfo) => {
        await segmentationPage.fillSegmentationGroupAt(0, 'GroupA');
        await segmentationPage.fillPercentageAt(0, '100');
        await page.waitForTimeout(300);

        await expect(segmentationPage.exportSaveBtn).toBeEnabled({ timeout: 10000 });
        await segmentationPage.clickExportSave();

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the export').toBeVisible({ timeout: 15000 });
        console.log('Export Save toast message:', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-53_export_save_toast');
        console.log(`✅ TC-53 PASSED — Export of "${segment.name}" saved, toast displayed.`);
    });
});

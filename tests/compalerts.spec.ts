// npx playwright test tests/compalerts.spec.ts
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation helper ─────────────────────────────────────────────────
async function navigateToCompAlerts(page: any, sidebarPage: any, compAlertsPage: any) {
    await page.goto('/main/home');
    await page.reload();
    await sidebarPage.waitForPageLoad();
    await sidebarPage.navigateToCompAlerts();
    await expect(page).toHaveURL(/stencil-comps\/alerts-management/);
    await page.waitForLoadState('networkidle');

    // Deep-link navigation via sidebar clicks doesn't always fully hydrate the
    // Angular/Stencil component on first load — reload once if nothing
    // rendered yet (established pattern proven across this project's other
    // spec files).
    const loaded = await compAlertsPage.createAlertBtn
        .waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
    if (!loaded) {
        await page.reload();
        await page.waitForLoadState('networkidle');
        await compAlertsPage.createAlertBtn.waitFor({ state: 'visible', timeout: 30000 });
    }
}

// ─── Shared helper for Edit Alert tests ───────────────────────────────────────
// Creates a disposable Daily alert with EVERY field filled (not just the
// mandatory ones) and returns its name. Edit tests use this instead of ever
// touching the first row / any pre-existing alert — every change they make
// only ever affects data this automation itself created.
async function createDisposableDailyAlert(page: any, compAlertsPage: any, namePrefix: string): Promise<string> {
    const alertName = `${namePrefix}_${CommonUtils.generateRandomString(6)}`;
    await compAlertsPage.clickCreateAlert();
    const dialog = compAlertsPage.getAlertDialog();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await compAlertsPage.fillAlertName(dialog, alertName);
    // Next Alert Check Date — clicking Schedule At afterward dismisses the
    // calendar (per the app's own UX) and doubles as opening it for the next step.
    await compAlertsPage.setNextAlertCheckDate(dialog);
    await compAlertsPage.selectScheduleAt(dialog, 'Daily');
    // End Date — dismissed by clicking whichever frequency field is active (Every Day At here).
    await compAlertsPage.setEndDate(dialog);
    await compAlertsPage.setEveryDayAt(dialog, 1, 1);
    await compAlertsPage.fillAlertEmails(dialog, 'qa.disposable1@example.com,qa.disposable2@example.com');
    await compAlertsPage.fillAlertFrequency(dialog, '5');
    await compAlertsPage.selectFirstAvailableGroupResults(dialog);
    await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');
    await compAlertsPage.clickSave(dialog);

    await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
        .toBeVisible({ timeout: 15000 });
    await expect(dialog).not.toBeVisible({ timeout: 15000 });
    await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
        .toBeVisible({ timeout: 15000 });

    return alertName;
}

// test.describe('Comp Alerts - Page Level Tests', () => {
//     test.beforeEach(async ({ page, sidebarPage, compAlertsPage }) => {
//         await navigateToCompAlerts(page, sidebarPage, compAlertsPage);
//     });

//     test('TC-1 Verify Comp Alerts page is accessible and Create Alert button is visible', async ({ page, compAlertsPage }, testInfo) => {
//         await expect(compAlertsPage.createAlertBtn).toBeVisible({ timeout: 20000 });
//         await CommonUtils.highlightElementBorder(compAlertsPage.createAlertBtn);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_comp_alerts_page_accessible');
//         console.log('Comp Alerts page is accessible and Create Alert button is visible.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Create Alert — Positive Scenarios
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Comp Alerts - Create Alert (Positive)', () => {
//     test.beforeEach(async ({ page, sidebarPage, compAlertsPage }) => {
//         await navigateToCompAlerts(page, sidebarPage, compAlertsPage);
//     });

//     test('TC-2 Create alert with Schedule At = Daily and all mandatory fields', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_Daily_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date, End Date and Alert Every X Amount are now mandatory too
//         // (site change, confirmed by the user) — all three must be filled for every schedule.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         // Schedule At defaults to "Daily" already; re-selecting it dismisses the Next Alert
//         // Check Date calendar per the app's own UX. Every Day At is mandatory for Daily.
//         await compAlertsPage.selectScheduleAt(dialog, 'Daily');
//         // End Date — dismissed by clicking whichever frequency field is active (Every Day At here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.setEveryDayAt(dialog, 2, 3);
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_daily_alert_filled');

//         await compAlertsPage.clickSave(dialog);

//         const toastText = await compAlertsPage.getToastText();
//         console.log(`Toast after save: "${toastText}"`);
//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });

//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_daily_alert_success');
//         console.log(`✅ TC-2 PASSED — Daily alert "${alertName}" created and verified in list.`);
//     });

//     test('TC-3 Create alert with Schedule At = Minutely', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_Minutely_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date, End Date and Alert Every X Amount are now mandatory too
//         // (site change, confirmed by the user) — all three must be filled for every schedule.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Minutely');
//         // End Date — dismissed by clicking whichever frequency field is active (Every X Minutes here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.fillEveryXMinutes(dialog, '15');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_minutely_alert_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_minutely_alert_success');
//         console.log(`✅ TC-3 PASSED — Minutely alert "${alertName}" created and verified in list.`);
//     });

//     test('TC-4 Create alert with Schedule At = Hourly', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_Hourly_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date, End Date and Alert Every X Amount are now mandatory too
//         // (site change, confirmed by the user) — all three must be filled for every schedule.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Hourly');
//         // End Date — dismissed by clicking whichever frequency field is active (Every X Hours here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.fillEveryXHours(dialog, '3');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_hourly_alert_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_hourly_alert_success');
//         console.log(`✅ TC-4 PASSED — Hourly alert "${alertName}" created and verified in list.`);
//     });

//     test('TC-5 Create alert with Schedule At = Weekly', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_Weekly_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date, End Date and Alert Every X Amount are now mandatory too
//         // (site change, confirmed by the user) — all three must be filled for every schedule.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Weekly');
//         // End Date — dismissed by clicking whichever frequency field is active (Day dropdown here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.selectWeeklyDay(dialog, 'Monday');
//         await compAlertsPage.setAtTime(dialog, 2, 3);
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_weekly_alert_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_weekly_alert_success');
//         console.log(`✅ TC-5 PASSED — Weekly alert "${alertName}" created and verified in list.`);
//     });

//     test('TC-6 Create alert with Force Send Alert At Next Check unchecked and every other field filled', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_ForceOff_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         // Force Send Alert At Next Check is checked by default — verify that,
//         // then uncheck it to confirm the field is toggleable and doesn't block Save.
//         expect(await compAlertsPage.isForceAlertChecked(dialog)).toBe(true);
//         await compAlertsPage.toggleForceAlert(dialog);
//         expect(await compAlertsPage.isForceAlertChecked(dialog)).toBe(false);

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date — clicking Schedule At afterward dismisses the
//         // calendar (per the app's own UX) and doubles as opening it for the next step.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Daily');
//         // End Date — dismissed by clicking whichever frequency field is active (Every Day At here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.setEveryDayAt(dialog, 1, 1);
//         await compAlertsPage.fillAlertEmails(dialog, 'qa.force.off@example.com');
//         await compAlertsPage.fillAlertFrequency(dialog, '7');
//         await compAlertsPage.selectFirstAvailableGroupResults(dialog);
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_force_alert_off_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         console.log(`✅ TC-6 PASSED — Alert "${alertName}" created successfully with Force Alert unchecked and every field filled.`);
//     });

//     test('TC-14 Create alert with Schedule At = Daily and every field filled', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_DailyAllFields_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date — clicking Schedule At afterward dismisses the
//         // calendar (per the app's own UX) and doubles as opening it for the next step.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Daily');
//         // End Date — dismissed by clicking whichever frequency field is active (Every Day At here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.setEveryDayAt(dialog, 2, 3);
//         await compAlertsPage.fillAlertEmails(dialog, 'qa.daily1@example.com,qa.daily2@example.com');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectFirstAvailableGroupResults(dialog);
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_daily_all_fields_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_daily_all_fields_success');
//         console.log(`✅ TC-14 PASSED — Daily alert "${alertName}" created with every field filled and verified in list.`);
//     });

//     test('TC-15 Create alert with Schedule At = Minutely and every field filled', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_MinutelyAllFields_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Minutely');
//         // End Date — dismissed by clicking whichever frequency field is active (Every X Minutes here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.fillEveryXMinutes(dialog, '15');
//         await compAlertsPage.fillAlertEmails(dialog, 'qa.minutely1@example.com,qa.minutely2@example.com');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectFirstAvailableGroupResults(dialog);
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_minutely_all_fields_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_minutely_all_fields_success');
//         console.log(`✅ TC-15 PASSED — Minutely alert "${alertName}" created with every field filled and verified in list.`);
//     });

//     test('TC-16 Create alert with Schedule At = Hourly and every field filled', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_HourlyAllFields_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Hourly');
//         // End Date — dismissed by clicking whichever frequency field is active (Every X Hours here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.fillEveryXHours(dialog, '3');
//         await compAlertsPage.fillAlertEmails(dialog, 'qa.hourly1@example.com,qa.hourly2@example.com');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectFirstAvailableGroupResults(dialog);
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_hourly_all_fields_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_hourly_all_fields_success');
//         console.log(`✅ TC-16 PASSED — Hourly alert "${alertName}" created with every field filled and verified in list.`);
//     });

//     test('TC-17 Create alert with Schedule At = Weekly and every field filled', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_WeeklyAllFields_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Weekly');
//         // End Date — dismissed by clicking whichever frequency field is active (Day dropdown here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.selectWeeklyDay(dialog, 'Monday');
//         await compAlertsPage.setAtTime(dialog, 2, 3);
//         await compAlertsPage.fillAlertEmails(dialog, 'qa.weekly1@example.com,qa.weekly2@example.com');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectFirstAvailableGroupResults(dialog);
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_weekly_all_fields_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_weekly_all_fields_success');
//         console.log(`✅ TC-17 PASSED — Weekly alert "${alertName}" created with every field filled and verified in list.`);
//     });

//     test('TC-7 Create alert with all optional fields filled in addition to mandatory ones', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = `AutoAlert_AllFields_${CommonUtils.generateRandomString(6)}`;

//         await compAlertsPage.clickCreateAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         await compAlertsPage.fillAlertName(dialog, alertName);
//         // Next Alert Check Date — clicking Schedule At afterward dismisses the
//         // calendar (per the app's own UX) and doubles as opening it for the next step.
//         await compAlertsPage.setNextAlertCheckDate(dialog);
//         await compAlertsPage.selectScheduleAt(dialog, 'Daily');
//         // End Date — dismissed by clicking whichever frequency field is active (Every Day At here).
//         await compAlertsPage.setEndDate(dialog);
//         await compAlertsPage.setEveryDayAt(dialog, 4, 5);
//         await compAlertsPage.fillAlertEmails(dialog, 'qa.test1@example.com,qa.test2@example.com');
//         await compAlertsPage.fillAlertFrequency(dialog, '5');
//         await compAlertsPage.selectFirstAvailableGroupResults(dialog);
//         await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_all_fields_filled');

//         await compAlertsPage.clickSave(dialog);

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
//             .toBeVisible({ timeout: 15000 });

//         console.log(`✅ TC-7 PASSED — Alert "${alertName}" created successfully with all optional fields filled.`);
//     });
// });

// ═══════════════════════════════════════════════════════════════════════════════
//  Create Alert — Negative / Validation Scenarios
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Comp Alerts - Create Alert (Negative)', () => {
    test.beforeEach(async ({ page, sidebarPage, compAlertsPage }) => {
        await navigateToCompAlerts(page, sidebarPage, compAlertsPage);
    });

    // test('TC-8 Verify Save button is disabled when the New Alert dialog first opens', async ({ page, compAlertsPage }, testInfo) => {
    //     await compAlertsPage.clickCreateAlert();
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     expect(await compAlertsPage.isSaveEnabled(dialog)).toBe(false);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_save_disabled_on_open');
    //     console.log('✅ TC-8 PASSED — Save button is disabled with no fields filled.');
    // });

    // test('TC-9 Verify Save stays disabled when Alert Name is left blank', async ({ page, compAlertsPage }, testInfo) => {
    //     await compAlertsPage.clickCreateAlert();
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     // Fill every other mandatory field, but deliberately leave Alert Name blank.
    //     await compAlertsPage.setEveryDayAt(dialog, 1, 1);
    //     await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

    //     expect(await compAlertsPage.isSaveEnabled(dialog)).toBe(false);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_save_disabled_no_name');
    //     console.log('✅ TC-9 PASSED — Save stays disabled when Alert Name is blank.');
    // });

    // test('TC-10 Verify Save stays disabled when Region Code is not selected', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = `AutoAlert_NoRegion_${CommonUtils.generateRandomString(6)}`;

    //     await compAlertsPage.clickCreateAlert();
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertName(dialog, alertName);
    //     await compAlertsPage.setEveryDayAt(dialog, 1, 1);
    //     // Deliberately skip Region Code.

    //     expect(await compAlertsPage.isSaveEnabled(dialog)).toBe(false);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_save_disabled_no_region');
    //     console.log('✅ TC-10 PASSED — Save stays disabled when Region Code is not selected.');
    // });

    // test('TC-11 Verify Save stays disabled when Every Day At is not set while Schedule At = Daily', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = `AutoAlert_NoEveryDayAt_${CommonUtils.generateRandomString(6)}`;

    //     await compAlertsPage.clickCreateAlert();
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertName(dialog, alertName);
    //     await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');
    //     // Schedule At defaults to Daily, and Every Day At (mandatory for Daily) is
    //     // deliberately left unset.

    //     expect(await compAlertsPage.isSaveEnabled(dialog)).toBe(false);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_save_disabled_no_every_day_at');
    //     console.log('✅ TC-11 PASSED — Save stays disabled when Every Day At is not set for Daily schedule.');
    // });

    // test('TC-12 Verify Cancel button closes the dialog without creating an alert', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = `AutoAlert_Cancelled_${CommonUtils.generateRandomString(6)}`;

    //     await compAlertsPage.clickCreateAlert();
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertName(dialog, alertName);
    //     await compAlertsPage.setEveryDayAt(dialog, 1, 1);
    //     await compAlertsPage.selectRegionCode(dialog, 'Betway Ghana');

    //     await compAlertsPage.clickCancel(dialog);
    //     await expect(dialog).not.toBeVisible({ timeout: 10000 });

    //     // The alert must never have been created.
    //     expect(await compAlertsPage.isAlertVisibleInList(alertName)).toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_cancel_no_alert_created');
    //     console.log('✅ TC-12 PASSED — Cancel closed the dialog and no alert was created.');
    // });

    // test('TC-13 Verify switching Schedule At away from Daily hides the Every Day At field', async ({ page, compAlertsPage }, testInfo) => {
    //     await compAlertsPage.clickCreateAlert();
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     // Daily is the default — Every Day At should be visible to start with.
    //     await expect(dialog.locator('#everyDayAt input')).toBeVisible({ timeout: 10000 });

    //     await compAlertsPage.selectScheduleAt(dialog, 'Minutely');
    //     await expect(dialog.locator('#everyDayAt input')).not.toBeVisible({ timeout: 10000 });
    //     await expect(dialog.locator('#everyXMinutes input')).toBeVisible({ timeout: 10000 });

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_conditional_field_switch');
    //     console.log('✅ TC-13 PASSED — Every Day At hides and Every X Minutes appears when switching to Minutely.');
    // });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Edit Alert — Positive & Negative Scenarios
//
//  Every test here creates its OWN disposable alert first (via
//  createDisposableDailyAlert), then edits that exact alert by name — never
//  the first row or any pre-existing/original alert already in the table.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Comp Alerts - Edit Alert', () => {
    test.beforeEach(async ({ page, sidebarPage, compAlertsPage }) => {
        await navigateToCompAlerts(page, sidebarPage, compAlertsPage);
    });

    // test('TC-18 Verify Edit popup opens pre-filled with the alert\'s existing values', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_PreFill');

    //     await compAlertsPage.clickEditByName(alertName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     expect(await compAlertsPage.getAlertNameValue(dialog)).toBe(alertName);
    //     expect(await compAlertsPage.getRegionCodeValue(dialog)).toBe('Betway Ghana');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_edit_prefilled_values');
    //     await compAlertsPage.clickCancel(dialog);
    //     console.log(`✅ TC-18 PASSED — Edit popup for "${alertName}" opened pre-filled with its existing values.`);
    // });

    // test('TC-19 Update Alert Name via Edit and verify the list reflects the new name', async ({ page, compAlertsPage }, testInfo) => {
    //     const originalName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_Rename');
    //     const updatedName = `${originalName}_Updated`;

    //     await compAlertsPage.clickEditByName(originalName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertName(dialog, updatedName);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_edit_name_filled');

    //     await compAlertsPage.clickSave(dialog);

    //     await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
    //         .toBeVisible({ timeout: 15000 });
    //     await expect(dialog).not.toBeVisible({ timeout: 15000 });
    //     await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: updatedName }).first())
    //         .toBeVisible({ timeout: 15000 });

    //     console.log(`✅ TC-19 PASSED — Alert renamed from "${originalName}" to "${updatedName}" and verified in list.`);
    // });

    // test('TC-20 Update Every Day At time via Edit and verify successful save', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_Time');

    //     await compAlertsPage.clickEditByName(alertName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.setEveryDayAt(dialog, 3, 2);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_edit_time_filled');

    //     await compAlertsPage.clickSave(dialog);

    //     await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
    //         .toBeVisible({ timeout: 15000 });
    //     await expect(dialog).not.toBeVisible({ timeout: 15000 });
    //     await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
    //         .toBeVisible({ timeout: 15000 });

    //     console.log(`✅ TC-20 PASSED — Alert "${alertName}" Every Day At time updated and saved successfully.`);
    // });

    test('TC-21 Change Schedule At from Daily to Weekly via Edit and verify successful save', async ({ page, compAlertsPage }, testInfo) => {
        const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_ScheduleSwitch');

        await compAlertsPage.clickEditByName(alertName);
        const dialog = compAlertsPage.getAlertDialog();
        await expect(dialog).toBeVisible({ timeout: 15000 });

        // Daily's "Every Day At" should be visible pre-filled — switching to
        // Weekly should hide it and reveal Day + At Time instead.
        await expect(dialog.locator('#everyDayAt input')).toBeVisible({ timeout: 10000 });
        await compAlertsPage.selectScheduleAt(dialog, 'Weekly');
        await expect(dialog.locator('#everyDayAt input')).not.toBeVisible({ timeout: 10000 });

        await compAlertsPage.selectWeeklyDay(dialog, 'Friday');
        await compAlertsPage.setAtTime(dialog, 1, 2);
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_edit_schedule_switch_filled');

        await compAlertsPage.clickSave(dialog);

        await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
            .toBeVisible({ timeout: 15000 });
        await expect(dialog).not.toBeVisible({ timeout: 15000 });
        await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
            .toBeVisible({ timeout: 15000 });

        console.log(`✅ TC-21 PASSED — Alert "${alertName}" schedule changed from Daily to Weekly and saved successfully.`);
    });

    // test('TC-22 Update optional fields via Edit (Alert Emails, Alert Every X Amount, Group Results By)', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_OptionalFields');

    //     await compAlertsPage.clickEditByName(alertName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertEmails(dialog, 'qa.edited1@example.com,qa.edited2@example.com');
    //     await compAlertsPage.fillAlertFrequency(dialog, '9');
    //     await compAlertsPage.selectFirstAvailableGroupResults(dialog);
    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_edit_optional_fields_filled');

    //     await compAlertsPage.clickSave(dialog);

    //     await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
    //         .toBeVisible({ timeout: 15000 });
    //     await expect(dialog).not.toBeVisible({ timeout: 15000 });
    //     await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }).first())
    //         .toBeVisible({ timeout: 15000 });

    //     console.log(`✅ TC-22 PASSED — Alert "${alertName}" optional fields updated and saved successfully.`);
    // });

    // test('TC-23 Verify Region Code is disabled and cannot be changed in the Edit Alert dialog', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_RegionLocked');

    //     await compAlertsPage.clickEditByName(alertName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     expect(await compAlertsPage.isRegionCodeDisabled(dialog)).toBe(true);
    //     expect(await compAlertsPage.getRegionCodeValue(dialog)).toBe('Betway Ghana');

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_region_code_disabled');
    //     await compAlertsPage.clickCancel(dialog);
    //     console.log(`✅ TC-23 PASSED — Region Code is disabled in Edit Alert and still shows "Betway Ghana".`);
    // });

    // test('TC-24 Verify Save is disabled when Alert Name is cleared during Edit', async ({ page, compAlertsPage }, testInfo) => {
    //     const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_ClearName');

    //     await compAlertsPage.clickEditByName(alertName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertName(dialog, '');
    //     expect(await compAlertsPage.isSaveEnabled(dialog)).toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_edit_save_disabled_blank_name');
    //     await compAlertsPage.clickCancel(dialog);
    //     console.log(`✅ TC-24 PASSED — Save stays disabled when Alert Name is cleared during Edit.`);
    // });

    // test('TC-25 Verify Cancel during Edit discards changes', async ({ page, compAlertsPage }, testInfo) => {
    //     const originalName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoEdit_CancelDiscard');
    //     const attemptedName = `${originalName}_ShouldNotStick`;

    //     await compAlertsPage.clickEditByName(originalName);
    //     const dialog = compAlertsPage.getAlertDialog();
    //     await expect(dialog).toBeVisible({ timeout: 15000 });

    //     await compAlertsPage.fillAlertName(dialog, attemptedName);
    //     await compAlertsPage.clickCancel(dialog);
    //     await expect(dialog).not.toBeVisible({ timeout: 10000 });

    //     // The original name must still be in the list; the unsaved edit must not have stuck.
    //     expect(await compAlertsPage.isAlertVisibleInList(originalName)).toBe(true);
    //     expect(await compAlertsPage.isAlertVisibleInList(attemptedName)).toBe(false);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_edit_cancel_discarded');
    //     console.log(`✅ TC-25 PASSED — Cancel discarded the edit; "${originalName}" remains unchanged in the list.`);
    // });
});

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Delete Alert — Positive & Negative Scenarios
// //
// //  Both tests create their OWN disposable alert first (via
// //  createDisposableDailyAlert), then delete that exact alert by name — never
// //  the first row or any pre-existing/original alert already in the table.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Comp Alerts - Delete Alert', () => {
//     test.beforeEach(async ({ page, sidebarPage, compAlertsPage }) => {
//         await navigateToCompAlerts(page, sidebarPage, compAlertsPage);
//     });

//     test('TC-34 Verify successful deletion of an Alert', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoDelete_Yes');

//         await compAlertsPage.clickDeleteByName(alertName);
//         await compAlertsPage.clickYesOnDeleteAlertDialog();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-34_alert_deletion_confirmed');

//         await expect(compAlertsPage.alertsTable.locator('tbody tr', { hasText: alertName }))
//             .toHaveCount(0, { timeout: 15000 });

//         console.log(`✅ TC-34 PASSED — Alert "${alertName}" deleted and verified removed from list.`);
//     });

//     test('TC-35 Verify "No" on the delete confirmation cancels alert deletion', async ({ page, compAlertsPage }, testInfo) => {
//         const alertName = await createDisposableDailyAlert(page, compAlertsPage, 'AutoDelete_No');

//         await compAlertsPage.clickDeleteByName(alertName);
//         await compAlertsPage.clickNoOnDeleteAlertDialog();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-35_alert_delete_declined');

//         expect(await compAlertsPage.isAlertVisibleInList(alertName)).toBe(true);
//         console.log(`✅ TC-35 PASSED — "No" declined deletion; "${alertName}" remains in the list.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  Config — Comp Alert Settings (reached via the per-row "Config" button)
// //
// //  Per instruction, these tests do NOT create new top-level alerts (the table
// //  already has plenty from prior automation runs) — they reuse an existing
// //  "Auto..."-prefixed alert purely to reach its Config page. Every comp-level
// //  create/delete they perform is fully disposable within the test itself.
// // ═══════════════════════════════════════════════════════════════════════════════
// async function navigateToCompAlertConfig(page: any, sidebarPage: any, compAlertsPage: any) {
//     await navigateToCompAlerts(page, sidebarPage, compAlertsPage);
//     await compAlertsPage.clickConfigOnAutomationAlert();
//     await expect
//         .poll(() => compAlertsPage.isOnCompAlertSettingsPage(), { timeout: 20000 })
//         .toBe(true);
// }

// test.describe('Comp Alerts - Config (Comp Alert Settings)', () => {
//     test.beforeEach(async ({ page, sidebarPage, compAlertsPage }) => {
//         await navigateToCompAlertConfig(page, sidebarPage, compAlertsPage);
//     });

//     test('TC-26 Verify Config navigates to the Comp Alert Settings page', async ({ page }, testInfo) => {
//         await expect(page.locator('button[aria-label="Create Comp Alert"]')).toBeVisible({ timeout: 15000 });
//         await expect(page.locator('button[aria-label="Refresh"]')).toBeVisible({ timeout: 10000 });
//         await expect(page.locator('button:has(.pi-chevron-left)').first()).toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_comp_alert_settings_page');
//         console.log('✅ TC-26 PASSED — Comp Alert Settings page opened with Create Comp Alert, Refresh, and Back controls visible.');
//     });

//     test('TC-27 Verify successful creation of a Comp Alert config', async ({ page, compAlertsPage }, testInfo) => {
//         await compAlertsPage.clickCreateCompAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         const compName = await compAlertsPage.selectFirstAvailableComp(dialog);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_comp_alert_selected');

//         await compAlertsPage.clickSaveCompAlert(dialog);

//         // No success toast appears for this specific action (confirmed by
//         // manual check: the comp genuinely gets created, but the app shows no
//         // toast for it) — validate via the dialog closing and the list instead.
//         await expect(dialog).not.toBeVisible({ timeout: 15000 });
//         await expect(page.locator('.p-datatable tbody tr', { hasText: compName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_comp_alert_created');
//         console.log(`✅ TC-27 PASSED — Comp "${compName}" created and verified in list.`);
//     });

//     test('TC-33 Verify successful deletion of a Comp Alert config', async ({ page, compAlertsPage }, testInfo) => {
//         // Setup (not what this test verifies) — create a disposable comp config to delete.
//         await compAlertsPage.clickCreateCompAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });
//         const compName = await compAlertsPage.selectFirstAvailableComp(dialog);
//         await compAlertsPage.clickSaveCompAlert(dialog);
//         // No success toast appears for creation (confirmed by manual check) —
//         // validate via the list instead.
//         await expect(page.locator('.p-datatable tbody tr', { hasText: compName }).first())
//             .toBeVisible({ timeout: 15000 });

//         await compAlertsPage.clickDeleteCompByName(compName);
//         await compAlertsPage.clickYesOnDeleteCompDialog();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_comp_alert_deletion_confirmed');

//         await expect(page.locator('.p-toast-message-success, [data-p-severity="success"]').first())
//             .toBeVisible({ timeout: 15000 });

//         // Unlike creation, the list doesn't reflect a deletion until refreshed —
//         // click Refresh (the page's own control, already proven in TC-32)
//         // before checking the row is actually gone.
//         await compAlertsPage.clickRefreshCompAlertSettings();
//         await expect(page.locator('.p-datatable tbody tr', { hasText: compName }))
//             .toHaveCount(0, { timeout: 15000 });

//         console.log(`✅ TC-33 PASSED — Comp "${compName}" deleted and verified removed from list.`);
//     });

//     test('TC-28 Verify "No" on the delete confirmation cancels deletion', async ({ page, compAlertsPage }, testInfo) => {
//         await compAlertsPage.clickCreateCompAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });
//         const compName = await compAlertsPage.selectFirstAvailableComp(dialog);
//         await compAlertsPage.clickSaveCompAlert(dialog);
//         // No success toast appears for creation (confirmed by manual check) —
//         // validate via the list instead.
//         await expect(page.locator('.p-datatable tbody tr', { hasText: compName }).first())
//             .toBeVisible({ timeout: 15000 });

//         // Attempt delete, but decline via "No" — the comp must remain.
//         await compAlertsPage.clickDeleteCompByName(compName);
//         await compAlertsPage.clickNoOnDeleteCompDialog();
//         expect(await compAlertsPage.isCompVisibleInConfigList(compName)).toBe(true);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_delete_declined');

//         console.log(`✅ TC-28 PASSED — "No" declined deletion; "${compName}" remains in the list.`);
//     });

//     test('TC-29 Verify Save is disabled when no Comp is selected', async ({ page, compAlertsPage }, testInfo) => {
//         await compAlertsPage.clickCreateCompAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         expect(await compAlertsPage.isCompAlertSaveEnabled(dialog)).toBe(false);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_comp_alert_save_disabled');

//         await compAlertsPage.clickCancelCompAlert(dialog);
//         console.log('✅ TC-29 PASSED — Save stays disabled with no Comp selected.');
//     });

//     test('TC-30 Verify Cancel on Configure Comp Alert discards without creating', async ({ page, compAlertsPage }, testInfo) => {
//         await compAlertsPage.clickCreateCompAlert();
//         const dialog = compAlertsPage.getAlertDialog();
//         await expect(dialog).toBeVisible({ timeout: 15000 });

//         const compName = await compAlertsPage.selectFirstAvailableComp(dialog);
//         await compAlertsPage.clickCancelCompAlert(dialog);
//         await expect(dialog).not.toBeVisible({ timeout: 10000 });

//         expect(await compAlertsPage.isCompVisibleInConfigList(compName)).toBe(false);
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_comp_alert_cancel_discarded');
//         console.log(`✅ TC-30 PASSED — Cancel discarded the selection; "${compName}" was never created.`);
//     });

//     test('TC-31 Verify Back button navigates back to the Comp Alerts page', async ({ page, compAlertsPage }, testInfo) => {
//         await compAlertsPage.clickBackFromCompAlertSettings();

//         await expect(compAlertsPage.createAlertBtn).toBeVisible({ timeout: 15000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_back_to_comp_alerts');
//         console.log('✅ TC-31 PASSED — Back button navigated to the Comp Alerts page.');
//     });

//     test('TC-32 Verify Refresh button reloads the Comp Alert Settings page', async ({ page, compAlertsPage }, testInfo) => {
//         await compAlertsPage.clickRefreshCompAlertSettings();

//         await expect(page.locator('button[aria-label="Create Comp Alert"]')).toBeVisible({ timeout: 15000 });
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_refresh_comp_alert_settings');
//         console.log('✅ TC-32 PASSED — Refresh reloaded the Comp Alert Settings page and it remains functional.');
//     });
// });

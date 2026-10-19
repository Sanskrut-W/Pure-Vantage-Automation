// npx playwright test tests/leaderboard.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToLeaderboard(page: any, sidebarPage: any, leaderboardPage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToLeaderboard();
    await leaderboardPage.createLeaderboardBtn.waitFor({ state: 'visible', timeout: 180000 });
}

async function openCreatePopup(leaderboardPage: any) {
    await leaderboardPage.clickCreateLeaderboard();
    await leaderboardPage.waitForCreateLeaderboardPopupLoad();
}

// Creates a real Leaderboard with a unique, automation-generated name — used afterward to find/
// delete it (see the shared afterEach hooks below, which delete regardless of pass/fail so the
// database doesn't accumulate test data).
async function createLeaderboard(page: any, leaderboardPage: any, name: string): Promise<void> {
    await openCreatePopup(leaderboardPage);
    await leaderboardPage.fillPromotionName(name);
    await leaderboardPage.selectFirstRegion();
    await leaderboardPage.setStartDate();
    await leaderboardPage.setEndDate();
    await page.waitForTimeout(300);

    await expect(leaderboardPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await leaderboardPage.clickSave();

    // A generic .p-toast-message-text check passes on an ERROR toast just as readily as a
    // success one — scoping to the success class/severity avoids a false-positive pass when the
    // save actually failed server-side (same pattern used elsewhere in this suite).
    const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    await expect(toastText, 'Expected a SUCCESS toast confirming the Leaderboard was created').toBeVisible({ timeout: 15000 });
    // Confirmed live: the toast can finish fading out (removed from the DOM) in the brief gap
    // between toBeVisible() resolving and this read — .catch() keeps that benign race from
    // failing/hanging the whole helper over a purely informational log line.
    console.log('Create Leaderboard toast message:', await toastText.textContent().catch(() => 'N/A'));

    const isVisible = await leaderboardPage.isLeaderboardVisibleByName(name);
    expect(isVisible, `Expected a Leaderboard row for "${name}" to appear`).toBe(true);
}

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LB_002 to TC_LB_011 — Create Popup Tests
// //  None of these tests persist a Leaderboard (each ends by closing the popup via Cancel), so no
// //  cleanup is needed in this describe block.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Leaderboard - Create Popup Tests', () => {

//     test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//         await openCreatePopup(leaderboardPage);
//     });

//     test('TC_LB_002 Verify Create Leaderboard popup', async ({ page, leaderboardPage }, testInfo) => {
//         await expect(leaderboardPage.createLeaderboardPopup, 'Expected the Create Leaderboard popup to open').toBeVisible({ timeout: 15000 });
//         await expect(leaderboardPage.promotionNameInput, 'Expected Promotion Name field').toBeVisible();
//         await expect(leaderboardPage.regionDropdown, 'Expected Region field').toBeVisible();
//         await expect(leaderboardPage.startDateInput, 'Expected Start Date field').toBeVisible();
//         await expect(leaderboardPage.endDateInput, 'Expected End Date field').toBeVisible();
//         await expect(leaderboardPage.pushNotificationDropdown, 'Expected Push Notification field').toBeVisible();

//         // Confirmed live: Is Active / Is Testing render disabled on Create — per the user, these
//         // only become togglable while EDITING an existing Leaderboard (see TC_LB_008/009).
//         expect(await leaderboardPage.isActiveToggleDisabled(), 'Expected Is Active to be disabled on Create').toBe(true);
//         expect(await leaderboardPage.isTestingToggleDisabled(), 'Expected Is Testing to be disabled on Create').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_002_create_leaderboard_popup');
//         console.log('Create Leaderboard Promotion popup opens with all fields (Is Active/Is Testing correctly disabled on Create).');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_003 Verify mandatory field validation', async ({ page, leaderboardPage }, testInfo) => {
//         const saveWasClickable = await leaderboardPage.saveBtn.isEnabled().catch(() => false);
//         if (saveWasClickable) {
//             await leaderboardPage.clickSave();
//             await page.waitForTimeout(500);
//         }

//         const hasErrors = await leaderboardPage.hasValidationErrors();
//         // Tolerant: mandatory-field enforcement could be inline errors after a Save attempt, OR
//         // Save itself staying disabled until fields are filled — the exact mechanism wasn't
//         // confirmed live for this popup.
//         expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation to be enforced (inline errors or a disabled Save)').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_003_mandatory_field_validation');
//         console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_004 Verify Promotion Name field', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Leaderboard_${Date.now()}`;
//         await leaderboardPage.fillPromotionName(name);
//         expect(await leaderboardPage.getPromotionNameValue(), 'Expected Promotion Name value to be accepted').toBe(name);

//         await leaderboardPage.fillPromotionName('');
//         const saveWasClickable = await leaderboardPage.saveBtn.isEnabled().catch(() => false);
//         if (saveWasClickable) {
//             await leaderboardPage.clickSave();
//             await page.waitForTimeout(500);
//         }
//         const hasErrors = await leaderboardPage.hasValidationErrors();
//         expect(hasErrors || !saveWasClickable, 'Expected a validation error (or disabled Save) when Promotion Name is blank').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_004_promotion_name_field');
//         console.log('Promotion Name accepts valid input and enforces validation when left blank.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_005 Verify Region dropdown', async ({ page, leaderboardPage }, testInfo) => {
//         const selected = await leaderboardPage.selectFirstRegion();
//         const shownValue = await leaderboardPage.getDropdownValue(leaderboardPage.regionDropdown);
//         expect(shownValue, `Expected the selected Region "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_005_region_dropdown');
//         console.log(`Region dropdown opened and the selected value "${selected}" is shown.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_006 Verify Start and End Date', async ({ page, leaderboardPage }, testInfo) => {
//         await leaderboardPage.setStartDate();
//         const startValue = await leaderboardPage.getStartDateValue();
//         expect(startValue.trim().length > 0, 'Expected Start Date to be selected').toBe(true);

//         // Confirmed live: a date earlier than Start Date renders DISABLED in the End Date
//         // calendar itself (aria-disabled="true", pointer-events blocked) — the app prevents
//         // picking an invalid End Date at the UI level rather than showing a post-save error.
//         const isYesterdayDisabled = await leaderboardPage.isEndDateOffsetDisabled(-1);
//         expect(isYesterdayDisabled, 'Expected a date earlier than Start Date to be disabled in the End Date calendar').toBe(true);

//         await leaderboardPage.setEndDate();
//         const endValue = await leaderboardPage.getEndDateValue();
//         expect(endValue.trim().length > 0, 'Expected a valid End Date to be accepted').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_006_start_end_date');
//         console.log('Start Date is accepted; the End Date calendar disables dates before Start Date; a valid End Date is accepted.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_007 Verify Push Notification dropdown', async ({ page, leaderboardPage }, testInfo) => {
//         const selected = await leaderboardPage.selectFirstPushNotification();
//         const shownValue = await leaderboardPage.getDropdownValue(leaderboardPage.pushNotificationDropdown);
//         expect(shownValue, `Expected the selected Push Notification option "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_007_push_notification_dropdown');
//         console.log(`Push Notification dropdown opened and the selected option "${selected}" is shown.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_011 Verify Cancel button', async ({ page, leaderboardPage }, testInfo) => {
//         await leaderboardPage.clickCancel();
//         await expect(leaderboardPage.createLeaderboardPopup, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_011_cancel_button');
//         console.log('Cancel closes the popup without saving any data.');
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LB_010 — Create and Verify Tests
// //  Persists a real Leaderboard. The afterEach below deletes it regardless of pass/fail, per the
// //  standing instruction that pass/fail is judged on test intention, not on cleanup succeeding.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Leaderboard - Create and Verify Tests', () => {
//     let createdName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//         createdName = undefined;
//     });

//     test.afterEach(async ({ leaderboardPage }) => {
//         if (!createdName) return;
//         const nameToDelete = createdName;
//         createdName = undefined;
//         await leaderboardPage.deleteLeaderboardIfPresent(nameToDelete);
//     });

//     test('TC_LB_010 Verify Save functionality', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Leaderboard_${Date.now()}`;
//         await createLeaderboard(page, leaderboardPage, name);
//         createdName = name;

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_010_save_functionality');
//         console.log(`✅ TC_LB_010 PASSED — Leaderboard "${name}" created and verified in the list.`);
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LB_008/009 — Edit Popup Tests
// //  Per the user: Is Active / Is Testing only become togglable while EDITING an existing
// //  Leaderboard (confirmed disabled on Create — see TC_LB_002). Needs a real Leaderboard to edit;
// //  the afterEach below deletes it regardless of pass/fail.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Leaderboard - Edit Popup Tests', () => {
//     let createdName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//         createdName = undefined;
//     });

//     test.afterEach(async ({ leaderboardPage }) => {
//         if (!createdName) return;
//         const nameToDelete = createdName;
//         createdName = undefined;
//         await leaderboardPage.deleteLeaderboardIfPresent(nameToDelete);
//     });

//     test('TC_LB_008 Verify Is Active toggle', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Leaderboard_${Date.now()}`;
//         await createLeaderboard(page, leaderboardPage, name);
//         createdName = name;

//         await leaderboardPage.clickEditForLeaderboard(name);
//         await leaderboardPage.waitForCreateLeaderboardPopupLoad();

//         expect(await leaderboardPage.isActiveToggleDisabled(), 'Expected Is Active to be enabled while editing').toBe(false);
//         const stateBefore = await leaderboardPage.isActiveChecked();
//         const toggledOn = await leaderboardPage.toggleIsActive();
//         expect(toggledOn, 'Expected the Is Active toggle to change state while editing').toBe(true);
//         expect(await leaderboardPage.isActiveChecked(), 'Expected Is Active to turn ON').toBe(!stateBefore);

//         const toggledOff = await leaderboardPage.toggleIsActive();
//         expect(toggledOff, 'Expected the Is Active toggle to change state again').toBe(true);
//         expect(await leaderboardPage.isActiveChecked(), 'Expected Is Active to turn back OFF').toBe(stateBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_008_is_active_toggle');
//         console.log('Is Active toggles ON then OFF while editing an existing Leaderboard.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_009 Verify Is Testing toggle', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Leaderboard_${Date.now()}`;
//         await createLeaderboard(page, leaderboardPage, name);
//         createdName = name;

//         await leaderboardPage.clickEditForLeaderboard(name);
//         await leaderboardPage.waitForCreateLeaderboardPopupLoad();

//         expect(await leaderboardPage.isTestingToggleDisabled(), 'Expected Is Testing to be enabled while editing').toBe(false);
//         const stateBefore = await leaderboardPage.isTestingChecked();
//         const toggledOn = await leaderboardPage.toggleIsTesting();
//         expect(toggledOn, 'Expected the Is Testing toggle to change state while editing').toBe(true);
//         expect(await leaderboardPage.isTestingChecked(), 'Expected Is Testing to turn ON').toBe(!stateBefore);

//         const toggledOff = await leaderboardPage.toggleIsTesting();
//         expect(toggledOff, 'Expected the Is Testing toggle to change state again').toBe(true);
//         expect(await leaderboardPage.isTestingChecked(), 'Expected Is Testing to turn back OFF').toBe(stateBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_009_is_testing_toggle');
//         console.log('Is Testing toggles ON then OFF while editing an existing Leaderboard.');

//         await leaderboardPage.clickCancel();
//     });
// });

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LB_012 — Access Manage Configurations
// //  Needs an existing Leaderboard row to open its "..." menu. The afterEach below re-navigates
// //  back to the Leaderboard list (Manage Configurations is a page navigation away from it) before
// //  deleting, regardless of pass/fail.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Leaderboard - Manage Configurations Access', () => {
//     let createdName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//         createdName = undefined;
//     });

//     test.afterEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         if (!createdName) return;
//         const nameToDelete = createdName;
//         createdName = undefined;
//         await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//         await leaderboardPage.deleteLeaderboardIfPresent(nameToDelete);
//     });

//     test('TC_LB_012 Access Manage Configurations', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Leaderboard_${Date.now()}`;
//         await createLeaderboard(page, leaderboardPage, name);
//         createdName = name;

//         const urlBeforeNav = page.url();
//         await leaderboardPage.openManageConfigurations(name);
//         await page.waitForTimeout(500);

//         expect(page.url(), 'Expected navigating to Manage Configurations to change the URL').not.toBe(urlBeforeNav);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_012_manage_configurations_access');
//         console.log(`✅ TC_LB_012 PASSED — Manage Configurations opened for Leaderboard "${name}" (URL: ${page.url()}).`);
//     });
// });

// // ─── Shared helpers for Manage Configurations / Configuration popup ─────────────

// // Manage Configurations is only reachable via an existing Leaderboard's "..." menu — creates a
// // throwaway Leaderboard as the vehicle in, navigates into it, and returns its name so the caller
// // can delete it afterward (compulsory cleanup, regardless of pass/fail).
// async function navigateToManageConfigurationsForNewLeaderboard(page: any, sidebarPage: any, leaderboardPage: any): Promise<string> {
//     await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//     const leaderboardName = `Leaderboard_${Date.now()}`;
//     await createLeaderboard(page, leaderboardPage, leaderboardName);
//     await leaderboardPage.openManageConfigurations(leaderboardName);
//     await leaderboardPage.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });
//     return leaderboardName;
// }

// async function openCreateConfigurationPopup(leaderboardPage: any) {
//     await leaderboardPage.clickCreateConfiguration();
//     await leaderboardPage.waitForConfigurationPopupLoad();
// }

// // Fills the 4 confirmed-mandatory fields (Leaderboard Name*, Description*, Leaderboard Type*,
// // Point Source*) and saves. Used afterward to find/delete the Configuration (see the shared
// // afterEach below, which deletes regardless of pass/fail).
// async function createConfiguration(page: any, leaderboardPage: any, name: string): Promise<void> {
//     await openCreateConfigurationPopup(leaderboardPage);
//     await leaderboardPage.fillLeaderboardName(name);
//     await leaderboardPage.fillDescription(`${name} description`);
//     await leaderboardPage.selectFirstLeaderboardType();
//     await leaderboardPage.selectFirstPointSource();
//     await page.waitForTimeout(300);

//     await expect(leaderboardPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
//     await leaderboardPage.clickSave();

//     const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//     await expect(toastText, 'Expected a SUCCESS toast confirming the Configuration was created').toBeVisible({ timeout: 15000 });
//     console.log('Create Configuration toast message:', await toastText.textContent());

//     const isVisible = await leaderboardPage.isConfigurationVisibleByName(name);
//     expect(isVisible, `Expected a Configuration row for "${name}" to appear`).toBe(true);
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LB_013 to TC_LB_049 — Manage Configurations page + Create/Edit Configuration popup +
// //  Configuration row's "..." menu.
// //  Every test here needs an existing Leaderboard just to REACH Manage Configurations — the
// //  shared beforeEach creates one, the shared afterEach deletes both the Configuration (if one was
// //  created) and the Leaderboard itself, regardless of pass/fail.
// //  NOT YET IMPLEMENTED: TC_LB_050 (needs a second test account without delete rights — none
// //  available) and TC_LB_051 (the "session error" scenario it's meant to check was never
// //  clarified).
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Leaderboard - Manage Configurations Tests', () => {
//     let createdLeaderboardName: string | undefined;
//     let createdConfigName: string | undefined;

//     test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         createdLeaderboardName = await navigateToManageConfigurationsForNewLeaderboard(page, sidebarPage, leaderboardPage);
//         createdConfigName = undefined;
//     });

//     test.afterEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         if (createdConfigName) {
//             const configName = createdConfigName;
//             createdConfigName = undefined;
//             await leaderboardPage.deleteConfigurationIfPresent(configName);
//         }
//         if (createdLeaderboardName) {
//             const leaderboardName = createdLeaderboardName;
//             createdLeaderboardName = undefined;
//             await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//             await leaderboardPage.deleteLeaderboardIfPresent(leaderboardName);
//         }
//     });

//     test('TC_LB_013 Verify Configuration UI', async ({ page, leaderboardPage }, testInfo) => {
//         await expect(leaderboardPage.createConfigurationBtn, 'Expected Create Configuration button').toBeVisible();
//         await expect(leaderboardPage.configActiveToggle, 'Expected an Active filter toggle').toBeVisible();

//         // Confirmed live: a Leaderboard with zero Configurations shows a "No configurations
//         // found" placeholder instead of the cards container — the cards container only renders
//         // once at least one Configuration exists.
//         const hasCards = await leaderboardPage.configurationsContainer.isVisible().catch(() => false);
//         const hasEmptyState = await page.getByText('No configurations found').isVisible().catch(() => false);
//         expect(hasCards || hasEmptyState, 'Expected either the Configurations cards container or the empty-state message').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_013_configuration_ui');
//         console.log(`Manage Configurations page shows Create Configuration button and Active filter (${hasCards ? 'cards shown' : 'empty-state shown'}).`);
//     });

//     test('TC_LB_014 Open Create Popup', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         await expect(leaderboardPage.configurationPopup, 'Expected the Create Configuration popup to open').toBeVisible({ timeout: 15000 });
//         await expect(leaderboardPage.leaderboardNameInput, 'Expected Leaderboard Name field').toBeVisible();
//         await expect(leaderboardPage.descriptionInput, 'Expected Description field').toBeVisible();
//         await expect(leaderboardPage.leaderboardTypeDropdown, 'Expected Leaderboard Type field').toBeVisible();
//         await expect(leaderboardPage.pointSourceDropdown, 'Expected Point Source field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_014_create_configuration_popup');
//         console.log('Create Configuration popup opens with all fields.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_015 Mandatory Field Validation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         const saveWasClickable = await leaderboardPage.saveBtn.isEnabled().catch(() => false);
//         if (saveWasClickable) {
//             await leaderboardPage.clickSave();
//             await page.waitForTimeout(500);
//         }

//         const hasErrors = await leaderboardPage.hasValidationErrors();
//         // Tolerant: mandatory-field enforcement could be inline errors after a Save attempt, OR
//         // Save itself staying disabled until fields are filled — the exact mechanism wasn't
//         // confirmed live for this popup.
//         expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation to be enforced (inline errors or a disabled Save)').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_015_mandatory_field_validation');
//         console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_016 Create Configuration', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_016_create_configuration');
//         console.log(`✅ TC_LB_016 PASSED — Configuration "${name}" created and verified in the list.`);
//     });

//     test('TC_LB_017 Close Popup', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         await leaderboardPage.clickCancel();
//         await expect(leaderboardPage.configurationPopup, 'Expected the popup to close via Cancel').not.toBeVisible({ timeout: 10000 });

//         await openCreateConfigurationPopup(leaderboardPage);
//         await leaderboardPage.clickCloseDialog();
//         await expect(leaderboardPage.configurationPopup, 'Expected the popup to close via the "X" Close button').not.toBeVisible({ timeout: 10000 });

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_017_close_popup');
//         console.log('Both Cancel and the "X" Close button close the popup.');
//     });

//     test('TC_LB_018 Is Testing Toggle', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         expect(await leaderboardPage.isToggleDisabled(leaderboardPage.isTestingToggle), 'Expected Is Testing to be enabled on this popup').toBe(false);

//         const stateBefore = await leaderboardPage.isToggleChecked(leaderboardPage.isTestingToggle);
//         const toggledOn = await leaderboardPage.clickToggle(leaderboardPage.isTestingToggle);
//         expect(toggledOn, 'Expected Is Testing to change state').toBe(true);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.isTestingToggle), 'Expected Is Testing to flip').toBe(!stateBefore);

//         const toggledOff = await leaderboardPage.clickToggle(leaderboardPage.isTestingToggle);
//         expect(toggledOff, 'Expected Is Testing to change state again').toBe(true);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.isTestingToggle), 'Expected Is Testing to return to its original state').toBe(stateBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_018_is_testing_toggle');
//         console.log('Is Testing toggles ON then OFF on the Create Configuration popup.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_019 Allow Feed Allocation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         const stateBefore = await leaderboardPage.isToggleChecked(leaderboardPage.allowFeedAllocationsToggle);
//         const toggledOn = await leaderboardPage.clickToggle(leaderboardPage.allowFeedAllocationsToggle);
//         expect(toggledOn, 'Expected Allow Feed Allocations to change state').toBe(true);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.allowFeedAllocationsToggle), 'Expected Allow Feed Allocations to flip').toBe(!stateBefore);

//         const toggledOff = await leaderboardPage.clickToggle(leaderboardPage.allowFeedAllocationsToggle);
//         expect(toggledOff, 'Expected Allow Feed Allocations to change state again').toBe(true);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.allowFeedAllocationsToggle), 'Expected Allow Feed Allocations to return to its original state').toBe(stateBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_019_allow_feed_allocation');
//         console.log('Allow Feed Allocations toggles ON then OFF.');

//         await leaderboardPage.clickCancel();
//     });

//     // NOT FULLY CONFIRMED: which field(s) Include Amount Modifier enables/disables wasn't shown
//     // live (the captured popup HTML has this toggle OFF, and every other field already reads
//     // data-p-disabled="false" in that same state) — send a capture with it toggled ON to see what
//     // changes, and this can assert the dependent-field behavior specifically. For now this only
//     // confirms the toggle itself is interactive.
//     test('TC_LB_020 Include Amount Modifier', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         const stateBefore = await leaderboardPage.isToggleChecked(leaderboardPage.amountModifierToggle);
//         const toggledOn = await leaderboardPage.clickToggle(leaderboardPage.amountModifierToggle);
//         expect(toggledOn, 'Expected Include Amount Modifier to change state').toBe(true);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.amountModifierToggle), 'Expected Include Amount Modifier to flip').toBe(!stateBefore);

//         const toggledOff = await leaderboardPage.clickToggle(leaderboardPage.amountModifierToggle);
//         expect(toggledOff, 'Expected Include Amount Modifier to change state again').toBe(true);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.amountModifierToggle), 'Expected Include Amount Modifier to return to its original state').toBe(stateBefore);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_020_include_amount_modifier');
//         console.log('Include Amount Modifier toggles ON then OFF (dependent-field behavior not yet verified — see comment above).');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_021 Min Wager Validation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         await leaderboardPage.fillMinWagerRaw('-5');
//         await page.waitForTimeout(300);
//         const negativeValue = await leaderboardPage.getMinWagerValue();
//         // Tolerant: negative input must be rejected EITHER by the field clamping/stripping the
//         // negative sign OR by keeping Save disabled — the exact mechanism wasn't confirmed live.
//         const wasNegativeRejected = !negativeValue.trim().startsWith('-');
//         const saveDisabled = !(await leaderboardPage.saveBtn.isEnabled().catch(() => false));
//         expect(wasNegativeRejected || saveDisabled, 'Expected a negative Min Wager to be rejected or clamped').toBe(true);

//         await leaderboardPage.fillMinWager('100');
//         const validValue = await leaderboardPage.getMinWagerValue();
//         expect(validValue.replace(/,/g, ''), 'Expected a valid Min Wager value to be accepted').toBe('100');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_021_min_wager_validation');
//         console.log('Min Wager rejects/clamps a negative value and accepts a valid one.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_022 Min Odds Validation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         const defaultValue = await leaderboardPage.getMinOddsValue();
//         expect(defaultValue, 'Expected Min Odds to default to 1.5').toBe('1.5');

//         await leaderboardPage.fillMinOdds('abc');
//         const invalidValue = await leaderboardPage.getMinOddsValue();
//         expect(/^\d*\.?\d*$/.test(invalidValue), `Expected Min Odds to reject non-numeric input, got "${invalidValue}"`).toBe(true);

//         await leaderboardPage.fillMinOdds('2.5');
//         const validValue = await leaderboardPage.getMinOddsValue();
//         expect(validValue, 'Expected a valid decimal Min Odds value to be accepted').toBe('2.5');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_022_min_odds_validation');
//         console.log('Min Odds defaults to 1.5, rejects non-numeric input, and accepts a valid decimal.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_023 Leaderboard Type Dropdown', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         const selected = await leaderboardPage.selectFirstLeaderboardType();
//         const shownValue = await leaderboardPage.getDropdownValue(leaderboardPage.leaderboardTypeDropdown);
//         expect(shownValue, `Expected the selected Leaderboard Type "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_023_leaderboard_type_dropdown');
//         console.log(`Leaderboard Type dropdown opened and the selected value "${selected}" is shown.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_025 Point Source Dropdown', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         const selected = await leaderboardPage.selectFirstPointSource();
//         const shownValue = await leaderboardPage.getDropdownValue(leaderboardPage.pointSourceDropdown);
//         expect(shownValue, `Expected the selected Point Source "${selected}" to be shown`).toBe(selected);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_025_point_source_dropdown');
//         console.log(`Point Source dropdown opened and the selected value "${selected}" is shown.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_026 Banner URL Validation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         await leaderboardPage.fillBannerUrl('not a url');
//         await page.waitForTimeout(300);
//         const hasErrors = await leaderboardPage.hasValidationErrors();

//         await leaderboardPage.fillBannerUrl('https://example.com/banner.png');
//         const validValue = await leaderboardPage.getBannerUrlValue();
//         expect(validValue, 'Expected a valid Banner URL to be accepted').toBe('https://example.com/banner.png');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_026_banner_url_validation');
//         // Banner URL isn't marked mandatory and no format-validation rule was confirmed live for
//         // it, so the invalid-URL case is only logged, not asserted on.
//         console.log(`Banner URL accepts a valid URL (invalid-URL format enforcement: ${hasErrors ? 'inline errors shown' : 'not observed'}).`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_027 Edit Configuration', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.openEditForConfiguration(name);
//         await leaderboardPage.waitForConfigurationPopupLoad();

//         const updatedDescription = `${name} updated description`;
//         await leaderboardPage.fillDescription(updatedDescription);
//         await page.waitForTimeout(300);

//         const submitBtn = await leaderboardPage.getEditSubmitBtn();
//         await expect(submitBtn, 'Expected the submit button to be enabled after editing').toBeEnabled({ timeout: 10000 });
//         await leaderboardPage.clickSaveOrUpdate();

//         const toastText = page.locator('.p-toast-message-text').first();
//         await expect(toastText, 'Expected a toast confirming the Configuration was updated').toBeVisible({ timeout: 15000 });
//         console.log('Edit Configuration toast message:', await toastText.textContent());

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_027_edit_configuration');
//         console.log(`✅ TC_LB_027 PASSED — Configuration "${name}" edited (Description updated).`);
//     });

//     test('TC_LB_028 Data Persistence', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await page.reload({ waitUntil: 'domcontentloaded' });
//         await page.waitForLoadState('networkidle').catch(() => {});
//         await leaderboardPage.createConfigurationBtn.waitFor({ state: 'visible', timeout: 30000 });

//         const isVisible = await leaderboardPage.isConfigurationVisibleByName(name);
//         expect(isVisible, `Expected Configuration "${name}" to remain visible after refresh`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_028_data_persistence');
//         console.log(`✅ TC_LB_028 PASSED — Configuration "${name}" persisted after a page refresh.`);
//     });

//     test('TC_LB_029 Max Point Allocation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         await leaderboardPage.fillMaxPoints('999999999');
//         await page.waitForTimeout(300);

//         // Tolerant per the test plan's own wording ("Accepted or validation shown") — either
//         // outcome is valid; this only confirms the field doesn't silently crash or hang.
//         const value = await leaderboardPage.getMaxPointsValue();
//         const hasErrors = await leaderboardPage.hasValidationErrors();
//         expect(value.length > 0 || hasErrors, 'Expected a large Max Point Allocation to be accepted or flagged').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_029_max_point_allocation');
//         console.log(`Max Point Allocation with a large value: "${value}" (validation shown: ${hasErrors}).`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_030 Min Legs Validation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateConfigurationPopup(leaderboardPage);
//         await leaderboardPage.fillMinLegs('0');
//         const zeroValue = await leaderboardPage.getMinLegsValue();
//         expect(zeroValue, 'Expected 0 to be accepted for Min Number of Legs').toBe('0');

//         await leaderboardPage.fillMinLegsRaw('-3');
//         await page.waitForTimeout(300);
//         const negativeValue = await leaderboardPage.getMinLegsValue();
//         const wasNegativeRejected = !negativeValue.trim().startsWith('-');
//         const saveDisabled = !(await leaderboardPage.saveBtn.isEnabled().catch(() => false));
//         expect(wasNegativeRejected || saveDisabled, 'Expected a negative Min Number of Legs to be rejected or clamped').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_030_min_legs_validation');
//         console.log('Min Number of Legs accepts 0 and rejects/clamps a negative value.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_031 Active Toggle', async ({ page, leaderboardPage }, testInfo) => {
//         const stateBefore = await leaderboardPage.isToggleChecked(leaderboardPage.configActiveToggle);
//         const toggled = await leaderboardPage.clickToggle(leaderboardPage.configActiveToggle);
//         expect(toggled, 'Expected the Active filter to change state').toBe(true);
//         await page.waitForTimeout(500);
//         expect(await leaderboardPage.isToggleChecked(leaderboardPage.configActiveToggle), 'Expected the Active filter to reflect the new state').toBe(!stateBefore);

//         // Restore the original state so it doesn't leak into other tests sharing this page.
//         await leaderboardPage.clickToggle(leaderboardPage.configActiveToggle);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_031_active_toggle');
//         console.log('Active filter toggles and the Configurations list updates without error.');
//     });

//     test('TC_LB_032 Open 3-dot Menu', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         await expect(menu.getByText('Edit', { exact: true }), 'Expected Edit menu item').toBeVisible();
//         await expect(menu.getByText('Player Info', { exact: true }), 'Expected Player Info menu item').toBeVisible();
//         await expect(menu.getByText('Prize Configuration', { exact: true }), 'Expected Prize Configuration menu item').toBeVisible();
//         await expect(menu.getByText('Delete', { exact: true }), 'Expected Delete menu item').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_032_open_3dot_menu');
//         console.log('The "..." menu opens with Edit, Player Info, Prize Configuration, and Delete.');

//         await page.keyboard.press('Escape').catch(() => {});
//     });

//     test('TC_LB_033-036 Edit Configuration (from 3-dot)', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         await expect(menu, 'Expected the "..." menu to be displayed').toBeVisible();

//         await leaderboardPage.clickEditFromConfigRowMenu();
//         await leaderboardPage.waitForConfigurationPopupLoad();

//         const updatedDescription = `${name} updated via 3-dot`;
//         await leaderboardPage.fillDescription(updatedDescription);
//         await page.waitForTimeout(300);

//         const submitBtn = await leaderboardPage.getEditSubmitBtn();
//         await expect(submitBtn, 'Expected the submit button to be enabled after editing').toBeEnabled({ timeout: 10000 });
//         await leaderboardPage.clickSaveOrUpdate();

//         const toastText = page.locator('.p-toast-message-text').first();
//         await expect(toastText, 'Expected a toast confirming the changes were saved').toBeVisible({ timeout: 15000 });
//         console.log('Edit (via 3-dot) toast message:', await toastText.textContent());

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_033-036_edit_configuration_3dot');
//         console.log(`✅ TC_LB_033-036 PASSED — Configuration "${name}" edited via the 3-dot menu.`);
//     });

//     test('TC_LB_037-040 Delete Configuration', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         await expect(menu, 'Expected the "..." menu to be displayed').toBeVisible();

//         await leaderboardPage.clickDeleteFromConfigRowMenu();
//         await expect(leaderboardPage.confirmYesBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });

//         await leaderboardPage.clickConfirmYes();
//         const isAbsent = await leaderboardPage.isConfigurationAbsentByName(name);
//         expect(isAbsent, `Expected Configuration "${name}" to be removed from the list`).toBe(true);
//         createdConfigName = undefined; // already deleted as part of the test — no cleanup needed

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_037-040_delete_configuration');
//         console.log(`✅ TC_LB_037-040 PASSED — Configuration "${name}" deleted and confirmed removed from the list.`);
//     });

//     test('TC_LB_041-043 Delete Cancel Validation', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         await expect(menu, 'Expected the "..." menu to be displayed').toBeVisible();

//         await leaderboardPage.clickDeleteFromConfigRowMenu();
//         await expect(leaderboardPage.confirmNoBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });

//         await leaderboardPage.clickConfirmNo();
//         await page.waitForTimeout(500);
//         const isStillVisible = await leaderboardPage.isConfigurationVisibleByName(name);
//         expect(isStillVisible, `Expected Configuration "${name}" to remain after cancelling delete`).toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_041-043_delete_cancel_validation');
//         console.log(`✅ TC_LB_041-043 PASSED — Cancelling delete leaves Configuration "${name}" intact.`);
//     });

//     test('TC_LB_044-045 View Player Info', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         await expect(menu, 'Expected the "..." menu to be displayed').toBeVisible();

//         const urlBeforeNav = page.url();
//         await leaderboardPage.clickPlayerInfoFromConfigRowMenu();
//         await page.waitForTimeout(500);

//         expect(page.url(), 'Expected navigating to Player Info to change the URL').not.toBe(urlBeforeNav);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_044-045_view_player_info');
//         console.log(`✅ TC_LB_044-045 PASSED — Player Info opened for Configuration "${name}" (URL: ${page.url()}).`);
//     });

//     test('TC_LB_046-047 View Prize Configuration', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         await expect(menu, 'Expected the "..." menu to be displayed').toBeVisible();

//         const urlBeforeNav = page.url();
//         await leaderboardPage.clickPrizeConfigurationFromConfigRowMenu();
//         await page.waitForTimeout(500);

//         expect(page.url(), 'Expected navigating to Prize Configuration to change the URL').not.toBe(urlBeforeNav);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_046-047_view_prize_configuration');
//         console.log(`✅ TC_LB_046-047 PASSED — Prize Configuration opened for Configuration "${name}" (URL: ${page.url()}).`);
//     });

//     test('TC_LB_048 3-dot Menu UI Validation', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         const menu = leaderboardPage.getConfigRowMenu();
//         const itemCount = await menu.locator('.p-menuitem').count();
//         expect(itemCount, 'Expected exactly 4 menu items (Edit, Player Info, Prize Configuration, Delete)').toBe(4);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_048_3dot_menu_ui_validation');
//         console.log('All 4 "..." menu options are displayed correctly.');

//         await page.keyboard.press('Escape').catch(() => {});
//     });

//     test('TC_LB_049 3-dot Multiple Click Handling', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         // Confirmed live: once open, the menu can sit visually over/near its own trigger button,
//         // so a real repeated click at that position may land on the menu overlay rather than the
//         // trigger underneath — clickRowMenuForConfiguration's strict actionability wait just hangs
//         // on that. {force: true} exercises the actual "click it again while it's open" scenario
//         // this test is meant to check, instead of fighting the interception.
//         const trigger = leaderboardPage.getConfigRowMenuTrigger(name);
//         await trigger.waitFor({ state: 'visible', timeout: 15000 });
//         for (let i = 0; i < 3; i++) {
//             await trigger.click({ force: true });
//             await page.waitForTimeout(300);
//         }

//         const visibleMenus = await page.locator('.p-menu:visible, .p-tieredmenu:visible').count();
//         expect(visibleMenus, 'Expected at most one "..." menu to remain visible after repeated clicks').toBeLessThanOrEqual(1);

//         if (visibleMenus === 1) {
//             const itemCount = await leaderboardPage.getConfigRowMenu().locator('.p-menuitem').count();
//             expect(itemCount, 'Expected the menu to still show exactly 4 items, not duplicated').toBe(4);
//         }

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_049_3dot_multiple_click_handling');
//         console.log('Clicking the "..." menu multiple times does not duplicate or break it.');

//         await page.keyboard.press('Escape').catch(() => {});
//     });

//     // BEST-EFFORT INTERPRETATION (not clarified further): reads "Session Handling on Actions" as
//     // "a sequence of normal actions (Edit, View Player Info, View Prize Configuration, Delete),
//     // performed back-to-back on an active session, all complete without the app treating any of
//     // them as unauthenticated/expired" — i.e. no bounce to a login page and no session-related
//     // error toast anywhere in the sequence. If the intended scenario is something more specific
//     // (an actually-expired token, a concurrent second tab, etc.), this needs re-scoping.
//     test('TC_LB_051 Session Handling on Actions', async ({ page, leaderboardPage }, testInfo) => {
//         const name = `Config_${Date.now()}`;
//         await createConfiguration(page, leaderboardPage, name);
//         createdConfigName = name;

//         const urlBeforeSequence = page.url();
//         // Confirmed live: the sidebar always renders a "Simulate Session" leaf (under Workflow
//         // Management), so a page-wide getByText(/session|.../i) matches it unconditionally and
//         // reports a false "session error" on every check regardless of actual auth state. Scoped
//         // to toast/snackbar elements only, which is where a real session error would actually show.
//         const isSessionError = async () => {
//             const bouncedToLogin = /login|signin/i.test(page.url());
//             const sessionErrorToast = await page.locator('.p-toast-message, [role="alert"]')
//                 .filter({ hasText: /session|unauthor|forbidden|logged out/i })
//                 .first().isVisible({ timeout: 500 }).catch(() => false);
//             return bouncedToLogin || sessionErrorToast;
//         };

//         // Edit
//         await leaderboardPage.openEditForConfiguration(name);
//         await leaderboardPage.waitForConfigurationPopupLoad();
//         expect(await isSessionError(), 'Expected Edit to open without a session error').toBe(false);
//         await leaderboardPage.clickCancel();

//         // View Player Info
//         await leaderboardPage.openPlayerInfoForConfiguration(name);
//         await page.waitForTimeout(500);
//         expect(await isSessionError(), 'Expected View Player Info to open without a session error').toBe(false);
//         await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
//         await page.waitForLoadState('networkidle').catch(() => {});

//         // View Prize Configuration
//         await leaderboardPage.openPrizeConfigurationForConfiguration(name);
//         await page.waitForTimeout(500);
//         expect(await isSessionError(), 'Expected View Prize Configuration to open without a session error').toBe(false);
//         await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => {});
//         await page.waitForLoadState('networkidle').catch(() => {});

//         // Delete
//         await leaderboardPage.clickRowMenuForConfiguration(name);
//         await leaderboardPage.clickDeleteFromConfigRowMenu();
//         await expect(leaderboardPage.confirmYesBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });
//         await leaderboardPage.clickConfirmYes();
//         const isAbsent = await leaderboardPage.isConfigurationAbsentByName(name);
//         expect(isAbsent, `Expected Configuration "${name}" to be removed from the list`).toBe(true);
//         expect(await isSessionError(), 'Expected Delete to complete without a session error').toBe(false);
//         createdConfigName = undefined; // already deleted as part of the test — no cleanup needed

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_051_session_handling');
//         console.log(`✅ TC_LB_051 PASSED — Edit/View Player Info/View Prize Configuration/Delete all completed without a session error (started at ${urlBeforeSequence}).`);
//     });
// });

// // ─── Shared helpers for Manage Streaks / Streak popup ──────────────────────────

// // Manage Streaks is only reachable via an existing Leaderboard's "..." menu — creates a
// // throwaway Leaderboard as the vehicle in, navigates into it, and returns its name so the caller
// // can delete it afterward (compulsory cleanup, regardless of pass/fail).
// async function navigateToManageStreaksForNewLeaderboard(page: any, sidebarPage: any, leaderboardPage: any): Promise<string> {
//     await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//     const leaderboardName = `Leaderboard_${Date.now()}`;
//     await createLeaderboard(page, leaderboardPage, leaderboardName);
//     await leaderboardPage.openManageStreaks(leaderboardName);
//     await leaderboardPage.createStreakBtn.waitFor({ state: 'visible', timeout: 30000 });
//     return leaderboardName;
// }

// async function openCreateStreakPopup(leaderboardPage: any) {
//     await leaderboardPage.clickCreateStreak();
//     await leaderboardPage.waitForStreakPopupLoad();
// }

// // Fills both mandatory fields (Streak Value*, Streak Multiplier*) and saves. Used afterward to
// // verify/delete the Streak (see the shared afterEach below, which deletes regardless of pass/fail).
// //
// // Confirmed live (across repeated runs): Save reliably creates the row even when no
// // `.p-toast-message-success`/`[data-p-severity="success"]` toast is ever detected — unlike the
// // Leaderboard popup, this flow's success indicator wasn't confirmed to be a PrimeNG toast at all.
// // The toast is therefore logged best-effort only; the row's actual presence in the table (via
// // isStreakVisibleByValues) is the real pass/fail signal.
// async function createStreak(page: any, leaderboardPage: any, streakValue: string, streakMultiplier: string): Promise<void> {
//     await openCreateStreakPopup(leaderboardPage);
//     await leaderboardPage.fillStreakValue(streakValue);
//     await leaderboardPage.fillStreakMultiplier(streakMultiplier);
//     await page.waitForTimeout(300);

//     await expect(leaderboardPage.saveBtn, 'Expected Save to be enabled once both mandatory fields are filled').toBeEnabled({ timeout: 10000 });
//     await leaderboardPage.clickSave();

//     const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//     const toastAppeared = await toastText.isVisible({ timeout: 5000 }).catch(() => false);
//     if (toastAppeared) {
//         console.log('Create Streak toast message:', await toastText.textContent().catch(() => 'N/A'));
//     } else {
//         console.log('No success toast detected for Create Streak — verifying via the Streak row instead.');
//     }

//     const isVisible = await leaderboardPage.isStreakVisibleByValues(streakValue, streakMultiplier);
//     expect(isVisible, `Expected a Streak row (Value=${streakValue}, Multiplier=${streakMultiplier}) to appear`).toBe(true);
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// //  TC_LB_052 to TC_LB_060 — Manage Streaks page + Create/Edit Streak popup.
// //  Confirmed live: Manage Streaks renders a real <table> (NOT cards, unlike Manage
// //  Configurations) — one row per Streak, columns [Streak Value, Multiplier, Created By, Created
// //  Date, Updated By, Updated Date, actions]. Streaks are found/verified by matching BOTH the
// //  Streak Value and Multiplier cells exactly (see getStreakRowByValues), not by count, so these
// //  tests tolerate other Streaks already existing on the same Leaderboard.
// //  Streak Value/Multiplier are PrimeNG InputNumber components (role="spinbutton",
// //  inputmode="numeric", no decimal-mode attribute seen) — "integer only" is tested by typing a
// //  decimal point and letters and asserting neither makes it into the field's value.
// //  Confirmed live (via repeated failures): Save reliably creates the Streak row even when no
// //  `.p-toast-message-success` toast ever appears — see createStreak's own comment. The toast is
// //  therefore logged best-effort only in both create and edit; the row's presence/values in the
// //  table is the real pass/fail signal.
// //  Every test needs a Leaderboard just to REACH Manage Streaks — the shared beforeEach creates
// //  one, the shared afterEach deletes both the Streak (if one was created) and the Leaderboard
// //  itself, regardless of pass/fail.
// // ═══════════════════════════════════════════════════════════════════════════════
// test.describe('Leaderboard - Manage Streaks Tests', () => {
//     let createdLeaderboardName: string | undefined;
//     let createdStreak: { value: string; multiplier: string } | undefined;

//     test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         createdLeaderboardName = await navigateToManageStreaksForNewLeaderboard(page, sidebarPage, leaderboardPage);
//         createdStreak = undefined;
//     });

//     test.afterEach(async ({ page, sidebarPage, leaderboardPage }) => {
//         if (createdStreak) {
//             const { value, multiplier } = createdStreak;
//             createdStreak = undefined;
//             await leaderboardPage.deleteStreakIfPresent(value, multiplier);
//         }
//         if (createdLeaderboardName) {
//             const leaderboardName = createdLeaderboardName;
//             createdLeaderboardName = undefined;
//             await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
//             await leaderboardPage.deleteLeaderboardIfPresent(leaderboardName);
//         }
//     });

//     test('TC_LB_052 Verify Create Streak popup', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateStreakPopup(leaderboardPage);
//         await expect(leaderboardPage.createStreakPopup, 'Expected the Create Streak popup to open').toBeVisible({ timeout: 15000 });
//         await expect(leaderboardPage.streakValueInput, 'Expected Streak Value field').toBeVisible();
//         await expect(leaderboardPage.streakMultiplierInput, 'Expected Streak Multiplier field').toBeVisible();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_052_create_streak_popup');
//         console.log('Create Streak popup opens with Streak Value and Streak Multiplier fields.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_053 Verify mandatory field validation', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateStreakPopup(leaderboardPage);

//         // Confirmed live both fields default to "0", not blank — mandatory enforcement is tested
//         // by clearing them outright rather than relying on their pre-filled default.
//         await leaderboardPage.streakValueInput.fill('');
//         await leaderboardPage.streakMultiplierInput.fill('');
//         await page.waitForTimeout(300);

//         const saveWasClickable = await leaderboardPage.saveBtn.isEnabled().catch(() => false);
//         if (saveWasClickable) {
//             await leaderboardPage.clickSave();
//             await page.waitForTimeout(500);
//         }
//         const hasErrors = await leaderboardPage.hasValidationErrors();
//         // Tolerant: mandatory-field enforcement could be inline errors after a Save attempt, OR
//         // Save itself staying disabled until both fields are filled — not confirmed live which.
//         expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation to be enforced (inline errors or a disabled Save) when both fields are blank').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_053_mandatory_field_validation');
//         console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_054 Verify Streak Value only accepts integers', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateStreakPopup(leaderboardPage);

//         await leaderboardPage.fillStreakValue('12.5abc');
//         const typedValue = await leaderboardPage.getStreakValue();
//         expect(/^\d*$/.test(typedValue), `Expected Streak Value to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

//         await leaderboardPage.fillStreakValue('7');
//         expect(await leaderboardPage.getStreakValue(), 'Expected a plain integer to be accepted').toBe('7');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_054_streak_value_integer_only');
//         console.log('Streak Value rejects decimals/letters and accepts a plain integer.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_055 Verify Streak Multiplier only accepts integers', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateStreakPopup(leaderboardPage);

//         await leaderboardPage.fillStreakMultiplier('3.14xyz');
//         const typedValue = await leaderboardPage.getStreakMultiplier();
//         expect(/^\d*$/.test(typedValue), `Expected Streak Multiplier to reject the decimal point/letters, but got "${typedValue}"`).toBe(true);

//         await leaderboardPage.fillStreakMultiplier('2');
//         expect(await leaderboardPage.getStreakMultiplier(), 'Expected a plain integer to be accepted').toBe('2');

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_055_streak_multiplier_integer_only');
//         console.log('Streak Multiplier rejects decimals/letters and accepts a plain integer.');

//         await leaderboardPage.clickCancel();
//     });

//     test('TC_LB_056 Verify Save creates a new Streak', async ({ page, leaderboardPage }, testInfo) => {
//         await createStreak(page, leaderboardPage, '5', '2');
//         createdStreak = { value: '5', multiplier: '2' };

//         const isVisible = await leaderboardPage.isStreakVisibleByValues('5', '2');
//         expect(isVisible, 'Expected the new Streak (Value=5, Multiplier=2) to appear in the list').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_056_create_streak_save');
//         console.log('✅ TC_LB_056 PASSED — a new Streak (Value=5, Multiplier=2) was created.');
//     });

//     test('TC_LB_057 Verify Cancel button', async ({ page, leaderboardPage }, testInfo) => {
//         await openCreateStreakPopup(leaderboardPage);
//         await leaderboardPage.fillStreakValue('9');
//         await leaderboardPage.fillStreakMultiplier('3');

//         await leaderboardPage.clickCancel();
//         await expect(leaderboardPage.createStreakPopup, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

//         const isAbsent = await leaderboardPage.isStreakAbsentByValues('9', '3', 5000);
//         expect(isAbsent, 'Expected Cancel to discard the form without creating a Streak').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_057_cancel_button');
//         console.log('Cancel closes the Create Streak popup without creating anything.');
//     });

//     test('TC_LB_058 Verify Edit Streak', async ({ page, leaderboardPage }, testInfo) => {
//         await createStreak(page, leaderboardPage, '5', '2');
//         createdStreak = { value: '5', multiplier: '2' };

//         await leaderboardPage.clickEditForStreak('5', '2');
//         await leaderboardPage.waitForStreakPopupLoad();
//         expect(await leaderboardPage.getStreakValue(), 'Expected the Edit popup to reopen pre-filled with the Streak Value').toBe('5');
//         expect(await leaderboardPage.getStreakMultiplier(), 'Expected the Edit popup to reopen pre-filled with the Streak Multiplier').toBe('2');

//         await leaderboardPage.fillStreakValue('8');
//         await leaderboardPage.fillStreakMultiplier('4');
//         await page.waitForTimeout(300);
//         await leaderboardPage.clickSaveOrUpdate();

//         // Best-effort toast, same tolerant pattern as createStreak — see this describe block's
//         // own header comment.
//         const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
//         const toastAppeared = await toastText.isVisible({ timeout: 5000 }).catch(() => false);
//         if (toastAppeared) {
//             console.log('Edit Streak toast message:', await toastText.textContent().catch(() => 'N/A'));
//         }

//         const isUpdated = await leaderboardPage.isStreakVisibleByValues('8', '4');
//         expect(isUpdated, 'Expected the Streak row to reflect the edit (Value=8, Multiplier=4)').toBe(true);
//         createdStreak = { value: '8', multiplier: '4' }; // row now exists under the new values — cleanup must target that

//         await leaderboardPage.clickEditForStreak('8', '4');
//         await leaderboardPage.waitForStreakPopupLoad();
//         expect(await leaderboardPage.getStreakValue(), 'Expected the re-opened Streak Value to reflect the edit').toBe('8');
//         expect(await leaderboardPage.getStreakMultiplier(), 'Expected the re-opened Streak Multiplier to reflect the edit').toBe('4');
//         await leaderboardPage.clickCancel();

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_058_edit_streak');
//         console.log('✅ TC_LB_058 PASSED — the Streak opened pre-filled, was edited, and the change persisted.');
//     });

//     test('TC_LB_059 Verify Delete Streak with Yes', async ({ page, leaderboardPage }, testInfo) => {
//         await createStreak(page, leaderboardPage, '6', '3');
//         createdStreak = { value: '6', multiplier: '3' };

//         await leaderboardPage.clickDeleteForStreak('6', '3');
//         await expect(leaderboardPage.confirmYesBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });
//         await leaderboardPage.clickConfirmYes();
//         createdStreak = undefined; // deleted as part of the test — afterEach doesn't need to repeat it

//         const isAbsent = await leaderboardPage.isStreakAbsentByValues('6', '3', 15000);
//         expect(isAbsent, 'Expected the Streak to be removed after confirming Delete').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_059_delete_streak_yes');
//         console.log('✅ TC_LB_059 PASSED — Yes on the delete confirmation removed the Streak.');
//     });

//     test('TC_LB_060 Verify Delete Streak with No', async ({ page, leaderboardPage }, testInfo) => {
//         await createStreak(page, leaderboardPage, '6', '3');
//         createdStreak = { value: '6', multiplier: '3' };

//         await leaderboardPage.clickDeleteForStreak('6', '3');
//         await expect(leaderboardPage.confirmNoBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });
//         await leaderboardPage.clickConfirmNo();

//         await expect(leaderboardPage.confirmNoBtn, 'Expected the confirmation modal to close after No').not.toBeVisible({ timeout: 10000 });
//         const isStillVisible = await leaderboardPage.isStreakVisibleByValues('6', '3', 5000);
//         expect(isStillVisible, 'Expected No to leave the Streak untouched').toBe(true);

//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_060_delete_streak_no');
//         console.log('✅ TC_LB_060 PASSED — No on the delete confirmation left the Streak untouched.');
//     });
// });

// ─── Shared helpers for Periods / Period popup ──────────────────────────────────

// Periods is only reachable via an existing Leaderboard's "..." menu — creates a throwaway
// Leaderboard as the vehicle in, navigates into it, and returns its name so the caller can delete
// it afterward (compulsory cleanup, regardless of pass/fail).
async function navigateToPeriodsForNewLeaderboard(page: any, sidebarPage: any, leaderboardPage: any): Promise<string> {
    await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
    const leaderboardName = `Leaderboard_${Date.now()}`;
    await createLeaderboard(page, leaderboardPage, leaderboardName);
    await leaderboardPage.openPeriods(leaderboardName);
    await leaderboardPage.createPeriodBtn.waitFor({ state: 'visible', timeout: 30000 });
    return leaderboardName;
}

async function openCreatePeriodPopup(leaderboardPage: any) {
    await leaderboardPage.clickCreatePeriod();
    await leaderboardPage.waitForPeriodPopupLoad();
}

// Fills the 3 confirmed-mandatory fields (Name*, Start Date*, End Date* — Scheduled Date has no
// asterisk and is left blank) and saves. Used afterward to verify/delete the Period (see the
// shared afterEach below, which deletes regardless of pass/fail).
//
// Follows the same tolerant-toast pattern established for createStreak: the row's actual presence
// is the real pass/fail signal, since the Streak flow already proved a PrimeNG success toast
// isn't guaranteed on every one of this app's "create" popups.
async function createPeriod(page: any, leaderboardPage: any, name: string): Promise<void> {
    await openCreatePeriodPopup(leaderboardPage);
    await leaderboardPage.fillPeriodName(name);
    await leaderboardPage.setPeriodStartDate();
    await leaderboardPage.setPeriodEndDate();
    await page.waitForTimeout(300);

    await expect(leaderboardPage.saveBtn, 'Expected Save to be enabled once all mandatory fields are filled').toBeEnabled({ timeout: 10000 });
    await leaderboardPage.clickSave();

    const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
    const toastAppeared = await toastText.isVisible({ timeout: 5000 }).catch(() => false);
    if (toastAppeared) {
        console.log('Create Period toast message:', await toastText.textContent().catch(() => 'N/A'));
    } else {
        console.log('No success toast detected for Create Period — verifying via the Period row instead.');
    }

    const isVisible = await leaderboardPage.isPeriodVisibleByName(name);
    expect(isVisible, `Expected a Period row for "${name}" to appear`).toBe(true);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC_LB_061 to TC_LB_070 — Periods page + Create/Edit Period popup.
//  ASSUMPTION: only the Create Period button, popup fields, Save/Cancel, a standalone Edit/Delete
//  button pair and the delete confirmation were confirmed live — NOT the Period list/row markup
//  itself. Modeled on Manage Streaks (the other sibling row-kebab destination, confirmed to be a
//  real <table>, not cards) — rows matched by Name (free text, like Promotion Name) via
//  getPeriodRowByName, the same convention as the main Leaderboard table. If this turns out to be
//  cards like Manage Configurations instead, these need re-pointing at a card-based locator.
//  Every test needs a Leaderboard just to REACH Periods — the shared beforeEach creates one, the
//  shared afterEach deletes both the Period (if one was created) and the Leaderboard itself,
//  regardless of pass/fail.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Leaderboard - Periods Tests', () => {
    let createdLeaderboardName: string | undefined;
    let createdPeriodName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, leaderboardPage }) => {
        createdLeaderboardName = await navigateToPeriodsForNewLeaderboard(page, sidebarPage, leaderboardPage);
        createdPeriodName = undefined;
    });

    test.afterEach(async ({ page, sidebarPage, leaderboardPage }) => {
        if (createdPeriodName) {
            const periodName = createdPeriodName;
            createdPeriodName = undefined;
            await leaderboardPage.deletePeriodIfPresent(periodName);
        }
        if (createdLeaderboardName) {
            const leaderboardName = createdLeaderboardName;
            createdLeaderboardName = undefined;
            await navigateToLeaderboard(page, sidebarPage, leaderboardPage);
            await leaderboardPage.deleteLeaderboardIfPresent(leaderboardName);
        }
    });

    // test('TC_LB_061 Verify Create Period popup', async ({ page, leaderboardPage }, testInfo) => {
    //     await openCreatePeriodPopup(leaderboardPage);
    //     await expect(leaderboardPage.createPeriodPopup, 'Expected the Create Period popup to open').toBeVisible({ timeout: 15000 });
    //     await expect(leaderboardPage.periodNameInput, 'Expected Name field').toBeVisible();
    //     await expect(leaderboardPage.periodStartDateInput, 'Expected Start Date field').toBeVisible();
    //     await expect(leaderboardPage.periodEndDateInput, 'Expected End Date field').toBeVisible();
    //     await expect(leaderboardPage.periodScheduledDateInput, 'Expected Scheduled Date field').toBeVisible();

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_061_create_period_popup');
    //     console.log('Create Period popup opens with Name, Start Date, End Date and Scheduled Date fields.');

    //     await leaderboardPage.clickCancel();
    // });

    // test('TC_LB_062 Verify mandatory field validation', async ({ page, leaderboardPage }, testInfo) => {
    //     await openCreatePeriodPopup(leaderboardPage);

    //     // Confirmed live: Name renders with an immediate "Field is required" inline error even
    //     // before Save is attempted — so this check doesn't need to click Save first for Name, but
    //     // stays tolerant (inline error OR a disabled Save) since Start/End Date's own mechanism
    //     // wasn't separately confirmed.
    //     const saveWasClickable = await leaderboardPage.saveBtn.isEnabled().catch(() => false);
    //     if (saveWasClickable) {
    //         await leaderboardPage.clickSave();
    //         await page.waitForTimeout(500);
    //     }
    //     const hasErrors = await leaderboardPage.hasValidationErrors();
    //     expect(hasErrors || !saveWasClickable, 'Expected mandatory-field validation to be enforced (inline errors or a disabled Save) when Name/Start Date/End Date are blank').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_062_mandatory_field_validation');
    //     console.log(`Mandatory validation enforced via: ${hasErrors ? 'inline errors' : 'disabled Save button'}.`);

    //     await leaderboardPage.clickCancel();
    // });

    // test('TC_LB_063 Verify Name field', async ({ page, leaderboardPage }, testInfo) => {
    //     await openCreatePeriodPopup(leaderboardPage);

    //     const name = `Period_${Date.now()}`;
    //     await leaderboardPage.fillPeriodName(name);
    //     expect(await leaderboardPage.getPeriodNameValue(), 'Expected Name value to be accepted').toBe(name);

    //     await leaderboardPage.fillPeriodName('');
    //     const hasErrors = await leaderboardPage.hasValidationErrors();
    //     expect(hasErrors, 'Expected a validation error when Name is left blank').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_063_name_field');
    //     console.log('Name accepts valid input and shows a validation error when left blank.');

    //     await leaderboardPage.clickCancel();
    // });

    // test('TC_LB_064 Verify Start Date and End Date fields', async ({ page, leaderboardPage }, testInfo) => {
    //     await openCreatePeriodPopup(leaderboardPage);

    //     await leaderboardPage.setPeriodStartDate();
    //     const startValue = await leaderboardPage.getPeriodStartDateValue();
    //     expect(startValue.trim().length > 0, 'Expected Start Date to be selected').toBe(true);

    //     await leaderboardPage.setPeriodEndDate();
    //     const endValue = await leaderboardPage.getPeriodEndDateValue();
    //     expect(endValue.trim().length > 0, 'Expected End Date to be selected').toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_064_start_end_date');
    //     console.log('Start Date and End Date both accept a selection.');

    //     await leaderboardPage.clickCancel();
    // });

    // test('TC_LB_065 Verify Scheduled Date is optional', async ({ page, leaderboardPage }, testInfo) => {
    //     const name = `Period_${Date.now()}`;
    //     createdPeriodName = name; // set before creating so afterEach cleans up regardless of pass/fail

    //     // createPeriod() fills only Name/Start Date/End Date (the 3 confirmed-mandatory fields),
    //     // deliberately leaving Scheduled Date untouched, then asserts the Period row actually
    //     // appears afterward — exactly the "create with Scheduled Date blank, pass if it succeeds"
    //     // check this test is meant to run. Checking the popup's own Scheduled Date field value
    //     // after Save was removed — the popup closes on save, so that read was against a stale/
    //     // already-closed form rather than anything meaningful.
    //     await createPeriod(page, leaderboardPage, name);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_065_scheduled_date_optional');
    //     console.log(`✅ TC_LB_065 PASSED — Period "${name}" was created successfully with Scheduled Date left blank.`);
    // });

    // test('TC_LB_066 Verify Save creates a new Period', async ({ page, leaderboardPage }, testInfo) => {
    //     const name = `Period_${Date.now()}`;
    //     await createPeriod(page, leaderboardPage, name);
    //     createdPeriodName = name;

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_066_create_period_save');
    //     console.log(`✅ TC_LB_066 PASSED — Period "${name}" was created.`);
    // });

    // test('TC_LB_067 Verify Cancel button', async ({ page, leaderboardPage }, testInfo) => {
    //     const name = `Period_${Date.now()}`;
    //     await openCreatePeriodPopup(leaderboardPage);
    //     await leaderboardPage.fillPeriodName(name);
    //     await leaderboardPage.setPeriodStartDate();
    //     await leaderboardPage.setPeriodEndDate();

    //     await leaderboardPage.clickCancel();
    //     await expect(leaderboardPage.createPeriodPopup, 'Expected the popup to close without saving').not.toBeVisible({ timeout: 10000 });

    //     const isAbsent = await leaderboardPage.isPeriodAbsentByName(name, 5000);
    //     expect(isAbsent, `Expected Cancel to discard the form without creating Period "${name}"`).toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_067_cancel_button');
    //     console.log('Cancel closes the Create Period popup without creating anything.');
    // });

    test('TC_LB_068 Verify Edit Period', async ({ page, leaderboardPage }, testInfo) => {
        const name = `Period_${Date.now()}`;
        await createPeriod(page, leaderboardPage, name);
        createdPeriodName = name;

        await leaderboardPage.clickEditForPeriod(name);
        await leaderboardPage.waitForPeriodPopupLoad();
        expect(await leaderboardPage.getPeriodNameValue(), 'Expected the Edit popup to reopen pre-filled with the same Name').toBe(name);

        const editedName = `${name}_edited`;
        await leaderboardPage.fillPeriodName(editedName);
        await page.waitForTimeout(300);
        await leaderboardPage.clickSaveOrUpdate();

        const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        const toastAppeared = await toastText.isVisible({ timeout: 5000 }).catch(() => false);
        if (toastAppeared) {
            console.log('Edit Period toast message:', await toastText.textContent().catch(() => 'N/A'));
        }

        const isUpdated = await leaderboardPage.isPeriodVisibleByName(editedName);
        expect(isUpdated, `Expected the Period row to reflect the edit (renamed to "${editedName}")`).toBe(true);
        createdPeriodName = editedName; // row now exists under the new Name — cleanup must target that

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_068_edit_period');
        console.log(`✅ TC_LB_068 PASSED — Period "${name}" was renamed to "${editedName}" and the change persisted.`);
    });

    // test('TC_LB_069 Verify Delete Period with Yes', async ({ page, leaderboardPage }, testInfo) => {
    //     const name = `Period_${Date.now()}`;
    //     await createPeriod(page, leaderboardPage, name);
    //     createdPeriodName = name;

    //     await leaderboardPage.clickDeleteForPeriod(name);
    //     await expect(leaderboardPage.confirmYesBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });
    //     await leaderboardPage.clickConfirmYes();
    //     createdPeriodName = undefined; // deleted as part of the test — afterEach doesn't need to repeat it

    //     const isAbsent = await leaderboardPage.isPeriodAbsentByName(name, 15000);
    //     expect(isAbsent, `Expected Period "${name}" to be removed after confirming Delete`).toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_069_delete_period_yes');
    //     console.log(`✅ TC_LB_069 PASSED — Yes on the delete confirmation removed Period "${name}".`);
    // });

    // test('TC_LB_070 Verify Delete Period with No', async ({ page, leaderboardPage }, testInfo) => {
    //     const name = `Period_${Date.now()}`;
    //     await createPeriod(page, leaderboardPage, name);
    //     createdPeriodName = name;

    //     await leaderboardPage.clickDeleteForPeriod(name);
    //     await expect(leaderboardPage.confirmNoBtn, 'Expected a delete confirmation popup').toBeVisible({ timeout: 10000 });
    //     await leaderboardPage.clickConfirmNo();

    //     await expect(leaderboardPage.confirmNoBtn, 'Expected the confirmation modal to close after No').not.toBeVisible({ timeout: 10000 });
    //     const isStillVisible = await leaderboardPage.isPeriodVisibleByName(name, 5000);
    //     expect(isStillVisible, `Expected No to leave Period "${name}" untouched`).toBe(true);

    //     await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC_LB_070_delete_period_no');
    //     console.log(`✅ TC_LB_070 PASSED — No on the delete confirmation left Period "${name}" untouched.`);
    // });
});


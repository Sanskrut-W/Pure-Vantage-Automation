// import { test, expect } from '../fixtures/baseFixture';
// import { CommonUtils } from '../utils/commonUtils';

// test.describe('Internal Notification Tests', () => {
//     test.beforeEach(async ({ page, sidebarPage, internalNotificationPage }) => {
//         await page.goto('/main/home');
//         await page.reload();
//         await sidebarPage.waitForPageLoad();

//         await sidebarPage.navigateToInternalNotifications();
//         await expect(page).toHaveURL(/.*internal-notification/);
//         await internalNotificationPage.waitForPageLoad();
//     });

//     test('TC1 - Verify Search field, Create Notification button and table action buttons are visible', async ({ internalNotificationPage }) => {
//         await expect(internalNotificationPage.searchInput).toBeVisible();
//         await expect(internalNotificationPage.createNotificationBtn).toBeVisible();
//         await expect(internalNotificationPage.editBtn.first()).toBeVisible({ timeout: 15000 });
//         await expect(internalNotificationPage.disableBtn.first()).toBeVisible({ timeout: 15000 });
//         await expect(internalNotificationPage.deleteBtn.first()).toBeVisible({ timeout: 15000 });
//     });

//     test('TC2 - Click Create Notification, fill form and save', async ({ internalNotificationPage }) => {
//         await internalNotificationPage.clickCreateNotification();
//         await expect(internalNotificationPage.messageInput).toBeVisible({ timeout: 10000 });

//         await internalNotificationPage.fillMessage('Test Internal Notification');
//         await internalNotificationPage.selectType('Info');
//         await internalNotificationPage.selectIcon();
//         await internalNotificationPage.selectStartDateToday();
//         await internalNotificationPage.selectEndDateFuture(5);

//         await internalNotificationPage.clickSave();
//     });

//     test('TC3 - Edit the recently created notification', async ({ internalNotificationPage }) => {
//         await internalNotificationPage.clickEditFirstNotification();
//         await expect(internalNotificationPage.messageInput).toBeVisible({ timeout: 10000 });

//         await internalNotificationPage.fillMessage('Test Internal Notification - Edited');
//         await internalNotificationPage.selectType('Success');
//         await internalNotificationPage.selectIcon();
//         await internalNotificationPage.clickSave();
//     });

//     test('TC4 - Disable the recently edited notification', async ({ internalNotificationPage }) => {
//         await internalNotificationPage.clickDisableFirstNotification();
//         await internalNotificationPage.confirmDelete();
//     });

//     test('TC5 - Verify isActive toggle is off in edit popup after disabling', async ({ page, internalNotificationPage }, testInfo) => {
//         await internalNotificationPage.clickEditFirstNotification();
//         await expect(internalNotificationPage.messageInput).toBeVisible({ timeout: 10000 });
//         await internalNotificationPage.verifyActiveToggleOff();
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_isActive_toggle_off');
//         await internalNotificationPage.page.keyboard.press('Escape');
//     });

//     test('TC6 - Search for the recently created notification and take a screenshot', async ({ page, internalNotificationPage }, testInfo) => {
//         await internalNotificationPage.searchNotification('Test Internal Notification - Edited');
//         await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_search_notification');
//     });

//     test('TC7 - Delete the first notification', async ({ internalNotificationPage }) => {
//         await internalNotificationPage.clickDeleteFirstNotification();
//         await internalNotificationPage.confirmDelete();
//     });
// });

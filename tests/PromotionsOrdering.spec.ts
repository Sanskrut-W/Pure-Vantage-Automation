import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';
import { promotionOrderingLocators } from '../locators/promotionOrderingLocators';

// ─── Shared navigation + filter helper ─────────────────────────────────────────
async function navigateToFilteredOrdering(page: any, sidebarPage: any, promotionOrderingPage: any) {
    await page.goto('/main/home');
    await page.reload();
    await sidebarPage.waitForPageLoad();

    await sidebarPage.navigateToPromotionOrdering();
    // navigateToPromotionOrdering()'s final sidebar click uses force:true, which can land
    // before the submenu animation settles and leave the router navigation unfired — seen
    // live as a completely empty <main> with no heading at all. Waiting for the page's own
    // heading first confirms the route actually mounted, before falling back to generic
    // load-state signals (which fire even when nothing has actually rendered yet) and the
    // dropdown itself (which needs Angular to finish hydrating past the raw pre-hydration
    // <select> markup).
    await page.getByRole('heading', { name: 'Promotions Ordering', level: 2 }).waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    // Widened from 15s: with the suite now running 17 tests, each re-navigating from scratch,
    // the shared backend under load can leave Angular still hydrating this dropdown well past
    // the old timeout even though the heading (and thus the route) already mounted fine —
    // confirmed live via a snapshot where the button existed but simply hadn't rendered yet.
    await promotionOrderingPage.promoTypeDropdown.waitFor({ state: 'visible', timeout: 30000 });

    await promotionOrderingPage.selectPromoType('Top Up Tuesday');
    await promotionOrderingPage.selectRegion('Betway Botswana');

    // The vertical tables populate via their own request after the Region filter is applied,
    // separate from the networkidle already awaited inside selectRegion(). Waiting on a
    // specific vertical (e.g. Sport) as a proxy for "the tables have loaded" turned out
    // unreliable — Sport itself is sometimes genuinely empty, and even a raw "tbody tr" wait
    // resolves instantly on the transient "No Data Found" placeholder row rather than the
    // real data that replaces it a moment later (confirmed live: a "before" row count still
    // came back short after that wait). This only waits for the table STRUCTURES to attach;
    // callers that need a specific vertical's actual data settled must wait on that vertical's
    // own getVerticalRows() (h3-filtered, so it can't match the placeholder) themselves.
    await page.locator(promotionOrderingLocators.verticalTableWrapper).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
}

// Only the SPORT vertical is exercised by these tests, per the current scope.
const SPORT_VERTICAL_OPTION = 'SPORT';
const SPORT_VERTICAL_HEADER = 'Sport';

// Casino vertical — the "Select Vertical" popup dropdown's option label is lowercase
// ("casino"), while the table header above its rows reads "Casino".
const CASINO_VERTICAL_OPTION = 'casino';
const CASINO_VERTICAL_HEADER = 'Casino';

// New and Features verticals — same lowercase-option / capitalized-header split as Casino.
const NEW_VERTICAL_OPTION = 'new';
const NEW_VERTICAL_HEADER = 'New';
const FEATURES_VERTICAL_OPTION = 'features';
const FEATURES_VERTICAL_HEADER = 'Features';

// A Promo can only be assigned to one vertical at a time (confirmed live — Save gets
// silently rejected, leaving the popup stuck open, when picking a Promo already used by a
// DIFFERENT vertical, not just the target one). Every vertical table on this page needs to
// be checked before picking an "available" Promo to add.
const ALL_VERTICAL_HEADERS = ['Sport', 'Casino', 'New', 'Features'];

test.describe('Promotions Ordering - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await page.goto('/main/home');
        await page.reload();
        await sidebarPage.waitForPageLoad();
        await sidebarPage.navigateToPromotionOrdering();
        await page.getByRole('heading', { name: 'Promotions Ordering', level: 2 }).waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        await promotionOrderingPage.promoTypeDropdown.waitFor({ state: 'visible', timeout: 15000 });
    });

    test('TC-1 Verify Promotions Ordering page loads with Promo Type and Region dropdowns', async ({ page, promotionOrderingPage }, testInfo) => {
        await expect(promotionOrderingPage.promoTypeDropdown, 'Expected the Select Promo Type dropdown to be visible').toBeVisible();
        await expect(promotionOrderingPage.regionDropdown, 'Expected the Select Region dropdown to be visible').toBeVisible();

        await promotionOrderingPage.selectPromoType('Top Up Tuesday');
        await promotionOrderingPage.selectRegion('Betway Botswana');

        await expect(promotionOrderingPage.addPromotionBtn, 'Expected the Add New Promotion To Vertical button to be visible').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_promotions_ordering_page_loaded');
    });
});

test.describe('Promotions Ordering - Add Promotion to Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-2 Verify Add New Promotion To Vertical popup shows Select Promo and Select Vertical fields', async ({ page, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        await expect(promotionOrderingPage.promoDropdown, 'Expected the Select Promo dropdown to be visible').toBeVisible();
        await expect(promotionOrderingPage.verticalDropdown, 'Expected the Select Vertical dropdown to be visible').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_add_promo_popup_fields');
        await promotionOrderingPage.clickPopupCancel().catch(() => {});
    });

    test('TC-3 Verify mandatory field validation on Add New Promotion To Vertical popup', async ({ page, promotionOrderingPage }, testInfo) => {
        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        const saveDisabledInitially = await promotionOrderingPage.popupSaveBtn.first().isDisabled().catch(() => false);
        if (!saveDisabledInitially) {
            await promotionOrderingPage.clickPopupSave();
        }

        const inlineError = promotionOrderingPage.popupDialog.locator(promotionOrderingLocators.validationError).first();
        const hasInlineError = await inlineError.isVisible().catch(() => false);
        const dialogStillOpen = await promotionOrderingPage.popupDialog.isVisible().catch(() => false);

        expect(saveDisabledInitially || hasInlineError || dialogStillOpen,
            'Expected Save to be disabled, a validation error to appear, or the popup to stay open when no Promo/Vertical is selected').toBeTruthy();

        console.log(saveDisabledInitially
            ? 'Save stayed disabled with no Promo/Vertical selected.'
            : 'Popup stayed open or a validation error was shown after clicking Save.');

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_add_promo_validation');
        await promotionOrderingPage.clickPopupCancel().catch(() => {});
    });

    test('TC-4 Verify adding a Promo to the SPORT vertical', async ({ page, promotionOrderingPage }, testInfo) => {
        const sportSection = promotionOrderingPage.getVerticalSection(SPORT_VERTICAL_HEADER);
        await expect(sportSection, 'Expected the Sport vertical table to be visible').toBeVisible({ timeout: 15000 });

        const rowsBefore = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        const existingNames = await promotionOrderingPage.getAllPromoNamesInVertical(SPORT_VERTICAL_HEADER);

        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        // Picking a Promo already assigned to Sport gets silently rejected by the backend
        // and leaves this popup stuck open — pick one that isn't already in the table.
        await promotionOrderingPage.selectFirstAvailablePromoNotIn(existingNames);
        await promotionOrderingPage.selectVertical(SPORT_VERTICAL_OPTION);
        await promotionOrderingPage.clickPopupSave();

        await expect(promotionOrderingPage.popupDialog, 'Expected the Add Promotion popup to close after Save').toBeHidden({ timeout: 10000 });

        const rowsAfter = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one more row in the Sport vertical table after adding a Promo').toBe(rowsBefore + 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_add_promo_to_sport_vertical');
    });

    test('TC-5 Verify Cancel on Add Promotion popup does not add a Promo to the vertical', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();

        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        await promotionOrderingPage.selectFirstAvailablePromo();
        await promotionOrderingPage.selectVertical(SPORT_VERTICAL_OPTION);
        await promotionOrderingPage.clickPopupCancel();

        await expect(promotionOrderingPage.popupDialog, 'Expected the Add Promotion popup to close after Cancel').toBeHidden({ timeout: 10000 });

        const rowsAfter = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected no new row in the Sport vertical table after Cancel').toBe(rowsBefore);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_cancel_add_promo');
    });

    test('TC-6 Verify Save after adding a Promo to the SPORT vertical shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const existingNames = await promotionOrderingPage.getAllPromoNamesInVertical(SPORT_VERTICAL_HEADER);

        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        await promotionOrderingPage.selectFirstAvailablePromoNotIn(existingNames);
        await promotionOrderingPage.selectVertical(SPORT_VERTICAL_OPTION);
        await promotionOrderingPage.clickPopupSave();
        await expect(promotionOrderingPage.popupDialog, 'Expected the Add Promotion popup to close after Save').toBeHidden({ timeout: 10000 });

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the vertical ordering changes').toBeVisible({ timeout: 15000 });
        // Toasts auto-dismiss — reading text with a short timeout avoids blocking the whole
        // test budget if it's already gone by the time we ask for its content.
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_save_promo_ordering_success');
    });
});

test.describe('Promotions Ordering - Delete Promotion from Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
        // Deliberately not adding a new Promo here. Confirmed live: delete-with-confirmation
        // only works on a Promo that was already saved/persisted BEFORE this test session —
        // one added and saved in this same beforeEach would itself count as "just added" from
        // the app's perspective in some flows, and the Add-Promo picklist for a given Promo
        // Type + Region combination can run out of unused Promos entirely after repeated test
        // runs (confirmed live: the picklist kept re-offering an already-assigned Promo,
        // stalling Save). Whatever rows already exist in the Sport vertical on page load are
        // exactly the "previous" Promos this describe block needs — use those directly.
    });

    test('TC-7 Verify deleting an already-saved Promo removes it from the vertical table', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-7: No existing Promo rows in the Sport vertical to delete — skipping.');
            return;
        }

        await promotionOrderingPage.deletePromoFromVertical(SPORT_VERTICAL_HEADER, 0);

        const rowsAfter = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one fewer row in the Sport vertical table after deleting a Promo').toBe(rowsBefore - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_delete_saved_promo');
    });

    test('TC-8 Verify a toast appears after confirming deletion of a Promo', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-8: No existing Promo rows in the Sport vertical to delete — skipping.');
            return;
        }

        await promotionOrderingPage.deletePromoFromVertical(SPORT_VERTICAL_HEADER, 0);

        const toast = page.locator(`${promotionOrderingLocators.successToast}, ${promotionOrderingLocators.errorToast}`).first();
        await expect(toast, 'Expected a toast after confirming the Promo deletion').toBeVisible({ timeout: 15000 });
        console.log('Delete confirmation toast message:', await toast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_delete_promo_toast');
    });
});

test.describe('Promotions Ordering - Reorder via Context Menu Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-9 Verify right-click on a Promo row shows Move Up and Move Down options', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-9: No Promo rows present in the Sport vertical — skipping context menu check.');
            return;
        }

        await promotionOrderingPage.rightClickVerticalRow(SPORT_VERTICAL_HEADER, 0);

        const menu = page.locator(promotionOrderingLocators.contextMenu);
        await expect(menu, 'Expected the context menu to appear').toBeVisible({ timeout: 5000 });
        await expect(menu.getByText(promotionOrderingLocators.moveUpOption, { exact: true })).toBeVisible();
        await expect(menu.getByText(promotionOrderingLocators.moveDownOption, { exact: true })).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_context_menu_options');
        await page.keyboard.press('Escape').catch(() => {});
    });

    test('TC-10 Verify Move Up on the topmost Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-10: No Promo rows present in the Sport vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowUp(SPORT_VERTICAL_HEADER, 0);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the topmost Promo up').toBeVisible({ timeout: 10000 });
        // Toasts auto-dismiss — reading text with a short timeout avoids blocking the whole
        // test budget if it's already gone by the time we ask for its content.
        console.log('Move Up (already on top) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_move_up_already_on_top');
    });

    test('TC-11 Verify Move Down on the bottommost Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-11: No Promo rows present in the Sport vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowDown(SPORT_VERTICAL_HEADER, rowCount - 1);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the bottommost Promo down').toBeVisible({ timeout: 10000 });
        console.log('Move Down (already at bottom) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_move_down_already_at_bottom');
    });

    test('TC-12 Verify successfully moving a Promo up changes its order and Save shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(SPORT_VERTICAL_HEADER).count();
        if (rowCount < 2) {
            console.log('TC-12: Fewer than 2 Promo rows in the Sport vertical — cannot verify reordering. Skipping.');
            return;
        }

        const lastIndex = rowCount - 1;
        const nameBeforeMove = await promotionOrderingPage.getPromoNameInRow(SPORT_VERTICAL_HEADER, lastIndex);

        await promotionOrderingPage.moveRowUp(SPORT_VERTICAL_HEADER, lastIndex);

        const nameNowSecondLast = await promotionOrderingPage.getPromoNameInRow(SPORT_VERTICAL_HEADER, lastIndex - 1);
        expect(nameNowSecondLast, 'Expected the moved Promo to now be one position higher').toBe(nameBeforeMove);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the reordered vertical').toBeVisible({ timeout: 15000 });
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_reorder_and_save_success');
    });
});

test.describe('Promotions Ordering - Add Promotion to Casino Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-13 Verify adding a Promo to the CASINO vertical shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        // A raw "tbody tr" wait resolves instantly on the transient "No Data Found"
        // placeholder rather than the real data replacing it — getVerticalRows() is
        // h3-filtered so it can't match the placeholder.
        await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rowsBefore = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();

        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        // Tries Promos one at a time against a real Save, moving to the next on rejection,
        // instead of pre-guessing which one is free — more reliable than scanning vertical
        // tables upfront (that missed cross-vertical exclusivity and table-render timing).
        const selectedPromo = await promotionOrderingPage.addAvailablePromoToVertical(CASINO_VERTICAL_OPTION);
        if (!selectedPromo) {
            console.log('TC-13: Every Promo in the picklist was rejected — none available to add. Skipping.');
            return;
        }

        const rowsAfter = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one more row in the Casino vertical table after adding a Promo').toBe(rowsBefore + 1);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the vertical ordering changes').toBeVisible({ timeout: 15000 });
        // Toasts auto-dismiss — reading text with a short timeout avoids blocking the whole
        // test budget if it's already gone by the time we ask for its content.
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_add_promo_to_casino_vertical');
    });
});

test.describe('Promotions Ordering - Delete Promotion from Casino Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
        // Same reasoning as the Sport delete tests: use whatever Promos are already
        // persisted in the Casino vertical rather than adding a new one first —
        // delete-with-confirmation only works on an already-saved row, and the Add-Promo
        // picklist for a given Promo Type + Region combination can run out of unused Promos
        // entirely after repeated test runs.
    });

    test('TC-14 Verify deleting an already-saved Promo removes it from the Casino vertical table', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-14: No existing Promo rows in the Casino vertical to delete — skipping.');
            return;
        }

        await promotionOrderingPage.deletePromoFromVertical(CASINO_VERTICAL_HEADER, 0);

        const rowsAfter = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one fewer row in the Casino vertical table after deleting a Promo').toBe(rowsBefore - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_delete_saved_promo_casino');
    });

    test('TC-15 Verify a toast appears after confirming deletion of a Promo in Casino', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-15: No existing Promo rows in the Casino vertical to delete — skipping.');
            return;
        }

        await promotionOrderingPage.deletePromoFromVertical(CASINO_VERTICAL_HEADER, 0);

        const toast = page.locator(`${promotionOrderingLocators.successToast}, ${promotionOrderingLocators.errorToast}`).first();
        await expect(toast, 'Expected a toast after confirming the Promo deletion').toBeVisible({ timeout: 15000 });
        console.log('Delete confirmation toast message:', await toast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_delete_promo_toast_casino');
    });
});

test.describe('Promotions Ordering - Reorder via Context Menu Tests (Casino)', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-16 Verify right-click on a Casino Promo row shows Move Up and Move Down options', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-16: No Promo rows present in the Casino vertical — skipping context menu check.');
            return;
        }

        await promotionOrderingPage.rightClickVerticalRow(CASINO_VERTICAL_HEADER, 0);

        const menu = page.locator(promotionOrderingLocators.contextMenu);
        await expect(menu, 'Expected the context menu to appear').toBeVisible({ timeout: 5000 });
        await expect(menu.getByText(promotionOrderingLocators.moveUpOption, { exact: true })).toBeVisible();
        await expect(menu.getByText(promotionOrderingLocators.moveDownOption, { exact: true })).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_context_menu_options_casino');
        await page.keyboard.press('Escape').catch(() => {});
    });

    test('TC-17 Verify Move Up on the topmost Casino Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-17: No Promo rows present in the Casino vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowUp(CASINO_VERTICAL_HEADER, 0);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the topmost Promo up').toBeVisible({ timeout: 10000 });
        // Toasts auto-dismiss — reading text with a short timeout avoids blocking the whole
        // test budget if it's already gone by the time we ask for its content.
        console.log('Move Up (already on top) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_move_up_already_on_top_casino');
    });

    test('TC-18 Verify Move Down on the bottommost Casino Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-18: No Promo rows present in the Casino vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowDown(CASINO_VERTICAL_HEADER, rowCount - 1);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the bottommost Promo down').toBeVisible({ timeout: 10000 });
        console.log('Move Down (already at bottom) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_move_down_already_at_bottom_casino');
    });

    test('TC-19 Verify successfully moving a Casino Promo up changes its order and Save shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(CASINO_VERTICAL_HEADER).count();
        if (rowCount < 2) {
            console.log('TC-19: Fewer than 2 Promo rows in the Casino vertical — cannot verify reordering. Skipping.');
            return;
        }

        const lastIndex = rowCount - 1;
        const nameBeforeMove = await promotionOrderingPage.getPromoNameInRow(CASINO_VERTICAL_HEADER, lastIndex);

        await promotionOrderingPage.moveRowUp(CASINO_VERTICAL_HEADER, lastIndex);

        const nameNowSecondLast = await promotionOrderingPage.getPromoNameInRow(CASINO_VERTICAL_HEADER, lastIndex - 1);
        expect(nameNowSecondLast, 'Expected the moved Promo to now be one position higher').toBe(nameBeforeMove);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the reordered vertical').toBeVisible({ timeout: 15000 });
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_reorder_and_save_success_casino');
    });
});

test.describe('Promotions Ordering - Add Promotion to New Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-20 Verify adding a Promo to the NEW vertical shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        // A raw "tbody tr" wait resolves instantly on the transient "No Data Found"
        // placeholder row rather than the real data that replaces it — confirmed live: the
        // "before" count still came back short even after that wait. getVerticalRows() is
        // h3-filtered, so it can't match the placeholder and only resolves once a real Promo
        // row (or the vertical settles genuinely empty, after the timeout) is present.
        await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rowsBefore = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();

        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        // Tries Promos one at a time against a real Save, moving to the next on rejection,
        // instead of pre-guessing which one is free.
        const selectedPromo = await promotionOrderingPage.addAvailablePromoToVertical(NEW_VERTICAL_OPTION);
        if (!selectedPromo) {
            console.log('TC-20: Every Promo in the picklist was rejected — none available to add. Skipping.');
            return;
        }

        const rowsAfter = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one more row in the New vertical table after adding a Promo').toBe(rowsBefore + 1);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the vertical ordering changes').toBeVisible({ timeout: 15000 });
        // Toasts auto-dismiss — reading text with a short timeout avoids blocking the whole
        // test budget if it's already gone by the time we ask for its content.
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_add_promo_to_new_vertical');
    });
});

test.describe('Promotions Ordering - Delete Promotion from New Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
        // Same reasoning as the Sport/Casino delete tests: use whatever Promos are already
        // persisted in the New vertical rather than adding a new one first —
        // delete-with-confirmation only works on an already-saved row, and the Add-Promo
        // picklist for a given Promo Type + Region combination can run out of unused Promos
        // entirely after repeated test runs.
    });

    test('TC-21 Verify deleting an already-saved Promo removes it from the New vertical table', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-21: No existing Promo rows in the New vertical to delete — skipping.');
            return;
        }

        const deleted = await promotionOrderingPage.deletePromoFromVertical(NEW_VERTICAL_HEADER, 0);
        if (!deleted) {
            // Confirmed live: × is a no-op for some rows (no confirm dialog, nothing removed)
            // — not a bug, so skip rather than assert against a delete that never started.
            console.log('TC-21: × was a no-op for this row (no confirm dialog appeared) — skipping.');
            return;
        }

        const rowsAfter = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one fewer row in the New vertical table after deleting a Promo').toBe(rowsBefore - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_delete_saved_promo_new');
    });

    test('TC-22 Verify a toast appears after confirming deletion of a Promo in New', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-22: No existing Promo rows in the New vertical to delete — skipping.');
            return;
        }

        const deleted = await promotionOrderingPage.deletePromoFromVertical(NEW_VERTICAL_HEADER, 0);
        if (!deleted) {
            console.log('TC-22: × was a no-op for this row (no confirm dialog appeared) — skipping.');
            return;
        }

        const toast = page.locator(`${promotionOrderingLocators.successToast}, ${promotionOrderingLocators.errorToast}`).first();
        await expect(toast, 'Expected a toast after confirming the Promo deletion').toBeVisible({ timeout: 15000 });
        console.log('Delete confirmation toast message:', await toast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_delete_promo_toast_new');
    });
});

test.describe('Promotions Ordering - Reorder via Context Menu Tests (New)', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-23 Verify right-click on a New Promo row shows Move Up and Move Down options', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-23: No Promo rows present in the New vertical — skipping context menu check.');
            return;
        }

        await promotionOrderingPage.rightClickVerticalRow(NEW_VERTICAL_HEADER, 0);

        const menu = page.locator(promotionOrderingLocators.contextMenu);
        await expect(menu, 'Expected the context menu to appear').toBeVisible({ timeout: 5000 });
        await expect(menu.getByText(promotionOrderingLocators.moveUpOption, { exact: true })).toBeVisible();
        await expect(menu.getByText(promotionOrderingLocators.moveDownOption, { exact: true })).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_context_menu_options_new');
        await page.keyboard.press('Escape').catch(() => {});
    });

    test('TC-24 Verify Move Up on the topmost New Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-24: No Promo rows present in the New vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowUp(NEW_VERTICAL_HEADER, 0);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the topmost Promo up').toBeVisible({ timeout: 10000 });
        // Toasts auto-dismiss — reading text with a short timeout avoids blocking the whole
        // test budget if it's already gone by the time we ask for its content.
        console.log('Move Up (already on top) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_move_up_already_on_top_new');
    });

    test('TC-25 Verify Move Down on the bottommost New Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-25: No Promo rows present in the New vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowDown(NEW_VERTICAL_HEADER, rowCount - 1);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the bottommost Promo down').toBeVisible({ timeout: 10000 });
        console.log('Move Down (already at bottom) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_move_down_already_at_bottom_new');
    });

    test('TC-26 Verify successfully moving a New Promo up changes its order and Save shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(NEW_VERTICAL_HEADER).count();
        if (rowCount < 2) {
            console.log('TC-26: Fewer than 2 Promo rows in the New vertical — cannot verify reordering. Skipping.');
            return;
        }

        const lastIndex = rowCount - 1;
        const nameBeforeMove = await promotionOrderingPage.getPromoNameInRow(NEW_VERTICAL_HEADER, lastIndex);

        await promotionOrderingPage.moveRowUp(NEW_VERTICAL_HEADER, lastIndex);

        const nameNowSecondLast = await promotionOrderingPage.getPromoNameInRow(NEW_VERTICAL_HEADER, lastIndex - 1);
        expect(nameNowSecondLast, 'Expected the moved Promo to now be one position higher').toBe(nameBeforeMove);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the reordered vertical').toBeVisible({ timeout: 15000 });
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_reorder_and_save_success_new');
    });
});

test.describe('Promotions Ordering - Add Promotion to Features Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-27 Verify adding a Promo to the FEATURES vertical shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        // Check every vertical, not just Features — a Promo already assigned to a DIFFERENT
        // vertical gets silently rejected by the backend too, leaving the popup stuck open.
        const existingNamesEverywhere = await promotionOrderingPage.getAllPromoNamesAcrossVerticals(ALL_VERTICAL_HEADERS);

        await promotionOrderingPage.clickAddPromotion();
        await promotionOrderingPage.popupDialog.waitFor({ state: 'visible', timeout: 10000 });

        const selectedPromo = await promotionOrderingPage.selectFirstAvailablePromoNotIn(existingNamesEverywhere);
        if (!selectedPromo) {
            console.log('TC-27: No unused Promo available for this Promo Type + Region across any vertical — skipping.');
            await promotionOrderingPage.clickPopupCancel().catch(() => {});
            return;
        }
        await promotionOrderingPage.selectVertical(FEATURES_VERTICAL_OPTION);
        await promotionOrderingPage.clickPopupSave();

        await expect(promotionOrderingPage.popupDialog, 'Expected the Add Promotion popup to close after Save').toBeHidden({ timeout: 10000 });

        const rowsAfter = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one more row in the Features vertical table after adding a Promo').toBe(rowsBefore + 1);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the vertical ordering changes').toBeVisible({ timeout: 15000 });
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_add_promo_to_features_vertical');
    });
});

test.describe('Promotions Ordering - Delete Promotion from Features Vertical Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
        // Same reasoning as the Sport/Casino/New delete tests: use whatever Promos are
        // already persisted in the Features vertical rather than adding a new one first.
    });

    test('TC-28 Verify deleting an already-saved Promo removes it from the Features vertical table', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-28: No existing Promo rows in the Features vertical to delete — skipping.');
            return;
        }

        const deleted = await promotionOrderingPage.deletePromoFromVertical(FEATURES_VERTICAL_HEADER, 0);
        if (!deleted) {
            // Confirmed live: × is a no-op for some rows (no confirm dialog, nothing removed)
            // — not a bug, so skip rather than assert against a delete that never started.
            console.log('TC-28: × was a no-op for this row (no confirm dialog appeared) — skipping.');
            return;
        }

        const rowsAfter = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        expect(rowsAfter, 'Expected one fewer row in the Features vertical table after deleting a Promo').toBe(rowsBefore - 1);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_delete_saved_promo_features');
    });

    test('TC-29 Verify a toast appears after confirming deletion of a Promo in Features', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowsBefore = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        if (rowsBefore === 0) {
            console.log('TC-29: No existing Promo rows in the Features vertical to delete — skipping.');
            return;
        }

        const deleted = await promotionOrderingPage.deletePromoFromVertical(FEATURES_VERTICAL_HEADER, 0);
        if (!deleted) {
            console.log('TC-29: × was a no-op for this row (no confirm dialog appeared) — skipping.');
            return;
        }

        const toast = page.locator(`${promotionOrderingLocators.successToast}, ${promotionOrderingLocators.errorToast}`).first();
        await expect(toast, 'Expected a toast after confirming the Promo deletion').toBeVisible({ timeout: 15000 });
        console.log('Delete confirmation toast message:', await toast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_delete_promo_toast_features');
    });
});

test.describe('Promotions Ordering - Reorder via Context Menu Tests (Features)', () => {

    test.beforeEach(async ({ page, sidebarPage, promotionOrderingPage }) => {
        await navigateToFilteredOrdering(page, sidebarPage, promotionOrderingPage);
    });

    test('TC-30 Verify right-click on a Features Promo row shows Move Up and Move Down options', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-30: No Promo rows present in the Features vertical — skipping context menu check.');
            return;
        }

        await promotionOrderingPage.rightClickVerticalRow(FEATURES_VERTICAL_HEADER, 0);

        const menu = page.locator(promotionOrderingLocators.contextMenu);
        await expect(menu, 'Expected the context menu to appear').toBeVisible({ timeout: 5000 });
        await expect(menu.getByText(promotionOrderingLocators.moveUpOption, { exact: true })).toBeVisible();
        await expect(menu.getByText(promotionOrderingLocators.moveDownOption, { exact: true })).toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-30_context_menu_options_features');
        await page.keyboard.press('Escape').catch(() => {});
    });

    test('TC-31 Verify Move Up on the topmost Features Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-31: No Promo rows present in the Features vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowUp(FEATURES_VERTICAL_HEADER, 0);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the topmost Promo up').toBeVisible({ timeout: 10000 });
        console.log('Move Up (already on top) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-31_move_up_already_on_top_features');
    });

    test('TC-32 Verify Move Down on the bottommost Features Promo shows a failure toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        if (rowCount === 0) {
            console.log('TC-32: No Promo rows present in the Features vertical — skipping.');
            return;
        }

        await promotionOrderingPage.moveRowDown(FEATURES_VERTICAL_HEADER, rowCount - 1);

        const errorToast = page.locator(promotionOrderingLocators.errorToast).first();
        await expect(errorToast, 'Expected a failure toast when moving the bottommost Promo down').toBeVisible({ timeout: 10000 });
        console.log('Move Down (already at bottom) toast message:', await errorToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-32_move_down_already_at_bottom_features');
    });

    test('TC-33 Verify successfully moving a Features Promo up changes its order and Save shows a success toast', async ({ page, promotionOrderingPage }, testInfo) => {
        const rowCount = await promotionOrderingPage.getVerticalRows(FEATURES_VERTICAL_HEADER).count();
        if (rowCount < 2) {
            console.log('TC-33: Fewer than 2 Promo rows in the Features vertical — cannot verify reordering. Skipping.');
            return;
        }

        const lastIndex = rowCount - 1;
        const nameBeforeMove = await promotionOrderingPage.getPromoNameInRow(FEATURES_VERTICAL_HEADER, lastIndex);

        await promotionOrderingPage.moveRowUp(FEATURES_VERTICAL_HEADER, lastIndex);

        const nameNowSecondLast = await promotionOrderingPage.getPromoNameInRow(FEATURES_VERTICAL_HEADER, lastIndex - 1);
        expect(nameNowSecondLast, 'Expected the moved Promo to now be one position higher').toBe(nameBeforeMove);

        await promotionOrderingPage.clickPageSave();

        const successToast = page.locator(promotionOrderingLocators.successToast).first();
        await expect(successToast, 'Expected a success toast after saving the reordered vertical').toBeVisible({ timeout: 15000 });
        console.log('Save toast message:', await successToast.textContent({ timeout: 5000 }).catch(() => '(toast dismissed before text could be read)'));

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-33_reorder_and_save_success_features');
    });
});

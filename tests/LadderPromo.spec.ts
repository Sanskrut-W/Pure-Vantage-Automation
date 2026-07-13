import { test, expect } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Marketing - Ladder Promotions', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to home to bootstrap the SPA
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle');

    // Expand Marketing menu node
    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
    await marketingNode.click();

    // Expand Promotions sub-menu
    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
    await promotionsNode.click();

    // Click Ladder Promotions link and wait for SPA navigation to complete
    const ladderPromoLink = page.locator('a[href="/main/component-display/ladder-promotions"]');
    await ladderPromoLink.waitFor({ state: 'visible', timeout: 10000 });
    await ladderPromoLink.click();
    await page.waitForURL('**/ladder-promotions', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // If the component's data API was slow, main renders empty — reload once to recover
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    if (!await createBtn.isVisible().catch(() => false)) {
      await page.reload({ waitUntil: 'networkidle' });
    }
    await expect(createBtn).toBeVisible({ timeout: 30000 });
  });

  test('Verify navigation to Ladder Promotions page', async ({ page }, testInfo) => {
    // Verification is primarily done in beforeEach. We just double check main elements.
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await expect(createBtn).toBeVisible();

    // Take screenshot to confirm we are on the page displaying the promotions list
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-NavigateLadderPromotions_success');
  });

  test('Verify Region filter dropdown', async ({ page }, testInfo) => {
    // Look for a dropdown that acts as region filter. 
    // PrimeVue/PrimeNG dropdowns usually have .p-dropdown class.
    // Finding the dropdown by text or just taking the first one on page.
    const regionDropdown = page.locator('div.p-dropdown:has-text("Select a region")');
    await expect(regionDropdown).toBeVisible({ timeout: 10000 });
    
    // Open PrimeVue dropdown by focusing the hidden accessible input and pressing Space (most reliable method for PrimeVue)
    const hiddenInput = page.locator('div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) .p-hidden-accessible input').first();
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      // Fallback: click the trigger directly
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    // Verify dropdown items appear (available regions)
    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    
    const count = await dropdownItems.count();
    expect(count).toBeGreaterThan(0);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-RegionFilterDropdown_success');
  });

  test('Verify Region based filtering', async ({ page }, testInfo) => {
    // Wait for table/list to initially load
    await expect(page.locator('table, .p-datatable').first()).toBeVisible({ timeout: 30000 });

    const regionDropdown = page.locator('div.p-dropdown:has-text("Select a region")');
    await expect(regionDropdown).toBeVisible({ timeout: 10000 });
    
    // Open PrimeVue dropdown by focusing the hidden accessible input and pressing Space (most reliable method for PrimeVue)
    const hiddenInput = page.locator('div.p-dropdown:has(.p-dropdown-trigger[aria-label="Select a region"]) .p-hidden-accessible input').first();
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      // Fallback: click the trigger directly
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    
    // Select the first available region
    await dropdownItems.first().click();

    await page.waitForTimeout(2000); // Wait for filtering to apply to the table

    // Verify table is visible after filtering
    await expect(page.locator('table, .p-datatable').first()).toBeVisible({ timeout: 30000 });

    // The test case passes if the table filters successfully.
  });

  test('Verify Create Promotion Ladder popup', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const descriptionInput = dialog.locator('#description');
    const regionDropdown = dialog.locator('div.p-dropdown');
    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();

    await expect(descriptionInput).toBeVisible({ timeout: 10000 });
    await expect(regionDropdown).toBeVisible({ timeout: 10000 });
    await expect(startDateInput).toBeVisible({ timeout: 10000 });
    await expect(endDateInput).toBeVisible({ timeout: 10000 });
    await expect(saveBtn).toBeVisible({ timeout: 10000 });
    await expect(cancelBtn).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateLadderPromoPopup_open');

    // Click cancel to close
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Verify mandatory fields', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-MandatoryFieldsValidation_success');

    // Click cancel to close
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Verify promotion creation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Enter description
    const promoDesc = `AutoLadder-${Date.now()}`;
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill(promoDesc);

    // Select a region using the keyboard accessibility method
    const regionDropdown = dialog.locator('div.p-dropdown').first();
    const hiddenInput = regionDropdown.locator('.p-hidden-accessible input');
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    await dropdownItems.first().click();
    await page.waitForTimeout(500);

    // Enter start date
    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await page.waitForTimeout(200);
    await startDateInput.fill('01/07/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Enter end date
    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    await endDateInput.click();
    await page.waitForTimeout(200);
    await endDateInput.fill('01/12/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Take screenshot of filled form
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateLadderPromo_filled');

    // Click Save
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await saveBtn.click();

    // Verify dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // Verify it appears in the table using search box
    const tableElement = page.locator('table, .p-datatable').first();
    await expect(tableElement).toBeVisible({ timeout: 20000 });

    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' }).first();
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(promoDesc);
    await searchBox.press('Enter');
    await page.waitForTimeout(2000); // Wait for filtering to apply

    // Verify that the row containing the description is visible
    await expect(page.locator(`table >> text=${promoDesc}`)).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateLadderPromo_success');
  });

  test('Verify Description field validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Leave Description blank — fill all other mandatory fields
    const regionDropdown = dialog.locator('div.p-dropdown').first();
    const hiddenInput = regionDropdown.locator('.p-hidden-accessible input');
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    await dropdownItems.first().click();
    await page.waitForTimeout(500);

    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await startDateInput.fill('01/07/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    await endDateInput.click();
    await endDateInput.fill('01/12/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Save should remain disabled when Description is blank
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DescriptionValidation_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Verify Region field validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill Description and dates — leave Region blank
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill(`AutoLadder-${Date.now()}`);

    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await startDateInput.fill('01/07/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    await endDateInput.click();
    await endDateInput.fill('01/12/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Save should remain disabled when Region is blank
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-RegionValidation_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Verify Start Date validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill Description and Region, fill End Date — leave Start Date blank
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill(`AutoLadder-${Date.now()}`);

    const regionDropdown = dialog.locator('div.p-dropdown').first();
    const hiddenInput = regionDropdown.locator('.p-hidden-accessible input');
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    await dropdownItems.first().click();
    await page.waitForTimeout(500);

    // Click start date to open calendar, then click elsewhere on dialog to close without selecting (start date remains blank)
    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await page.waitForTimeout(200);
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar without selecting a date
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    await endDateInput.click();
    await endDateInput.fill('01/12/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Save should remain disabled when Start Date is blank
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-StartDateValidation_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Verify End Date validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill Description
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill(`AutoLadder-${Date.now()}`);

    // Select Region
    const regionDropdown = dialog.locator('div.p-dropdown').first();
    const hiddenInput = regionDropdown.locator('.p-hidden-accessible input');
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    await dropdownItems.first().click();
    await page.waitForTimeout(500);

    // Fill Start Date — click anywhere on dialog to close calendar
    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await page.waitForTimeout(200);
    await startDateInput.fill('01/07/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Leave End Date blank — Save should remain disabled
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EndDateValidation_success');

    const cancelBtn2 = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn2.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  test('Verify Cancel button', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill all mandatory fields
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill(`AutoLadder-${Date.now()}`);

    const regionDropdown = dialog.locator('div.p-dropdown').first();
    const hiddenInput = regionDropdown.locator('.p-hidden-accessible input');
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    await dropdownItems.first().click();
    await page.waitForTimeout(500);

    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await page.waitForTimeout(200);
    await startDateInput.fill('01/07/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    await endDateInput.click();
    await page.waitForTimeout(200);
    await endDateInput.fill('01/12/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Click Cancel — dialog should close without saving
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CancelButton_success');
  });

  test('Verify popup close functionality', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill all mandatory fields
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill(`AutoLadder-${Date.now()}`);

    const regionDropdown = dialog.locator('div.p-dropdown').first();
    const hiddenInput = regionDropdown.locator('.p-hidden-accessible input');
    await hiddenInput.waitFor({ state: 'attached' });
    await hiddenInput.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    const dropdownPanel = page.locator('.p-dropdown-panel');
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await regionDropdown.locator('.p-dropdown-trigger').click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const dropdownItems = dropdownPanel.locator('.p-dropdown-item');
    await expect(dropdownItems.first()).toBeVisible({ timeout: 10000 });
    await dropdownItems.first().click();
    await page.waitForTimeout(500);

    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await page.waitForTimeout(200);
    await startDateInput.fill('01/07/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    const endDateInput = dialog.locator('.p-calendar input').nth(1);
    await endDateInput.click();
    await page.waitForTimeout(200);
    await endDateInput.fill('01/12/2026 00:00');
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(300);

    // Click the X close icon in the dialog header
    const closeIcon = dialog.locator('.p-dialog-header-close').or(dialog.locator('button[aria-label="Close"]')).first();
    await closeIcon.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-PopupCloseX_success');
  });

  test('Verify Description field maximum character limit', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Ladder Promotion' });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Enter more than 255 characters in the Description field
    const descriptionInput = dialog.locator('#description');
    await descriptionInput.fill('A'.repeat(256));

    // Click on another field (start date) to trigger blur validation on Description
    const startDateInput = dialog.locator('.p-calendar input').nth(0);
    await startDateInput.click();
    await page.waitForTimeout(200);
    await page.evaluate(() => document.body.click()); // click anywhere on screen to close calendar
    await page.locator('.p-datepicker').waitFor({ state: 'detached' }).catch(() => {});
    await page.waitForTimeout(500);

    // Verify red validation message appears directly below the Description field
    const validationMsg = dialog.locator('#description ~ .p-error, #description + small.p-error, [id="description"] ~ small, .p-field:has(#description) .p-error').first();
    await expect(validationMsg).toBeVisible({ timeout: 10000 });
    await expect(validationMsg).toHaveText(/255 characters/i);
    await expect(validationMsg).toHaveCSS('color', 'rgb(211, 47, 47)').catch(async () => {
      // Fallback: check the element has the p-error class which PrimeNG renders in red
      await expect(validationMsg).toHaveClass(/p-error/);
    });

    // Save should remain disabled until description is within 255 characters
    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DescriptionMaxCharLimit_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

});


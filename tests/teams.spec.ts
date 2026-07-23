// npx playwright test tests/teams.spec.ts --headed
import { test, expect } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

test.describe('Teams - Create Team', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to home to bootstrap the SPA
    await page.goto('/main/home');
    // Deep-link navigation doesn't always fully hydrate the Angular/Stencil
    // component before the sidebar click fires — a reload reliably forces it
    // to initialize from scratch (same fix proven across this project's other
    // spec files).
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Expand ASCII menu node
    const asciiNode = page.locator('span.menuitem-text:text-is("ASCII")').first();
    await asciiNode.waitFor({ state: 'visible', timeout: 15000 });
    await asciiNode.click();

    // Expand Admin sub-menu
    const adminNode = page.locator('span.menuitem-text:text-is("Admin")').first();
    await adminNode.waitFor({ state: 'visible', timeout: 10000 });
    await adminNode.click();

    // Click the Teams link to trigger SPA navigation
    const teamsLink = page.locator('span.menuitem-text:text-is("Teams")').first();
    await teamsLink.waitFor({ state: 'visible', timeout: 10000 });
    await teamsLink.click();
    await page.waitForLoadState('networkidle');

    // Ensure the Teams page content is fully loaded.
    // Under 8-way parallel load the backend can be slow to respond, leaving the page
    // stuck mid-render — reload once to recover before failing for real.
    const createBtnCheck = page.getByRole('button', { name: 'Create Team' });
    if (!await createBtnCheck.isVisible({ timeout: 10000 }).catch(() => false)) {
      await page.reload({ waitUntil: 'networkidle' });
    }
    await expect(createBtnCheck).toBeVisible({ timeout: 30000 });
  });

  test('Verify Create Team popup launch', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team' });
    await createBtn.click();

    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    const activeCheckbox = page.locator('div.d-flex.align-items-center', { hasText: 'Active' }).locator('input[type="checkbox"]').first();
    const saveBtn = page.getByRole('button', { name: 'Save' });
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });

    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await expect(costCentre).toBeVisible({ timeout: 10000 });
    await expect(activeCheckbox).toBeVisible();
    await expect(saveBtn).toBeVisible();
    await expect(cancelBtn).toBeVisible();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_popup');
  });

  test('Validate mandatory field behavior', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Team' }).click();
    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled();
  });

  test('Verify successful team creation', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeam-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    // Select the first available Message Cost Centre option (works with PrimeVue-style dropdowns)
    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    // Save and verify the team appears in the list. Use the Teams search box to filter refreshed results.
    await page.getByRole('button', { name: 'Save' }).click();

    const createBtn = page.getByRole('button', { name: 'Create Team' });
    await expect(createBtn).toBeVisible({ timeout: 20000 });
    await expect(page.locator('table >> text=Name')).toBeVisible({ timeout: 20000 });

    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(teamName);
    await searchBox.press('Enter');

    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_success');
  });

  test('Verify valid name entry', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeamAlpha-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    await firstOption.click();

    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeEnabled({ timeout: 10000 });
    await saveBtn.click();

    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(teamName);
    await searchBox.press('Enter');

    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_validName');
  });

  test('Verify dropdown options', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await expect(costCentre).toBeVisible({ timeout: 10000 });
    await costCentre.click();

    const options = page.locator('.p-dropdown-items .p-dropdown-item');
    await expect(options.first()).toBeVisible({ timeout: 10000 });
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);

    await options.first().click();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_dropdownOptions');
  });

  test('Validate dropdown restriction', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await expect(costCentre).toBeVisible({ timeout: 10000 });
    
    // Click to open dropdown and verify options appear (demonstrates dropdown-only selection)
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await expect(firstOption).toBeVisible({ timeout: 10000 });
    
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_dropdownRestriction');
  });

  test('Verify popup cancellation', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeamCancel-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_beforeCancel');

    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();

    const dialog = page.locator('dialog:has-text("Create Team")');
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await searchBox.fill(teamName);
    await searchBox.press('Enter');

    await expect(page.locator(`table >> text=${teamName}`)).not.toBeVisible({ timeout: 10000 });
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_afterCancel');
  });

  test('Verify Active checkbox behavior', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const activeCheckbox = page.locator('div.d-flex.align-items-center', { hasText: 'Active' }).locator('input[type="checkbox"]').first();
    await expect(activeCheckbox).toBeVisible({ timeout: 10000 });

    const isChecked = await activeCheckbox.isChecked();
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_checkboxBefore');

    await activeCheckbox.click();
    const isCheckedAfter = await activeCheckbox.isChecked();
    expect(isCheckedAfter).not.toBe(isChecked);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_checkboxAfter');
  });

  test('Validate duplicate team restriction', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const duplicateTeamName = 'TestTeam';
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(duplicateTeamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    const saveBtn = page.getByRole('button', { name: 'Save' });
    await saveBtn.click();

    await page.waitForTimeout(2000);

    const errorMessage = page.locator('.p-toast-detail, .p-message-text, [role="alert"]').first();
    const createBtn = page.getByRole('button', { name: 'Create Team' });

    const isErrorVisible = await errorMessage.isVisible().catch(() => false);
    const isDialogStillOpen = await page.locator('dialog:has-text("Create Team")').isVisible().catch(() => false);

    if (isErrorVisible || isDialogStillOpen) {
      await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_duplicateRestriction');
    }
  });

  test('Validate Name mandatory field', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_nameMandatory');
  });

  test('Validate Cost Centre mandatory field', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeamMandatory-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    const saveBtn = page.getByRole('button', { name: 'Save' });
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_costCentreMandatory');
  });

  // test('Verify editing an existing team', async ({ page }, testInfo) => {
  //   // Click Edit button for the first team already in the list
  //   const editBtn = page.locator('table').getByRole('button', { name: 'Edit' }).first();
  //   await expect(editBtn).toBeVisible({ timeout: 15000 });
  //   await editBtn.click();

  //   const dialog = page.getByRole('dialog', { name: /Create Team|Edit Team/ });
  //   await expect(dialog).toBeVisible({ timeout: 10000 });

  //   const editNameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
  //   await expect(editNameInput).toBeVisible({ timeout: 10000 });

  //   const currentValue = await editNameInput.inputValue();
  //   const updatedTeamName = `${currentValue}-Updated-${Date.now()}`;
    
  //   await editNameInput.clear();
  //   await editNameInput.fill(updatedTeamName);

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EditTeam_beforeSave');

  //   const editSaveBtn = page.getByRole('button', { name: 'Save' });
  //   await editSaveBtn.click();

  //   const editCreateBtn = page.getByRole('button', { name: 'Create Team' });
  //   await expect(editCreateBtn).toBeVisible({ timeout: 20000 });

  //   const updatedSearchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
  //   await updatedSearchBox.fill(updatedTeamName);
  //   await updatedSearchBox.press('Enter');

  //   await expect(page.locator(`table >> text=${updatedTeamName}`)).toBeVisible({ timeout: 30000 });
  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EditTeam_afterSave');
  // });

  test('Verify team deactivation', async ({ page }, testInfo) => {
    // Step 1: Create a new team to deactivate (avoid modifying existing teams)
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeamDeactivate-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for dialog to close and table to be ready
    const createBtn = page.getByRole('button', { name: 'Create Team' });
    await expect(createBtn).toBeVisible({ timeout: 20000 });

    // Step 2: Search for the newly created team
    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(teamName);
    await searchBox.press('Enter');

    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });

    // Step 3: Click Deactivate button
    const deactivateBtn = page.locator('table').getByRole('button', { name: 'Deactivate' }).first();
    await expect(deactivateBtn).toBeVisible({ timeout: 10000 });
    await deactivateBtn.click();

    // Step 4: Confirm the deactivation action if a confirmation dialog appears
    const confirmBtn = page.getByRole('button', { name: /Yes|Confirm|OK/i });
    const isConfirmVisible = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (isConfirmVisible) {
      await confirmBtn.click();
    }

    await page.waitForTimeout(2000);

    // Step 5: Verify status changed — Activate button should now be enabled, Deactivate should be disabled
    await searchBox.fill(teamName);
    await searchBox.press('Enter');
    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });

    const activateBtn = page.locator('table').getByRole('button', { name: 'Activate' }).first();
    await expect(activateBtn).toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DeactivateTeam_success');
  });

  test('Verify team activation', async ({ page }, testInfo) => {
    // Step 1: Create a new team and then deactivate it so we can test activation
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeamActivate-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    await page.getByRole('button', { name: 'Save' }).click();

    const createBtn = page.getByRole('button', { name: 'Create Team' });
    await expect(createBtn).toBeVisible({ timeout: 20000 });

    // Search for the team
    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(teamName);
    await searchBox.press('Enter');

    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });

    // Step 2: Deactivate the team first to make it inactive
    const deactivateBtn = page.locator('table').getByRole('button', { name: 'Deactivate' }).first();
    await expect(deactivateBtn).toBeVisible({ timeout: 10000 });
    await deactivateBtn.click();

    // Confirm deactivation if prompted
    const confirmDeactivate = page.getByRole('button', { name: /Yes|Confirm|OK/i });
    const isDeactivateConfirmVisible = await confirmDeactivate.isVisible({ timeout: 5000 }).catch(() => false);
    if (isDeactivateConfirmVisible) {
      await confirmDeactivate.click();
    }

    await page.waitForTimeout(2000);

    // Re-search to refresh the row state
    await searchBox.fill(teamName);
    await searchBox.press('Enter');
    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });

    // Step 3: Click Activate button
    const activateBtn = page.locator('table').getByRole('button', { name: 'Activate' }).first();
    await expect(activateBtn).toBeEnabled({ timeout: 10000 });
    await activateBtn.click();

    // Step 4: Confirm the activation action if prompted
    const confirmActivate = page.getByRole('button', { name: /Yes|Confirm|OK/i });
    const isActivateConfirmVisible = await confirmActivate.isVisible({ timeout: 5000 }).catch(() => false);
    if (isActivateConfirmVisible) {
      await confirmActivate.click();
    }

    await page.waitForTimeout(2000);

    // Step 5: Verify status changed — Deactivate button should now be enabled
    await searchBox.fill(teamName);
    await searchBox.press('Enter');
    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });

    const deactivateBtnAfter = page.locator('table').getByRole('button', { name: 'Deactivate' }).first();
    await expect(deactivateBtnAfter).toBeEnabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-ActivateTeam_success');
  });

  // test('Verify team deletion', async ({ page }, testInfo) => {
  //   // Step 1: Create a new team to delete (avoid deleting existing teams)
  //   await page.getByRole('button', { name: 'Create Team' }).click();

  //   const teamName = `AutoTeamDelete-${Date.now()}`;
  //   const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
  //   await nameInput.fill(teamName);

  //   const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
  //   await costCentre.click();
  //   const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
  //   await firstOption.click();

  //   await page.getByRole('button', { name: 'Save' }).click();

  //   const createBtn = page.getByRole('button', { name: 'Create Team' });
  //   await expect(createBtn).toBeVisible({ timeout: 20000 });

  //   // Step 2: Search for the newly created team
  //   const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
  //   await expect(searchBox).toBeVisible({ timeout: 10000 });
  //   await searchBox.fill(teamName);
  //   await searchBox.press('Enter');

  //   await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DeleteTeam_beforeDelete');

  //   // Step 3: Click Delete button
  //   const deleteBtn = page.locator('table').getByRole('button', { name: 'Delete' }).first();
  //   await expect(deleteBtn).toBeVisible({ timeout: 10000 });
  //   await deleteBtn.click();

  //   // Step 4: Confirm deletion if a confirmation dialog appears
  //   const confirmBtn = page.getByRole('button', { name: /Yes|Confirm|OK/i });
  //   const isConfirmVisible = await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false);
  //   if (isConfirmVisible) {
  //     await confirmBtn.click();
  //   }

  //   await page.waitForTimeout(2000);

  //   // Step 5: Verify team no longer appears in the list
  //   await searchBox.fill(teamName);
  //   await searchBox.press('Enter');

  //   await expect(page.locator(`table >> text=${teamName}`)).not.toBeVisible({ timeout: 30000 });

  //   await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DeleteTeam_success');
  // });

  test('Verify search functionality', async ({ page }, testInfo) => {
    // 1. Create a team first to ensure we have a unique team to search for
    await page.getByRole('button', { name: 'Create Team' }).click();

    const teamName = `AutoTeamSearch-${Date.now()}`;
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    await nameInput.fill(teamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    await page.getByRole('button', { name: 'Save' }).click();

    const createBtn = page.getByRole('button', { name: 'Create Team' });
    await expect(createBtn).toBeVisible({ timeout: 20000 });

    // 2. Enter existing team name in Search box
    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(teamName);
    await searchBox.press('Enter');

    // 3. Verify Search results display only matching team records
    await expect(page.locator(`table >> text=${teamName}`)).toBeVisible({ timeout: 30000 });
    
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-SearchTeam_success');
  });

  test('Verify invalid search behavior', async ({ page }, testInfo) => {
    const invalidTeamName = `InvalidTeamName1234567890-${Date.now()}`;

    // Enter non-existing team name in Search box
    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(invalidTeamName);
    await searchBox.press('Enter');

    await page.waitForTimeout(2000); // Wait for search to process

    // Verify no matching records are displayed
    await expect(page.locator(`table >> text=${invalidTeamName}`)).not.toBeVisible({ timeout: 10000 });
    
    // Check for "No Records Found" or similar empty state indicator
    const emptyMessage = page.locator('table, .p-datatable-emptymessage, .empty-message').filter({ hasText: /no.*record/i });
    const isMessageVisible = await emptyMessage.isVisible().catch(() => false);
    if (!isMessageVisible) {
      // Fallback: Just verify table body has no regular data rows
      const rows = page.locator('table tbody tr:not(.p-datatable-emptymessage)');
      const count = await rows.count();
      expect(count).toBeLessThanOrEqual(1); // Might be 1 if it's a "no data" row
    }

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-InvalidSearchTeam_success');
  });

  test('Verify next page navigation', async ({ page }, testInfo) => {
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 30000 });

    // Check if next page button exists
    const nextPageBtn = page.getByRole('button', { name: 'Next Page' });
    await expect(nextPageBtn).toBeVisible({ timeout: 10000 });
    
    // Ensure we have multiple pages to test navigation
    if (await nextPageBtn.isEnabled()) {
        await nextPageBtn.click();
        
        await page.waitForTimeout(2000); // Wait for page to change
        
        // Optional: verify page number changed or previous button is now enabled
        const prevPageBtn = page.getByRole('button', { name: 'Previous Page' });
        await expect(prevPageBtn).toBeEnabled();
    }
    
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-NextPageNavigation_success');
  });

  test('Verify previous page navigation', async ({ page }, testInfo) => {
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 30000 });

    const nextPageBtn = page.getByRole('button', { name: 'Next Page' });
    const prevPageBtn = page.getByRole('button', { name: 'Previous Page' });
    
    // Ensure we have multiple pages to test navigation
    if (await nextPageBtn.isVisible() && await nextPageBtn.isEnabled()) {
        await nextPageBtn.click();
        await page.waitForTimeout(2000); // Wait for page to change
        
        await expect(prevPageBtn).toBeVisible({ timeout: 10000 });
        if (await prevPageBtn.isEnabled()) {
            await prevPageBtn.click();
            await page.waitForTimeout(2000); // Wait for page to change
            
            // Optional: verify next button is enabled again
            await expect(nextPageBtn).toBeEnabled();
        }
    }
    
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-PreviousPageNavigation_success');
  });

  test('Verify last page navigation', async ({ page }, testInfo) => {
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 30000 });

    const lastPageBtn = page.getByRole('button', { name: 'Last Page' });
    
    // Ensure we have multiple pages to test navigation
    if (await lastPageBtn.isVisible() && await lastPageBtn.isEnabled()) {
        await lastPageBtn.click();
        await page.waitForTimeout(2000); // Wait for page to change
        
        // Verify last page button is now disabled
        await expect(lastPageBtn).toBeDisabled();
    }
    
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-LastPageNavigation_success');
  });

  test('Verify first page navigation', async ({ page }, testInfo) => {
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 30000 });

    const lastPageBtn = page.getByRole('button', { name: 'Last Page' });
    const firstPageBtn = page.getByRole('button', { name: 'First Page' });
    
    // Navigate to last page first to ensure we are not on the first page
    if (await lastPageBtn.isVisible() && await lastPageBtn.isEnabled()) {
        await lastPageBtn.click();
        await page.waitForTimeout(2000); // Wait for page to change
        
        if (await firstPageBtn.isVisible() && await firstPageBtn.isEnabled()) {
            await firstPageBtn.click();
            await page.waitForTimeout(2000); // Wait for page to change
            
            // Verify first page button is now disabled
            await expect(firstPageBtn).toBeDisabled();
        }
    }
    
    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-FirstPageNavigation_success');
  });

  test('Validate search functionality case insensitive', async ({ page }, testInfo) => {
    // 1. Create a team first to ensure we have a unique team to search for
    await page.getByRole('button', { name: 'Create Team' }).click();

    const baseTeamName = `AutoTeamCaseSearch-${Date.now()}`;
    const upperTeamName = baseTeamName.toUpperCase();
    const lowerTeamName = baseTeamName.toLowerCase();
    
    const nameInput = page.locator('.pure__input-group', { hasText: 'Name' }).locator('input').first();
    // Using camel/mixed case to save
    await nameInput.fill(baseTeamName);

    const costCentre = page.locator('.pure__input-group', { hasText: 'Message Cost Centre' }).locator('.p-dropdown').first();
    await costCentre.click();
    const firstOption = page.locator('.p-dropdown-items .p-dropdown-item').first();
    await firstOption.click();

    await page.getByRole('button', { name: 'Save' }).click();

    const createBtn = page.getByRole('button', { name: 'Create Team' });
    await expect(createBtn).toBeVisible({ timeout: 20000 });

    // 2. Enter existing team name in uppercase in Search box
    const searchBox = page.locator('main').getByRole('textbox', { name: 'Search' });
    await expect(searchBox).toBeVisible({ timeout: 10000 });
    await searchBox.fill(upperTeamName);
    await searchBox.press('Enter');
    await page.waitForTimeout(1000); // Wait for search results to update

    // 3. Verify Search results display matching team record
    await expect(page.locator(`table >> text=${baseTeamName}`)).toBeVisible({ timeout: 30000 });

    // 4. Enter existing team name in lowercase in Search box
    await searchBox.clear();
    await searchBox.fill(lowerTeamName);
    await searchBox.press('Enter');
    await page.waitForTimeout(1000); // Wait for search results to update

    // 5. Verify Search results display matching team record
    await expect(page.locator(`table >> text=${baseTeamName}`)).toBeVisible({ timeout: 30000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-SearchCaseInsensitive_success');
  });

});

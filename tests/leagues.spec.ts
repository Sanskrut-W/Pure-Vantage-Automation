import { test, expect } from '@playwright/test';
import { CommonUtils } from '../utils/commonUtils';

// ─────────────────────────────────────────────────────────────────────────────
// LEAGUES  (TC1 – TC11)
// Navigation: Marketing → Promotions → Generic Predictor → View Leagues button
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Generic Predictor Leagues', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/main/home');
    // Deep-link navigation doesn't always fully hydrate the Angular/Stencil
    // component before the sidebar click fires — a reload reliably forces it
    // to initialize from scratch (same fix proven across this project's other
    // spec files).
    await page.reload();
    await page.waitForLoadState('networkidle');

    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
    await marketingNode.click();

    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
    await promotionsNode.click();

    // Generic Predictor link lands on the Promotions list page; leagues are behind "View Leagues"
    const genericPredictorLink = page.locator('span.menuitem-text:text-is("Generic Predictor")').first();
    await genericPredictorLink.waitFor({ state: 'visible', timeout: 10000 });
    await genericPredictorLink.click();
    await page.waitForURL('**/generic-predictor', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Click "View Leagues" — button may be CSS-hidden while Angular initialises.
    // Force-click once attached; if Angular navigation didn't fire (force on hidden = no-op),
    // wait for the button to become truly visible and click normally as a fallback.
    const viewLeaguesBtn = page.getByRole('button', { name: 'View Leagues' }).first();
    await viewLeaguesBtn.waitFor({ state: 'attached', timeout: 30000 });
    await viewLeaguesBtn.click({ force: true });
    await page.waitForTimeout(1000);

    if (!await page.locator('generic-predictor-leagues.hydrated').isVisible().catch(() => false)) {
      await viewLeaguesBtn.waitFor({ state: 'visible', timeout: 20000 });
      await viewLeaguesBtn.click();
    }
    await page.waitForLoadState('networkidle');

    // Wait for the leagues Stencil component to finish hydrating and expose its buttons
    await page.waitForSelector('generic-predictor-leagues.hydrated', { timeout: 30000 });
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await expect(createBtn).toBeVisible({ timeout: 30000 });
  });

  // TC1
  test('Verify navigation to Generic Predictor Leagues page', async ({ page }, testInfo) => {
    await expect(page.locator('table, .p-datatable').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.p-column-title:text-is("League Name")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.p-column-title:text-is("Country")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.p-column-title:text-is("Sport")')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-LeaguesNavigation_success');
  });

  // TC2
  test('Verify Create League popup', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const leagueNameInput = dialog.locator('#leagueName');
    const sportDropdown    = dialog.locator('#sport');
    const countryDropdown  = dialog.locator('#country');
    const saveBtn   = dialog.getByRole('button', { name: 'Save',   exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();

    await expect(leagueNameInput).toBeVisible({ timeout: 10000 });
    await expect(countryDropdown).toBeVisible({ timeout: 10000 });
    await expect(sportDropdown).toBeVisible({ timeout: 10000 });
    await expect(saveBtn).toBeVisible({ timeout: 10000 });
    await expect(cancelBtn).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateLeaguePopup_open');

    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC3
  test('Verify mandatory fields', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-LeagueMandatoryFields_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC4
  test('Verify league creation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const leagueName = `AutoLeague-${Date.now()}`;
    const leagueNameInput = dialog.locator('#leagueName');
    await leagueNameInput.fill(leagueName);

    const sportDropdown   = dialog.locator('#sport');
    const countryDropdown = dialog.locator('#country');
    const dropdownPanel   = page.locator('.p-dropdown-panel');

    // Select Sport
    await sportDropdown.click();
    await page.waitForTimeout(300);
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await sportDropdown.locator('.p-dropdown-trigger').click({ force: true });
      await page.waitForTimeout(300);
    }
    await expect(dropdownPanel.locator('.p-dropdown-item').first()).toBeVisible({ timeout: 10000 });
    await dropdownPanel.locator('.p-dropdown-item').first().click();
    await page.waitForTimeout(300);

    // Select Country — dropdown may be slow to populate; allow extra time
    await countryDropdown.click();
    await page.waitForTimeout(1000);
    if (!await dropdownPanel.isVisible().catch(() => false)) {
      await countryDropdown.locator('.p-dropdown-trigger').click({ force: true });
      await page.waitForTimeout(1000);
    }
    await expect(dropdownPanel.locator('.p-dropdown-item').first()).toBeVisible({ timeout: 30000 });
    await dropdownPanel.locator('.p-dropdown-item').first().click();
    await page.waitForTimeout(500);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateLeague_filled');

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await saveBtn.click();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText).toBeVisible({ timeout: 10000 });
    await expect(toastText).toContainText(/success/i);

    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`text=${leagueName}`)).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateLeague_success');
  });

  // TC5
  test('Verify Country field restriction', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const countryDropdown = dialog.locator('#country');
    await countryDropdown.click();
    await page.waitForTimeout(300);

    // Attempt manual typing — PrimeNG standard dropdown does not allow free-text entry
    await page.keyboard.type('TestCountry');
    await page.waitForTimeout(300);

    const labelText = await countryDropdown.locator('.p-dropdown-label').textContent();
    expect(labelText?.trim()).not.toBe('TestCountry');

    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(200);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CountryFieldRestriction_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC6
  test('Verify Sport field restriction', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const sportDropdown = dialog.locator('#sport');
    await sportDropdown.click();
    await page.waitForTimeout(300);

    await page.keyboard.type('TestSport');
    await page.waitForTimeout(300);

    const labelText = await sportDropdown.locator('.p-dropdown-label').textContent();
    expect(labelText?.trim()).not.toBe('TestSport');

    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(200);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-SportFieldRestriction_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC7
  test('Verify League Name character limit', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create League', exact: true }).or(page.locator('button[aria-label="Create League"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const leagueNameInput = dialog.locator('#leagueName');
    await leagueNameInput.fill('A'.repeat(101));

    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(500);

    await expect(dialog.locator('text=Field must be at most 100 characters long')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-LeagueNameCharLimit_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC8
  test('Verify Edit League', async ({ page }, testInfo) => {
    const editBtn = page.getByRole('button', { name: 'Edit', exact: true }).or(page.locator('button[aria-label="Edit"]')).first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const leagueNameInput = dialog.locator('input').first();
    await leagueNameInput.clear();
    await leagueNameInput.fill(`AutoLeague-Edited-${Date.now()}`);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EditLeague_filled');

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EditLeague_success');
  });

  // TC9
  test('Verify Delete League', async ({ page }, testInfo) => {
    const rows = page.locator('.p-datatable-tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    const initialCount = await rows.count();

    // Scope the delete button to the last row so they stay in sync
    const lastRow = rows.last();
    const deleteBtn = lastRow.locator('button:has-text("Delete")');
    await deleteBtn.waitFor({ state: 'visible', timeout: 15000 });
    await deleteBtn.click();

    const confirmDialog = page.locator('.p-confirm-dialog').or(page.getByRole('dialog').last());
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.getByRole('button', { name: 'Yes', exact: true }).or(page.locator('button[aria-label="Yes"]')).first().click();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText).toBeVisible({ timeout: 10000 });
    await expect(toastText).toContainText(/success/i);

    await page.waitForLoadState('networkidle');

    // Verify by row count — reliable even when duplicate names exist
    await expect(rows).toHaveCount(initialCount - 1, { timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DeleteLeague_success');
  });

  // TC10
  test('Verify Delete cancellation', async ({ page }, testInfo) => {
    const rows = page.locator('.p-datatable-tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });
    // Wait for all rows to finish rendering before capturing the count
    let stableCount = 0, prevCount = -1;
    while (stableCount < 2) {
      const count = await rows.count();
      if (count === prevCount) stableCount++;
      else { prevCount = count; stableCount = 0; }
      await page.waitForTimeout(300);
    }
    const initialCount = await rows.count();

    const deleteBtn = page.getByRole('button', { name: 'Delete', exact: true }).or(page.locator('button[aria-label="Delete"]')).first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 15000 });
    await deleteBtn.click();

    const confirmDialog = page.locator('.p-confirm-dialog').or(page.getByRole('dialog').last());
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.getByRole('button', { name: 'No', exact: true }).or(page.locator('button[aria-label="No"]')).first().click();

    await page.waitForTimeout(500);

    const newCount = await rows.count();
    expect(newCount).toBe(initialCount);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-LeagueDeleteCancellation_success');
  });

  // TC11
  test('Verify View Leagues navigation', async ({ page }, testInfo) => {
    const viewLeagueBtn = page.getByRole('button', { name: 'League Teams', exact: true }).or(page.locator('button[aria-label="League Teams"]')).first();
    await viewLeagueBtn.waitFor({ state: 'visible', timeout: 15000 });
    await viewLeagueBtn.click();

    await page.waitForLoadState('networkidle');

    // Wait for the League Teams Stencil component to hydrate and expose its buttons
    await page.waitForSelector('generic-predictor-league-teams.hydrated', { timeout: 30000 }).catch(() => {});
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await expect(createBtn).toBeVisible({ timeout: 30000 });
    await expect(page.locator('table, .p-datatable').first()).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-ViewLeagueNavigation_success');
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// LEAGUE TEAMS  (TC12 – TC23)
// Navigation: same as above + click "League Teams" on first league row
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Marketing - Generic Predictor League Teams', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/main/home');
    // Deep-link navigation doesn't always fully hydrate the Angular/Stencil
    // component before the sidebar click fires — a reload reliably forces it
    // to initialize from scratch (same fix proven across this project's other
    // spec files).
    await page.reload();
    await page.waitForLoadState('networkidle');

    const marketingNode = page.locator('span.menuitem-text:text-is("Marketing")').first();
    await marketingNode.waitFor({ state: 'visible', timeout: 15000 });
    await marketingNode.click();

    const promotionsNode = page.locator('span.menuitem-text:text-is("Promotions")').first();
    await promotionsNode.waitFor({ state: 'visible', timeout: 10000 });
    await promotionsNode.click();

    // Generic Predictor link lands on the Promotions list page; leagues are behind "View Leagues"
    const genericPredictorLink = page.locator('span.menuitem-text:text-is("Generic Predictor")').first();
    await genericPredictorLink.waitFor({ state: 'visible', timeout: 10000 });
    await genericPredictorLink.click();
    await page.waitForURL('**/generic-predictor', { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Click "View Leagues" — button may be CSS-hidden while Angular initialises.
    // Force-click once attached; if Angular navigation didn't fire (force on hidden = no-op),
    // wait for the button to become truly visible and click normally as a fallback.
    const viewLeaguesBtn = page.getByRole('button', { name: 'View Leagues' }).first();
    await viewLeaguesBtn.waitFor({ state: 'attached', timeout: 30000 });
    await viewLeaguesBtn.click({ force: true });
    await page.waitForTimeout(1000);

    if (!await page.locator('generic-predictor-leagues.hydrated').isVisible().catch(() => false)) {
      await viewLeaguesBtn.waitFor({ state: 'visible', timeout: 20000 });
      await viewLeaguesBtn.click();
    }
    await page.waitForLoadState('networkidle');

    // Wait for Stencil component and the row buttons to be ready
    await page.waitForSelector('generic-predictor-leagues.hydrated', { timeout: 30000 });
    const viewLeagueBtn = page.getByRole('button', { name: 'League Teams', exact: true }).or(page.locator('button[aria-label="League Teams"]')).first();
    await expect(viewLeagueBtn).toBeVisible({ timeout: 30000 });
    await viewLeagueBtn.click();
    await page.waitForLoadState('networkidle');

    // Wait for the League Teams Stencil component to hydrate and expose its buttons
    await page.waitForSelector('generic-predictor-league-teams.hydrated', { timeout: 30000 }).catch(() => {});
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await expect(createBtn).toBeVisible({ timeout: 30000 });
  });

  // TC12
  test('Verify Create Team popup', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const teamNameInput       = dialog.locator('#teamName');
    const teamShortNameInput  = dialog.locator('#teamShortName');
    const teamNumberInput     = dialog.locator('#teamNumber input');
    const additionalInfoInput = dialog.locator('#additionalInfo');
    const saveBtn   = dialog.getByRole('button', { name: 'Save',   exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();

    await expect(teamNameInput).toBeVisible({ timeout: 10000 });
    await expect(teamShortNameInput).toBeVisible({ timeout: 10000 });
    await expect(teamNumberInput).toBeVisible({ timeout: 10000 });
    await expect(additionalInfoInput).toBeVisible({ timeout: 10000 });
    await expect(saveBtn).toBeVisible({ timeout: 10000 });
    await expect(cancelBtn).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeamPopup_open');

    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC13
  test('Verify Team Name mandatory field', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Leave Team Name blank — fill Team Short Name only
    const teamShortNameInput = dialog.locator('#teamShortName');
    await teamShortNameInput.fill('ShortName');

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamNameMandatory_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC14
  test('Verify Team Short Name mandatory field', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    // Fill Team Name — leave Team Short Name blank
    const teamNameInput = dialog.locator('#teamName');
    await teamNameInput.fill('Test Team Name');

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await expect(saveBtn).toBeDisabled({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamShortNameMandatory_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC15
  test('Verify Team creation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const teamName = `AutoTeam-${Date.now()}`;

    await dialog.locator('#teamName').fill(teamName);
    await dialog.locator('#teamShortName').fill('ATN');
    await dialog.locator('#teamNumber input').fill('99');
    await dialog.locator('#additionalInfo').fill('Automated test additional info');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_filled');

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await saveBtn.click();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText).toBeVisible({ timeout: 10000 });
    await expect(toastText).toContainText(/success/i);

    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await expect(page.locator(`text=${teamName}`)).toBeVisible({ timeout: 20000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-CreateTeam_success');
  });

  // TC16
  test('Verify Edit Team', async ({ page }, testInfo) => {
    const editBtn = page.getByRole('button', { name: 'Edit', exact: true }).or(page.locator('button[aria-label="Edit"]')).first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const teamNameInput = dialog.locator('#teamName');
    await teamNameInput.clear();
    await teamNameInput.fill(`AutoTeam-Edited-${Date.now()}`);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EditTeam_filled');

    const saveBtn = dialog.getByRole('button', { name: 'Save', exact: true }).or(dialog.locator('button[aria-label="Save"]')).first();
    await saveBtn.click();

    await expect(dialog).not.toBeVisible({ timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-EditTeam_success');
  });

  // TC17
  test('Verify Delete Team', async ({ page }, testInfo) => {
    const rows = page.locator('.p-datatable-tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });

    const initialCount = await rows.count();

    // Scope the delete button to the last row so they stay in sync
    const lastRow = rows.last();
    const deleteBtn = lastRow.locator('button:has-text("Delete")');
    await deleteBtn.waitFor({ state: 'visible', timeout: 15000 });
    await deleteBtn.click();

    const confirmDialog = page.locator('.p-confirm-dialog').or(page.getByRole('dialog').last());
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.getByRole('button', { name: 'Yes', exact: true }).or(page.locator('button[aria-label="Yes"]')).first().click();

    const toastText = page.locator('.p-toast-message-text').first();
    await expect(toastText).toBeVisible({ timeout: 10000 });
    await expect(toastText).toContainText(/success/i);

    await page.waitForLoadState('networkidle');

    // Verify by row count — reliable even when duplicate names exist
    await expect(rows).toHaveCount(initialCount - 1, { timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-DeleteTeam_success');
  });

  // TC18
  test('Verify Delete Team cancellation', async ({ page }, testInfo) => {
    const rows = page.locator('.p-datatable-tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 15000 });
    const initialCount = await rows.count();

    const deleteBtn = page.getByRole('button', { name: 'Delete', exact: true }).or(page.locator('button[aria-label="Delete"]')).first();
    await deleteBtn.waitFor({ state: 'visible', timeout: 15000 });
    await deleteBtn.click();

    const confirmDialog = page.locator('.p-confirm-dialog').or(page.getByRole('dialog').last());
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.getByRole('button', { name: 'No', exact: true }).or(page.locator('button[aria-label="No"]')).first().click();

    await page.waitForTimeout(500);

    const newCount = await rows.count();
    expect(newCount).toBe(initialCount);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamDeleteCancellation_success');
  });

  // TC19
  test('Verify Cancel button', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const cancelTeamName = `CancelTeam-${Date.now()}`;
    await dialog.locator('#teamName').fill(cancelTeamName);
    await dialog.locator('#teamShortName').fill('CTN');
    await dialog.locator('#teamNumber input').fill('42');
    await dialog.locator('#additionalInfo').fill('Additional info for cancel test');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Cancelled team must not appear in the list
    await expect(page.locator(`text=${cancelTeamName}`)).not.toBeVisible({ timeout: 5000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamCancelButton_success');
  });

  // TC20
  test('Verify Team Name maximum length validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#teamName').fill('A'.repeat(101));
    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(500);

    await expect(dialog.locator('text=Field must be at most 100 characters long')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamNameMaxLength_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC21
  test('Verify Team Short Name maximum length validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#teamShortName').fill('A'.repeat(51));
    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(500);

    await expect(dialog.locator('text=Field must be at most 50 characters long')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamShortNameMaxLength_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC22
  test('Verify Additional Info maximum length validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.locator('#additionalInfo').fill('A'.repeat(151));
    await page.evaluate(() => document.body.click());
    await page.waitForTimeout(500);

    await expect(dialog.locator('text=Field must be at most 150 characters long')).toBeVisible({ timeout: 10000 });

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-AdditionalInfoMaxLength_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

  // TC23
  test('Verify Team Number validation', async ({ page }, testInfo) => {
    const createBtn = page.getByRole('button', { name: 'Create Team', exact: true }).or(page.locator('button[aria-label="Create Team"]')).first();
    await createBtn.waitFor({ state: 'visible', timeout: 15000 });
    await createBtn.click();

    const dialog = page.getByRole('dialog').first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    const teamNumberInput = dialog.locator('#teamNumber input');
    await teamNumberInput.fill('abcABC');
    await page.waitForTimeout(300);

    // Numeric input rejects alphabetic characters — field must contain no letters
    const inputValue = await teamNumberInput.inputValue();
    expect(inputValue).not.toMatch(/[a-zA-Z]/);

    await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-TeamNumberValidation_success');

    const cancelBtn = dialog.getByRole('button', { name: 'Cancel', exact: true }).or(dialog.locator('button[aria-label="Cancel"]')).first();
    await cancelBtn.click();
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
  });

});

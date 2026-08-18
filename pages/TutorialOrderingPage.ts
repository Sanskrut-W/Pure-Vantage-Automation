import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { tutorialOrderingLocators } from '../locators/tutorialOrderingLocators';

export class TutorialOrderingPage extends BasePage {
    readonly regionDropdown: Locator;
    readonly searchInput:    Locator;
    readonly tutorialsTable: Locator;
    readonly loggedInTable:  Locator;
    readonly loggedOutTable: Locator;
    readonly updateBtn:      Locator;

    // Anchored regex so 'RashTest' never matches 'RashTest2', 'RashTest3', etc.
    private exactName(name: string): RegExp {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^\\s*${escaped}\\s*$`);
    }

    // Rows in the Tutorials table where Tutorial Name (td[0]) exactly equals name
    private tutorialsRowByName(name: string) {
        return this.tutorialsTable.locator('tbody tr').filter({
            has: this.page.locator('td:nth-child(1)', { hasText: this.exactName(name) })
        });
    }

    // Rows in an ordering table where Tutorial Name (td[3]) exactly equals name
    private orderingRowByName(table: Locator, name: string) {
        return table.locator('tbody tr').filter({
            has: this.page.locator('td:nth-child(3)', { hasText: this.exactName(name) })
        });
    }

    constructor(page: Page) {
        super(page);
        this.regionDropdown = page.locator(tutorialOrderingLocators.regionDropdown);
        this.searchInput    = page.locator(tutorialOrderingLocators.searchInput);
        this.tutorialsTable = page.locator(tutorialOrderingLocators.tutorialsTable);
        this.loggedInTable  = page.locator(tutorialOrderingLocators.loggedInTable);
        this.loggedOutTable = page.locator(tutorialOrderingLocators.loggedOutTable);
        this.updateBtn      = page.locator(tutorialOrderingLocators.updateBtn);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting region: ${regionName}`);
        await this.selectDropdown(this.regionDropdown, regionName);
        // Wait for all region-data API calls to complete before continuing
        await this.page.waitForLoadState('networkidle');
        // Then wait until both ordering tables actually have rows — this is the
        // true signal that the page content has finished loading for the region.
        // Waiting on LoggedIn alone left LoggedOut's own load race unguarded.
        for (const [label, table] of [
            ['LoggedIn', this.loggedInTable],
            ['LoggedOut', this.loggedOutTable],
        ] as const) {
            try {
                await table.locator('tbody tr:not(.p-datatable-emptymessage)').first()
                    .waitFor({ state: 'visible', timeout: 30000 });
            } catch {
                console.log(`selectRegion('${regionName}'): ${label} table is empty for this region`);
            }
        }
    }

    // Returns all region names available in the dropdown — used by tests that need
    // to switch to "any other region" without hardcoding a name.
    async getAvailableRegions(): Promise<string[]> {
        await this.regionDropdown.click();
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible' });
        const names = await panel.locator('.p-dropdown-item').allInnerTexts();
        await this.page.keyboard.press('Escape');
        return names.map(n => n.trim());
    }

    async searchTutorials(term: string) {
        console.log(`Searching tutorials: "${term}"`);
        await this.fillInput(this.searchInput, term);
        await this.page.waitForTimeout(500);
    }

    async clearSearch() {
        await this.searchInput.clear();
        await this.page.waitForTimeout(500);
    }

    async clickUpdate() {
        console.log('Clicking Update button...');
        await this.clickElement(this.updateBtn.first());
        await this.page.waitForTimeout(1500);
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ─── Row counts ──────────────────────────────────────────────────────────

    // PrimeVue renders a "No Data Found" placeholder as a real <tr> (class
    // p-datatable-emptymessage) while the region's data is still being fetched —
    // every other page object in this suite already excludes it (see
    // MessageTemplatesPage.getRowCount, NotificationSchedulePage.getRowCount, etc.).
    // Without the exclusion that placeholder row is itself a stable, unchanging
    // "row" that satisfies a naive first-row-visible + count-stabilizes check
    // immediately, well before the real data ever loads — so both the wait and
    // the count below must only ever look at genuine data rows.
    private async waitForStableRowCount(table: Locator, timeoutMs: number = 30000): Promise<number> {
        const dataRows = table.locator('tbody tr:not(.p-datatable-emptymessage)');
        try {
            await dataRows.first().waitFor({ state: 'visible', timeout: timeoutMs });
        } catch {
            return 0;
        }
        const deadline = Date.now() + timeoutMs;
        let previousCount = -1;
        while (Date.now() < deadline) {
            const currentCount = await dataRows.count();
            if (currentCount === previousCount) {
                return currentCount;
            }
            previousCount = currentCount;
            await this.page.waitForTimeout(300);
        }
        return previousCount;
    }

    async getRowCount(listType: 'LoggedIn' | 'LoggedOut'): Promise<number> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        const count = await this.waitForStableRowCount(table);
        if (count === 0) {
            console.log(`No rows visible in ${listType} list.`);
        }
        return count;
    }

    // ─── Reading row data ─────────────────────────────────────────────────────

    // Ordering lists structure: [DragHandle | Order | Tutorial Name]
    // td indices:                     0          1          2
    async getTutorialNameAtRow(listType: 'LoggedIn' | 'LoggedOut', rowIndex: number): Promise<string> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        return (await table.locator('tbody tr').nth(rowIndex).locator('td').nth(2).innerText()).trim();
    }

    async getOrderNumberAtRow(listType: 'LoggedIn' | 'LoggedOut', rowIndex: number): Promise<number> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        const text = await table.locator('tbody tr').nth(rowIndex).locator('td').nth(1).innerText();
        return parseInt(text.trim(), 10);
    }

    async getOrderNumbers(listType: 'LoggedIn' | 'LoggedOut'): Promise<number[]> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        const rows = await table.locator('tbody tr').all();
        const numbers: number[] = [];
        for (const row of rows) {
            const text = await row.locator('td').nth(1).innerText();
            numbers.push(parseInt(text.trim(), 10));
        }
        return numbers;
    }

    // Returns the Tutorial Name of the first item currently in the ordering list
    async getFirstActiveTutorial(listType: 'LoggedIn' | 'LoggedOut'): Promise<string> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        return (await table.locator('tbody tr').first().locator('td').nth(2).innerText()).trim();
    }

    // Returns the Tutorial Name of the first tutorial in the Tutorials table whose toggle is OFF
    // Tutorials table structure: [Tutorial Name | LoggedIn toggle | LoggedOut toggle]
    // td indices:                        0               1                  2
    async getFirstInactiveTutorial(listType: 'LoggedIn' | 'LoggedOut'): Promise<string | null> {
        // CSS nth-child is 1-based: col index 1 → nth-child(2), col index 2 → nth-child(3)
        const nthChild = listType === 'LoggedIn' ? 2 : 3;
        // Only match enabled (data-p-disabled="false") toggles that are currently OFF.
        // Disabled toggles (data-p-disabled="true") cannot be clicked — exclude them.
        const rowWithOffToggle = this.tutorialsTable.locator('tbody tr').filter({
            has: this.page.locator(
                `td:nth-child(${nthChild}) .p-inputswitch[data-p-disabled="false"][aria-checked="false"]`
            )
        }).first();
        if (await rowWithOffToggle.count() === 0) return null;
        return (await rowWithOffToggle.locator('td').nth(0).innerText()).trim();
    }

    // ─── Checking list membership ─────────────────────────────────────────────

    async isTutorialInList(tutorialName: string, listType: 'LoggedIn' | 'LoggedOut'): Promise<boolean> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        return await this.orderingRowByName(table, tutorialName).count() > 0;
    }

    // ─── Toggle state ─────────────────────────────────────────────────────────

    async isTutorialToggleOn(tutorialName: string, type: 'LoggedIn' | 'LoggedOut'): Promise<boolean> {
        const toggleColIndex = type === 'LoggedIn' ? 1 : 2;
        const row = this.tutorialsRowByName(tutorialName).first();
        const toggle = row.locator('td').nth(toggleColIndex).locator('.p-inputswitch');
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    async setTutorialToggleStatus(tutorialName: string, type: 'LoggedIn' | 'LoggedOut', targetState: boolean) {
        const targetRow = this.tutorialsRowByName(tutorialName).first();
        const toggleColIndex = type === 'LoggedIn' ? 1 : 2;
        const toggleContainer = targetRow.locator('td').nth(toggleColIndex).locator('.p-inputswitch');

        const currentState = await toggleContainer.getAttribute('aria-checked');
        const isCurrentlyON = currentState === 'true';

        if (isCurrentlyON !== targetState) {
            console.log(`Toggling ${type} for '${tutorialName}' → ${targetState}`);
            // Click the inner <input type="checkbox"> directly via evaluate.
            // PrimeVue InputSwitch binds its @change/model-update handler to the input,
            // NOT to the outer div — clicking the div has no effect on aria-checked.
            // evaluate bypasses Playwright's visibility/actionability checks entirely.
            await toggleContainer.locator('input').evaluate((el: HTMLInputElement) => el.click());
            await expect(toggleContainer).toHaveAttribute('aria-checked', targetState.toString());

            // Wait for the ORDERING LIST to reflect the change — this is more reliable
            // than a fixed sleep because it polls until the DOM actually updates.
            const orderingTable = type === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
            const rowInList = this.orderingRowByName(orderingTable, tutorialName);
            if (targetState === false) {
                // Tutorial should disappear from the ordering list
                await expect(rowInList).toHaveCount(0, { timeout: 10000 });
            } else {
                // Tutorial should reappear in the ordering list
                await expect(rowInList.first()).toBeVisible({ timeout: 10000 });
            }
        } else {
            console.log(`'${tutorialName}' ${type} is already ${targetState}`);
        }
    }

    // ─── Tutorials main list lookup ───────────────────────────────────────────

    // Finds a tutorial by name in the Tutorials table and returns its display name
    async getTutorialNameInMainList(tutorialName: string): Promise<string | null> {
        const row = this.tutorialsRowByName(tutorialName).first();
        // waitFor is more reliable than count() — count() is a point-in-time check
        // that returns 0 if the table hasn't rendered yet (race condition after selectRegion).
        try {
            await row.waitFor({ state: 'visible', timeout: 10000 });
        } catch {
            return null;
        }
        return (await row.locator('td').nth(0).innerText()).trim();
    }

    // ─── Drag and drop ────────────────────────────────────────────────────────

    async dragRowToRow(listType: 'LoggedIn' | 'LoggedOut', fromIndex: number, toIndex: number) {
        const table     = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        const targetRow = table.locator('tbody tr').nth(toIndex);

        // The tr has draggable="false" — drag MUST start from the first td (the cell
        // that contains the SVG handle icon), not from the whole row.
        const sourceHandleTd = table.locator('tbody tr').nth(fromIndex).locator('td').first();
        console.log(`Dragging from ${fromIndex} to ${toIndex} in ${listType} list`);

        await sourceHandleTd.scrollIntoViewIfNeeded();
        await targetRow.scrollIntoViewIfNeeded();

        const sourceBox = await sourceHandleTd.boundingBox();
        const targetBox = await targetRow.boundingBox();
        if (!sourceBox || !targetBox) {
            console.warn('dragRowToRow: could not get bounding boxes');
            return;
        }

        // Start from the centre of the drag-handle cell
        const startX = sourceBox.x + sourceBox.width / 2;
        const startY = sourceBox.y + sourceBox.height / 2;
        // Drop below midpoint when moving down, above midpoint when moving up
        const endX = targetBox.x + sourceBox.width / 2;
        const endY = toIndex > fromIndex
            ? targetBox.y + targetBox.height * 0.80
            : targetBox.y + targetBox.height * 0.20;

        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        await this.page.waitForTimeout(400); // hold so PrimeVue registers the drag intent

        // Gradual move in small steps to fire dragover on every intermediate row
        const STEPS = 20;
        for (let i = 1; i <= STEPS; i++) {
            const x = startX + (endX - startX) * i / STEPS;
            const y = startY + (endY - startY) * i / STEPS;
            await this.page.mouse.move(x, y);
            await this.page.waitForTimeout(20);
        }

        await this.page.mouse.up();
        await this.page.waitForTimeout(2000);
    }
}

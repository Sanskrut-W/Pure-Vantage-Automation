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
        await this.page.waitForLoadState('domcontentloaded');
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

    async getRowCount(listType: 'LoggedIn' | 'LoggedOut'): Promise<number> {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        try {
            await table.locator('tbody tr').first().waitFor({ state: 'visible' });
        } catch {
            console.log(`No rows visible in ${listType} list.`);
        }
        return await table.locator('tbody tr').count();
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
        await this.page.waitForTimeout(500);
        return await table.locator('tbody tr', { hasText: tutorialName }).count() > 0;
    }

    // ─── Toggle state ─────────────────────────────────────────────────────────

    async isTutorialToggleOn(tutorialName: string, type: 'LoggedIn' | 'LoggedOut'): Promise<boolean> {
        const toggleColIndex = type === 'LoggedIn' ? 1 : 2;
        const row = this.tutorialsTable.locator('tbody tr', { hasText: tutorialName }).first();
        const toggle = row.locator('td').nth(toggleColIndex).locator('.p-inputswitch');
        return (await toggle.getAttribute('aria-checked')) === 'true';
    }

    async setTutorialToggleStatus(tutorialName: string, type: 'LoggedIn' | 'LoggedOut', targetState: boolean) {
        const targetRow = this.tutorialsTable.locator('tbody tr', { hasText: tutorialName }).first();
        const toggleColIndex = type === 'LoggedIn' ? 1 : 2;
        const toggleContainer = targetRow.locator('td').nth(toggleColIndex).locator('.p-inputswitch');

        const currentState = await toggleContainer.getAttribute('aria-checked');
        const isCurrentlyON = currentState === 'true';

        if (isCurrentlyON !== targetState) {
            console.log(`Toggling ${type} for '${tutorialName}' → ${targetState}`);
            // Click the visible slider element (span.p-inputswitch-slider) rather than the
            // hidden input, which can fail waitFor({ state: 'visible' }) in PrimeVue.
            await this.clickElement(toggleContainer.locator('span.p-inputswitch-slider'));
            await expect(toggleContainer).toHaveAttribute('aria-checked', targetState.toString());
            await this.page.waitForTimeout(1000);
        } else {
            console.log(`'${tutorialName}' ${type} is already ${targetState}`);
        }
    }

    // ─── Tutorials main list lookup ───────────────────────────────────────────

    // Finds a tutorial by name in the Tutorials table and returns its display name
    async getTutorialNameInMainList(tutorialName: string): Promise<string | null> {
        const row = this.tutorialsTable.locator('tbody tr', { hasText: tutorialName }).first();
        if (await row.count() === 0) return null;
        return (await row.locator('td').nth(0).innerText()).trim();
    }

    // ─── Drag and drop ────────────────────────────────────────────────────────

    async dragRowToRow(listType: 'LoggedIn' | 'LoggedOut', fromIndex: number, toIndex: number) {
        const table = listType === 'LoggedIn' ? this.loggedInTable : this.loggedOutTable;
        const sourceRow = table.locator('tbody tr').nth(fromIndex);
        const targetRow = table.locator('tbody tr').nth(toIndex);
        console.log(`Dragging from index ${fromIndex} to ${toIndex} in ${listType} list`);

        await this.page.evaluate(({ src, tgt, toIdx, fromIdx }) => {
            if (!src || !tgt) return;
            const dt = new DataTransfer();
            const rect = tgt.getBoundingClientRect();
            // Aim above the midpoint when moving up, below when moving down
            const dropY = toIdx > fromIdx
                ? (rect.top + rect.height * 0.9)
                : (rect.top + rect.height * 0.1);

            src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
            tgt.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
            tgt.dispatchEvent(new DragEvent('dragover',  { bubbles: true, cancelable: true, clientY: dropY, dataTransfer: dt }));
            tgt.dispatchEvent(new DragEvent('drop',      { bubbles: true, cancelable: true, clientY: dropY, dataTransfer: dt }));
            src.dispatchEvent(new DragEvent('dragend',   { bubbles: true, cancelable: true, dataTransfer: dt }));
        }, {
            src:     await sourceRow.elementHandle(),
            tgt:     await targetRow.elementHandle(),
            toIdx:   toIndex,
            fromIdx: fromIndex,
        });

        await this.page.waitForTimeout(2000);
    }
}

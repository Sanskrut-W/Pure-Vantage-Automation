import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentationLocators } from '../locators/segmentationLocators';

export class SegmentationPage extends BasePage {
    readonly createSegmentBtn: Locator;
    readonly editBtn: Locator;
    readonly exportBtn: Locator;
    readonly deleteBtn: Locator;
    readonly searchInput: Locator;
    readonly segmentTable: Locator;

    // Create Segment popup — mandatory fields
    readonly popupDialog: Locator;
    readonly segmentationNameInput: Locator;
    readonly descriptionInput: Locator;
    readonly createQueryBtn: Locator;
    readonly previewQueryBtn: Locator;
    readonly clearQueryBtn: Locator;
    readonly cancelQueryBtn: Locator;
    // Edit Segment popup footer — same fields/dialog as Create, Create Query swapped for this
    readonly updateQueryBtn: Locator;

    // Delete confirmation dialog (PrimeNG ConfirmDialog)
    readonly confirmDialogAcceptBtn: Locator;
    readonly confirmDialogRejectBtn: Locator;

    // Create Segment popup — query builder rule row (Field / Operator / Value), row index 1 (first editable row)
    readonly fieldDropdown: Locator;
    readonly operatorDropdown: Locator;
    readonly valueInput: Locator;
    readonly dropdownFilterInput: Locator;
    readonly dropdownItems: Locator;
    readonly dropdownNoResults: Locator;

    // Query builder — add rule / AND-OR toggle / delete rule
    readonly addRuleBtn: Locator;
    readonly andOrToggles: Locator;
    readonly deleteRuleButtons: Locator;
    readonly editableRuleRows: Locator;

    // Sorting
    readonly addSortBtn: Locator;
    readonly deleteSortButtons: Locator;
    readonly sortRows: Locator;
    readonly limitInput: Locator;

    // Export Properties popup
    readonly addExportRowBtn: Locator;
    readonly deleteExportRowButtons: Locator;
    readonly exportTotalDisplay: Locator;
    readonly exportSaveBtn: Locator;
    readonly exportCancelBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createSegmentBtn = page.getByRole('button', { name: segmentationLocators.buttonCreateSegment, exact: true });
        this.editBtn = page.getByRole('button', { name: segmentationLocators.buttonEdit, exact: true });
        this.exportBtn = page.getByRole('button', { name: segmentationLocators.buttonExport, exact: true });
        this.deleteBtn = page.getByRole('button', { name: segmentationLocators.buttonDelete, exact: true });
        this.searchInput = page.locator(segmentationLocators.searchInput);
        // Scoped to <main> — an SPA can keep other routed components' tables in the DOM
        // (hidden, not removed), so an unscoped page-wide `table` locator risks matching
        // the wrong one instead of the actual Segmentation list.
        this.segmentTable = page.locator('main table').first();

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.segmentationNameInput = page.locator(segmentationLocators.inputSegmentationName);
        this.descriptionInput = page.locator(segmentationLocators.inputDescription);
        this.createQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonCreateQuery, exact: true });
        this.previewQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonPreviewQuery, exact: true });
        this.clearQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonClearQuery, exact: true });
        this.cancelQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonCancelQuery, exact: true });
        this.updateQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonUpdateQuery, exact: true });

        this.confirmDialogAcceptBtn = page.locator(segmentationLocators.confirmDialogAccept);
        this.confirmDialogRejectBtn = page.locator(segmentationLocators.confirmDialogReject);

        // The Field/Operator PrimeNG dropdowns hide their real <input> for accessibility only —
        // the actual clickable trigger is the wrapping div.p-dropdown, so the locator targets
        // that wrapper filtered by which hidden input it contains.
        this.fieldDropdown = page.locator('div.p-dropdown').filter({ has: page.locator(segmentationLocators.inputFieldSelect) });
        this.operatorDropdown = page.locator('div.p-dropdown').filter({ has: page.locator(segmentationLocators.inputOperatorSelect) });
        this.valueInput = page.locator(segmentationLocators.inputValue);
        this.dropdownFilterInput = page.locator(segmentationLocators.dropdownFilterInput).first();
        this.dropdownItems = page.locator(segmentationLocators.dropdownItem);
        this.dropdownNoResults = page.locator(segmentationLocators.dropdownNoResults);

        this.addRuleBtn = this.popupDialog.locator(segmentationLocators.buttonAddRule);
        this.andOrToggles = this.popupDialog.locator(segmentationLocators.andOrToggle);
        this.deleteRuleButtons = this.popupDialog.locator(segmentationLocators.buttonDeleteRule);
        this.editableRuleRows = this.popupDialog.locator(segmentationLocators.editableRuleRow);

        this.addSortBtn = this.popupDialog.getByRole('button', { name: segmentationLocators.buttonAddSort, exact: true });
        this.deleteSortButtons = this.popupDialog.locator(segmentationLocators.buttonDeleteSort);
        this.sortRows = this.popupDialog.locator(segmentationLocators.sortRow);
        this.limitInput = this.popupDialog.locator(segmentationLocators.inputLimit);

        this.addExportRowBtn = page.getByRole('button', { name: segmentationLocators.buttonAddExportRow, exact: true });
        this.deleteExportRowButtons = page.locator(segmentationLocators.buttonDeleteExportRow);
        this.exportTotalDisplay = page.locator(segmentationLocators.exportTotalDisplay);
        this.exportSaveBtn = page.getByRole('button', { name: segmentationLocators.buttonSave, exact: true });
        this.exportCancelBtn = page.getByRole('button', { name: segmentationLocators.buttonCancelExport, exact: true });
    }

    /**
     * Clicks the Create Segment button. The Segmentation landing page can take well
     * over the default 120s action timeout to render this button — the same slow
     * cross-origin-widget loading pattern seen on Banner/Tutorial Ordering — so this
     * waits explicitly with a longer, generous timeout before clicking.
     */
    async clickCreateSegment() {
        console.log('Clicking Create Segment button...');
        await this.createSegmentBtn.waitFor({ state: 'visible', timeout: 180000 });
        await this.createSegmentBtn.click();
    }

    /**
     * Waits for the Create Segment popup's query builder to finish loading.
     * The widget renders skeleton placeholders first and can take a while to
     * settle, so field locators aren't reliable until the skeletons are gone.
     */
    async waitForPopupLoad() {
        await this.popupDialog.waitFor({ state: 'visible' });
        await this.popupDialog.locator('.p-skeleton').first().waitFor({ state: 'hidden', timeout: 90000 }).catch(() => {});
    }

    async fillSegmentationName(name: string) {
        await this.fillInput(this.segmentationNameInput, name);
    }

    async fillDescription(description: string) {
        await this.fillInput(this.descriptionInput, description);
    }

    // ─── Rule row accessors (dynamic index) ────────────────────────────────────
    // Row index 0 is the permanently disabled default rule; the first user-editable
    // row is index 1, with index 2, 3... appended by the "+" (Add Rule) button.

    fieldDropdownAt(rowIndex: number): Locator {
        return this.popupDialog.locator('div.p-dropdown').filter({ has: this.page.locator(segmentationLocators.fieldSelectId(rowIndex)) });
    }

    operatorDropdownAt(rowIndex: number): Locator {
        return this.popupDialog.locator('div.p-dropdown').filter({ has: this.page.locator(segmentationLocators.operatorSelectId(rowIndex)) });
    }

    valueInputAt(rowIndex: number): Locator {
        return this.popupDialog.locator(segmentationLocators.valueInputId(rowIndex));
    }

    /**
     * Opens the Field dropdown for a given rule row and selects an option by visible text.
     * Reuses BasePage's generic PrimeNG dropdown handling (filter box, virtualization fallback).
     */
    async selectField(rowIndex: number, optionText: string) {
        console.log(`Selecting Field "${optionText}" on rule row ${rowIndex}...`);
        await this.selectDropdown(this.fieldDropdownAt(rowIndex), optionText);
    }

    /**
     * Opens the Operator dropdown for a given rule row and selects an option by visible text.
     * Requires a Field to already be selected on that row.
     */
    async selectOperator(rowIndex: number, optionText: string) {
        console.log(`Selecting Operator "${optionText}" on rule row ${rowIndex}...`);
        await this.selectDropdown(this.operatorDropdownAt(rowIndex), optionText);
    }

    /**
     * Fills the Value field for a given rule row. Value is a PrimeNG autocomplete
     * (typed input with an optional suggestion panel) whose valid values depend on
     * whichever Field is selected — e.g. a numeric "Deposit Amount" field won't
     * accept arbitrary text. To stay valid regardless of which Field ended up
     * selected, this prefers picking a REAL suggestion the field itself offers:
     * first checks for default suggestions on focus, then falls back to typing
     * the given value and checking for filtered suggestions, and only falls back
     * to submitting the typed text as free-text if the field never offers any
     * suggestions at all.
     */
    async fillValueAt(rowIndex: number, value: string) {
        console.log(`Filling Value "${value}" on rule row ${rowIndex}...`);
        const input = this.valueInputAt(rowIndex);
        await input.waitFor({ state: 'visible' });

        const panelLocator = this.page.locator('.p-autocomplete-panel, .p-autocomplete-items').last();
        const optionsLocator = () => panelLocator.locator('.p-autocomplete-item, [role="option"]');

        // 1. Click/focus first — some PrimeNG autocompletes list default suggestions
        //    before any text is typed.
        await input.click();
        await this.page.waitForTimeout(300);

        // 2. If nothing showed up, type the value to trigger filtered suggestions.
        if (!(await panelLocator.isVisible().catch(() => false))) {
            await input.fill(value);
            await this.page.waitForTimeout(500);
        }

        if (await panelLocator.isVisible().catch(() => false)) {
            const options = optionsLocator();
            const count = await options.count();
            if (count > 0) {
                const matching = options.filter({ hasText: value }).first();
                const target = await matching.isVisible().catch(() => false) ? matching : options.first();
                await target.click();
                return;
            }
        }

        // No suggestions ever appeared — this field genuinely accepts free text.
        await input.fill(value);
    }

    /**
     * Convenience wrapper for the always-present first editable rule row (index 1).
     */
    async fillValue(value: string) {
        await this.fillValueAt(1, value);
    }

    /**
     * Opens the Field dropdown for a row and selects whichever option renders first,
     * rather than a hardcoded name — field lists are app/environment data and the
     * available options aren't guaranteed across environments. Returns the selected
     * option's text so callers/assertions can reference it.
     */
    async selectFirstFieldOption(rowIndex: number): Promise<string> {
        await this.clickElement(this.fieldDropdownAt(rowIndex));
        const panel = this.page.locator('.p-dropdown-panel').last();
        const option = panel.locator('.p-dropdown-item, [role="option"]').first();
        await option.waitFor({ state: 'visible', timeout: 15000 });
        const text = (await option.innerText()).trim();
        await option.click();
        return text;
    }

    /**
     * Opens the Operator dropdown for a row and selects whichever option renders
     * first. Requires a Field to already be selected on that row.
     */
    async selectFirstOperatorOption(rowIndex: number): Promise<string> {
        await this.clickElement(this.operatorDropdownAt(rowIndex));
        const panel = this.page.locator('.p-dropdown-panel').last();
        const option = panel.locator('.p-dropdown-item, [role="option"]').first();
        await option.waitFor({ state: 'visible', timeout: 15000 });
        const text = (await option.innerText()).trim();
        await option.click();
        return text;
    }

    /**
     * Opens the Field dropdown for a row and selects the option at the given
     * (0-based) position. Used where a test needs to pick two DEFINITELY
     * DIFFERENT options in succession (e.g. verifying a change handler) —
     * calling selectFirstFieldOption() twice in a row can silently re-select
     * the same option, which never fires the app's value-change/clear logic.
     */
    async selectFieldOptionByIndex(rowIndex: number, optionIndex: number): Promise<string> {
        await this.clickElement(this.fieldDropdownAt(rowIndex));
        const panel = this.page.locator('.p-dropdown-panel').last();
        const option = panel.locator('.p-dropdown-item, [role="option"]').nth(optionIndex);
        await option.waitFor({ state: 'visible', timeout: 15000 });
        const text = (await option.innerText()).trim();
        await option.click();
        return text;
    }

    /**
     * Fills a full valid rule row: first available Field, first available Operator,
     * then types the given value. Used wherever a test just needs "any valid rule".
     */
    async fillValidRuleRow(rowIndex: number, value: string) {
        await this.selectFirstFieldOption(rowIndex);
        await this.selectFirstOperatorOption(rowIndex);
        await this.fillValueAt(rowIndex, value);
    }

    /**
     * Opens the Sort Field dropdown at the given sort row index and selects
     * whichever option renders first.
     */
    async selectFirstSortFieldOption(index: number): Promise<string> {
        await this.clickElement(this.sortFieldDropdownAt(index));
        const panel = this.page.locator('.p-dropdown-panel').last();
        const option = panel.locator('.p-dropdown-item, [role="option"]').first();
        await option.waitFor({ state: 'visible', timeout: 15000 });
        const text = (await option.innerText()).trim();
        await option.click();
        return text;
    }

    /**
     * Opens the Sort Order dropdown at the given sort row index and selects
     * whichever option renders first.
     */
    async selectFirstSortOrderOption(index: number): Promise<string> {
        await this.clickElement(this.sortOrderDropdownAt(index));
        const panel = this.page.locator('.p-dropdown-panel').last();
        const option = panel.locator('.p-dropdown-item, [role="option"]').first();
        await option.waitFor({ state: 'visible', timeout: 15000 });
        const text = (await option.innerText()).trim();
        await option.click();
        return text;
    }

    /**
     * Reports whether the Operator dropdown for a rule row is showing its placeholder
     * (i.e. cleared/no selection). Confirmed live: after a clear, the visible dropdown
     * label correctly resets to the "Select operator" placeholder, but the underlying
     * accessibility-only hidden <input> mirror does NOT get its value attribute updated
     * — so reading that hidden input's value is not a reliable "is it cleared?" check.
     * The rendered label's `p-placeholder` class is what the real UI (and a user) shows.
     */
    async isOperatorClearedAt(rowIndex: number): Promise<boolean> {
        const label = this.operatorDropdownAt(rowIndex).locator('.p-dropdown-label');
        const cls = await label.getAttribute('class');
        return (cls || '').includes('p-placeholder');
    }

    async isFieldDisabledAt(rowIndex: number): Promise<boolean> {
        return this.page.locator(segmentationLocators.fieldSelectId(rowIndex)).isDisabled();
    }

    async isOperatorDisabledAt(rowIndex: number): Promise<boolean> {
        return this.page.locator(segmentationLocators.operatorSelectId(rowIndex)).isDisabled();
    }

    async isValueDisabledAt(rowIndex: number): Promise<boolean> {
        return this.page.locator(segmentationLocators.valueInputId(rowIndex)).isDisabled();
    }

    /**
     * Opens the Field dropdown (query builder rule row 1 — legacy single-row helper).
     */
    async openFieldDropdown() {
        console.log('Opening Field dropdown...');
        await this.clickElement(this.fieldDropdown);
    }

    /**
     * Opens the Operator dropdown (query builder rule row 1 — legacy single-row helper).
     * Requires a Field to already be selected.
     */
    async openOperatorDropdown() {
        console.log('Opening Operator dropdown...');
        await this.clickElement(this.operatorDropdown);
    }

    /**
     * Types into the currently-open dropdown's filter box to narrow its options.
     * The filter is debounced, so a short settle wait avoids reading the option
     * list mid-update (observed once: searching "Deposit" briefly still showed
     * an unrelated leftover item before the debounce caught up).
     */
    async searchOpenDropdown(text: string) {
        console.log(`Searching open dropdown for: ${text}`);
        await this.dropdownFilterInput.fill(text);
        await this.page.waitForTimeout(500);
    }

    /**
     * Clicks a specific option in the currently-open dropdown panel.
     */
    async selectDropdownOption(text: string) {
        console.log(`Selecting dropdown option: ${text}`);
        await this.clickElement(this.dropdownItems.filter({ hasText: text }).first());
    }

    // ─── Add Rule (+) / AND-OR toggle / Delete rule ────────────────────────────

    async clickAddRule() {
        console.log('Clicking + (Add Rule) button...');
        await this.clickElement(this.addRuleBtn.first());
    }

    async getRuleRowCount(): Promise<number> {
        return this.editableRuleRows.count();
    }

    async getAndOrToggleCount(): Promise<number> {
        return this.andOrToggles.count();
    }

    andOrToggleAt(index: number): Locator {
        return this.andOrToggles.nth(index);
    }

    /**
     * Clicks the AND/OR toggle tag at the given index (0-based, in document order).
     * Clicking flips its label between "AND" and "OR".
     */
    async toggleAndOr(index: number) {
        console.log(`Toggling AND/OR at index ${index}...`);
        await this.clickElement(this.andOrToggleAt(index));
    }

    async getDeleteRuleButtonCount(): Promise<number> {
        return this.deleteRuleButtons.count();
    }

    /**
     * Clicks the delete (trash) button for an added rule row. Index is 0-based over
     * the currently-rendered delete buttons (the base row has no delete button at all).
     */
    async deleteRuleAt(index: number) {
        console.log(`Deleting rule row at delete-button index ${index}...`);
        await this.clickElement(this.deleteRuleButtons.nth(index));
    }

    // ─── Sorting ────────────────────────────────────────────────────────────────

    async clickAddSort() {
        console.log('Clicking Add Sort button...');
        await this.clickElement(this.addSortBtn);
    }

    async getSortRowCount(): Promise<number> {
        return this.sortRows.count();
    }

    sortFieldDropdownAt(index: number): Locator {
        return this.popupDialog.locator('div.p-dropdown').filter({ has: this.page.locator(segmentationLocators.sortFieldId(index)) });
    }

    sortOrderDropdownAt(index: number): Locator {
        return this.popupDialog.locator('div.p-dropdown').filter({ has: this.page.locator(segmentationLocators.sortOrderId(index)) });
    }

    async selectSortField(index: number, optionText: string) {
        console.log(`Selecting Sort Field "${optionText}" at sort row ${index}...`);
        await this.selectDropdown(this.sortFieldDropdownAt(index), optionText);
    }

    async selectSortOrder(index: number, optionText: string) {
        console.log(`Selecting Sort Order "${optionText}" at sort row ${index}...`);
        await this.selectDropdown(this.sortOrderDropdownAt(index), optionText);
    }

    async deleteSortAt(index: number) {
        console.log(`Deleting sort row at index ${index}...`);
        await this.clickElement(this.deleteSortButtons.nth(index));
    }

    // ─── Footer actions ─────────────────────────────────────────────────────────

    async clickCreateQuery() {
        console.log('Clicking Create Query button...');
        await this.clickElement(this.createQueryBtn);
    }

    async clickPreviewQuery() {
        console.log('Clicking Preview Query button...');
        await this.clickElement(this.previewQueryBtn);
    }

    async clickClearQuery() {
        console.log('Clicking Clear button...');
        await this.clickElement(this.clearQueryBtn);
    }

    async clickCancelQuery() {
        console.log('Clicking Cancel button...');
        await this.clickElement(this.cancelQueryBtn);
    }

    /**
     * Clicks Update Query on the Edit Segment popup (same dialog as Create, with this button
     * in place of Create Query).
     */
    async clickUpdateQuery() {
        console.log('Clicking Update Query button...');
        await this.clickElement(this.updateQueryBtn);
    }

    // ─── Delete confirmation dialog (PrimeNG ConfirmDialog, Yes/No) ────────────────

    async clickConfirmYes() {
        console.log('Clicking Yes on the confirmation dialog...');
        await this.clickElement(this.confirmDialogAcceptBtn);
    }

    async clickConfirmNo() {
        console.log('Clicking No on the confirmation dialog...');
        await this.clickElement(this.confirmDialogRejectBtn);
    }

    // ─── Table / search ─────────────────────────────────────────────────────────

    /**
     * Types into the app-wide table search box. The Segmentation table is
     * server-paginated (multiple pages), so a newly created/edited record isn't
     * reliably on whatever page happens to be showing — searching by name is the
     * only reliable way to confirm a record exists.
     */
    async searchSegment(name: string) {
        await this.fillInput(this.searchInput, name);
        await this.page.waitForTimeout(1000);
    }

    /**
     * Searches for a segment by name and reports whether a matching row exists.
     * The search itself is debounced/server-backed — right after creating a record,
     * the table can take longer than the search's own settle time to reflect it — so
     * this polls (via waitFor) instead of taking a single one-shot count.
     */
    async isSegmentVisibleByName(name: string, timeout: number = 20000): Promise<boolean> {
        await this.searchSegment(name);
        const row = this.segmentTable.locator('tbody tr', { hasText: name }).first();
        return await row.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    /**
     * Returns the table row for a given segment name. Callers should search for the name
     * first (e.g. via searchSegment/isSegmentVisibleByName) so exactly one row matches.
     */
    getRowByName(name: string): Locator {
        return this.segmentTable.locator('tbody tr', { hasText: name }).first();
    }

    /**
     * Searches for a segment by name and clicks its row's Edit button.
     */
    async clickEditForSegment(name: string) {
        console.log(`Clicking Edit for segment "${name}"...`);
        await this.searchSegment(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: segmentationLocators.buttonEdit, exact: true }));
    }

    /**
     * Searches for a segment by name and clicks its row's Delete button (opens the
     * Yes/No confirmation dialog — does not confirm/cancel it).
     */
    async clickDeleteForSegment(name: string) {
        console.log(`Clicking Delete for segment "${name}"...`);
        await this.searchSegment(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: segmentationLocators.buttonDelete, exact: true }));
    }

    /**
     * Searches for a segment by name and clicks its row's Export button (opens the
     * Export Properties popup).
     */
    async clickExportForSegment(name: string) {
        console.log(`Clicking Export for segment "${name}"...`);
        await this.searchSegment(name);
        const row = this.getRowByName(name);
        await row.waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(row.getByRole('button', { name: segmentationLocators.buttonExport, exact: true }));
    }

    // ─── Export Properties popup ───────────────────────────────────────────────

    segmentationGroupInputAt(index: number): Locator {
        return this.page.locator(segmentationLocators.segmentationGroupId(index));
    }

    percentageInputAt(index: number): Locator {
        return this.page.locator(segmentationLocators.segmentationGroupValueId(index));
    }

    async fillSegmentationGroupAt(index: number, value: string) {
        await this.fillInput(this.segmentationGroupInputAt(index), value);
    }

    /**
     * Fills the Percentage field for an export row. This is a plain PrimeNG-styled
     * <input type="number">, not a component needing special interaction.
     */
    async fillPercentageAt(index: number, value: string) {
        await this.fillInput(this.percentageInputAt(index), value);
    }

    async clickAddExportRow() {
        console.log('Clicking Add button on the Export Properties popup...');
        await this.clickElement(this.addExportRowBtn);
    }

    /**
     * Counts export rows via their Segmentation Group inputs — more reliable than counting
     * delete buttons, since the first row has no delete button until a second row exists.
     */
    async getExportRowCount(): Promise<number> {
        return this.page.locator('[id^="segmentationGroup-"]').count();
    }

    async deleteExportRowAt(index: number) {
        console.log(`Deleting export row at delete-button index ${index}...`);
        await this.clickElement(this.deleteExportRowButtons.nth(index));
    }

    async getExportTotalText(): Promise<string> {
        return (await this.exportTotalDisplay.textContent())?.trim() ?? '';
    }

    async clickExportSave() {
        console.log('Clicking Save on the Export Properties popup...');
        await this.clickElement(this.exportSaveBtn);
    }

    async clickExportCancel() {
        console.log('Clicking Cancel on the Export Properties popup...');
        await this.clickElement(this.exportCancelBtn);
    }

    /**
     * Clicks the Edit button for the first segment
     */
    async clickEditFirstSegment() {
        console.log('Clicking Edit button for the first segment...');
        await this.clickElement(this.editBtn.first());
    }

    /**
     * Clicks the Export button for the first segment
     */
    async clickExportFirstSegment() {
        console.log('Clicking Export button for the first segment...');
        await this.clickElement(this.exportBtn.first());
    }

    /**
     * Clicks the Delete button for the first segment
     */
    async clickDeleteFirstSegment() {
        console.log('Clicking Delete button for the first segment...');
        await this.clickElement(this.deleteBtn.first());
    }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentationLocators } from '../locators/segmentationLocators';

export class SegmentationPage extends BasePage {
    readonly createSegmentBtn: Locator;
    readonly editBtn: Locator;
    readonly exportBtn: Locator;
    readonly deleteBtn: Locator;

    // Create Segment popup — mandatory fields
    readonly popupDialog: Locator;
    readonly segmentationNameInput: Locator;
    readonly descriptionInput: Locator;
    readonly createQueryBtn: Locator;
    readonly previewQueryBtn: Locator;
    readonly clearQueryBtn: Locator;
    readonly cancelQueryBtn: Locator;

    // Create Segment popup — query builder rule row (Field / Operator / Value)
    readonly fieldDropdown: Locator;
    readonly operatorDropdown: Locator;
    readonly valueInput: Locator;
    readonly dropdownFilterInput: Locator;
    readonly dropdownItems: Locator;
    readonly dropdownNoResults: Locator;

    constructor(page: Page) {
        super(page);
        this.createSegmentBtn = page.getByRole('button', { name: segmentationLocators.buttonCreateSegment, exact: true });
        this.editBtn = page.getByRole('button', { name: segmentationLocators.buttonEdit, exact: true });
        this.exportBtn = page.getByRole('button', { name: segmentationLocators.buttonExport, exact: true });
        this.deleteBtn = page.getByRole('button', { name: segmentationLocators.buttonDelete, exact: true });

        this.popupDialog = page.locator('.p-dialog, [role="dialog"]').first();
        this.segmentationNameInput = page.locator(segmentationLocators.inputSegmentationName);
        this.descriptionInput = page.locator(segmentationLocators.inputDescription);
        this.createQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonCreateQuery, exact: true });
        this.previewQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonPreviewQuery, exact: true });
        this.clearQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonClearQuery, exact: true });
        this.cancelQueryBtn = page.getByRole('button', { name: segmentationLocators.buttonCancelQuery, exact: true });

        // The Field/Operator PrimeNG dropdowns hide their real <input> for accessibility only —
        // the actual clickable trigger is the wrapping div.p-dropdown, so the locator targets
        // that wrapper filtered by which hidden input it contains.
        this.fieldDropdown = page.locator('div.p-dropdown').filter({ has: page.locator(segmentationLocators.inputFieldSelect) });
        this.operatorDropdown = page.locator('div.p-dropdown').filter({ has: page.locator(segmentationLocators.inputOperatorSelect) });
        this.valueInput = page.locator(segmentationLocators.inputValue);
        this.dropdownFilterInput = page.locator(segmentationLocators.dropdownFilterInput).first();
        this.dropdownItems = page.locator(segmentationLocators.dropdownItem);
        this.dropdownNoResults = page.locator(segmentationLocators.dropdownNoResults);
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

    /**
     * Opens the Field dropdown (query builder rule row).
     */
    async openFieldDropdown() {
        console.log('Opening Field dropdown...');
        await this.clickElement(this.fieldDropdown);
    }

    /**
     * Opens the Operator dropdown (query builder rule row).
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

    /**
     * Fills the query builder rule row's Value input.
     */
    async fillValue(value: string) {
        console.log(`Filling Value: ${value}`);
        await this.valueInput.fill(value);
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

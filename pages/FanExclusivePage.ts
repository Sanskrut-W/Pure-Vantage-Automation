import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { fanExclusiveLocators } from '../locators/fanExclusiveLocators';

export class FanExclusivePage extends BasePage {
    readonly createFanExclusiveBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;
    readonly nameInput: Locator;
    readonly tagDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;

    readonly isLiveCheckbox: Locator;
    readonly deleteRegionBtn: Locator;
    readonly promotionContentEditor: Locator;
    readonly termsContentEditor: Locator;
    readonly bannerImageUrlInput: Locator;
    readonly mobileBannerImageUrlInput: Locator;

    constructor(page: Page) {
        super(page);
        this.createFanExclusiveBtn = page.getByRole('button', { name: fanExclusiveLocators.buttonCreateFanExclusive });
        this.editBtn = page.getByRole('button', { name: fanExclusiveLocators.buttonEdit, exact: true }).first();
        this.deleteBtn = page.getByRole('button', { name: fanExclusiveLocators.buttonDelete, exact: true }).first();

        this.nameInput = page.locator(fanExclusiveLocators.nameInput);
        this.tagDropdown = page.locator(fanExclusiveLocators.tagDropdown);
        this.startDateInput = page.locator(fanExclusiveLocators.startDateInput);
        this.endDateInput = page.locator(fanExclusiveLocators.endDateInput);

        this.isLiveCheckbox = page.locator(fanExclusiveLocators.isLiveCheckbox);
        this.deleteRegionBtn = page.getByRole('button', { name: fanExclusiveLocators.deleteRegionButton, exact: true });
        this.promotionContentEditor = page.locator(fanExclusiveLocators.promotionContentEditor);
        this.termsContentEditor = page.locator(fanExclusiveLocators.termsContentEditor);
        this.bannerImageUrlInput = page.locator(fanExclusiveLocators.bannerImageUrlInput);
        this.mobileBannerImageUrlInput = page.locator(fanExclusiveLocators.mobileBannerImageUrlInput);
    }

    async clickCreateFanExclusive() {
        console.log('Clicking Create Fan Exclusive button...');
        await this.clickElement(this.createFanExclusiveBtn);
        await this.page.waitForTimeout(1000);
    }

    async fillName(name: string) {
        console.log(`Filling Name field with: "${name}"`);
        await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.nameInput.clear();
        await this.nameInput.fill(name);
    }

    async getName(): Promise<string> {
        await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.nameInput).not.toHaveValue('', { timeout: 10000 });
        return await this.nameInput.inputValue();
    }

    async selectTag(tagLabel: string) {
        console.log(`Selecting tag: "${tagLabel}"`);
        await this.tagDropdown.click();
        await this.page.waitForTimeout(1000);
        const option = this.page.locator(fanExclusiveLocators.dropdownItem(tagLabel));
        try {
            await option.waitFor({ state: 'visible', timeout: 5000 });
        } catch (err) {
            console.log(`❌ Timeout waiting for tag "${tagLabel}". Checking available options...`);
            const items = await this.page.locator('.p-dropdown-item').allTextContents();
            console.log('Available dropdown items:', items);
            throw err;
        }
        await option.click();
        await this.page.waitForTimeout(500);
    }

    async selectStartDateToday() {
        console.log('Selecting today\'s date for Start Date...');
        await this.startDateInput.click();
        await this.page.waitForTimeout(500);
        const todayCell = this.page.locator(fanExclusiveLocators.calendarTodayCell).first();
        await todayCell.waitFor({ state: 'visible', timeout: 10000 });
        await todayCell.click();
        await this.page.waitForTimeout(500);
    }

    async selectDateFuture(inputLocator: Locator, daysFromToday: number) {
        const today = new Date();
        const target = new Date(today);
        target.setDate(today.getDate() + daysFromToday);

        const targetDay = target.getDate();
        const targetMonth = target.getMonth();
        const currentMonth = today.getMonth();

        console.log(`Selecting Date: ${target.toDateString()}...`);
        await inputLocator.click();
        await this.page.waitForTimeout(500);

        if (targetMonth !== currentMonth) {
            console.log('Target date is in next month — navigating forward...');
            const nextMonthBtn = this.page.locator('.p-datepicker-next');
            await nextMonthBtn.waitFor({ state: 'visible', timeout: 10000 });
            await nextMonthBtn.click();
            await this.page.waitForTimeout(300);
        }

        // Prefer the exact target day, but only if it's actually enabled — this
        // calendar disables certain days, and a disabled cell's pointer-events
        // are captured by its parent <td>, hanging any click aimed at the span
        // itself (confirmed live: day 24 rendered with data-p-disabled="true").
        const enabledDaySelector = '.p-datepicker-calendar td:not(.p-datepicker-other-month) span[data-p-disabled="false"]';
        const exactEnabledDay = this.page.locator(enabledDaySelector).filter({ hasText: new RegExp(`^${targetDay}$`) }).first();
        const dayCell = (await exactEnabledDay.count()) > 0
            ? exactEnabledDay
            : this.page.locator(enabledDaySelector).first(); // fallback: nearest enabled day in this view

        await dayCell.waitFor({ state: 'visible', timeout: 10000 });
        await dayCell.click();

        // Selecting a day already auto-closes the calendar in this app — do NOT
        // press Escape as a follow-up "just in case" dismiss: when the calendar
        // has already self-closed, Escape has nothing left to consume and
        // bubbles up to the parent dialog, which itself closes on Escape by
        // default (confirmed live: the whole Edit form disappeared, dropping
        // back to the list page). Click the Name field instead — a neutral,
        // always-present target — to dismiss any calendar that's still open.
        const stillOpen = await this.page.locator('.p-datepicker').isVisible().catch(() => false);
        if (stillOpen) {
            await this.nameInput.click({ force: true }).catch(() => {});
            await this.page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
        }
        await this.page.waitForTimeout(300);
    }

    async selectStartDateFuture(daysFromToday: number) {
        await this.selectDateFuture(this.startDateInput, daysFromToday);
    }

    async selectEndDateFuture(daysFromToday: number = 5) {
        await this.selectDateFuture(this.endDateInput, daysFromToday);
    }

    async selectRegionCulture(label: string) {
        console.log(`Selecting Region-Culture: "${label}"...`);
        const trigger = this.page.getByRole('button', { name: fanExclusiveLocators.regionCultureDropdown });
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        await this.page.waitForTimeout(500);
        const option = this.page.locator(fanExclusiveLocators.regionCultureItem(label));
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        // Adding a region mounts a fresh config panel (Quill editors, etc.)
        // which is noticeably slower than switching between already-mounted
        // tabs — give it a moment to settle before callers interact with it.
        await this.page.waitForTimeout(2000);
    }

    async clickSave() {
        console.log('Clicking Save button...');
        const saveBtn = this.page.locator(fanExclusiveLocators.saveButton);
        await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
        await expect(saveBtn).toBeEnabled({ timeout: 5000 });
        await saveBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async clickEditFirstFanExclusive() {
        console.log('Clicking Edit button on first Fan Exclusive...');
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(1000);
    }

    async clickDeleteFirstFanExclusive() {
        console.log('Clicking Delete button on first Fan Exclusive...');
        await this.clickElement(this.deleteBtn.first());
    }

    async confirmDelete() {
        console.log('Confirming delete by clicking "Yes" button...');
        const yesBtn = this.page.locator(fanExclusiveLocators.confirmDeleteBtn);
        await yesBtn.waitFor({ state: 'visible', timeout: 10000 });
        await yesBtn.click();
        await this.page.waitForTimeout(1000);
    }

    async verifyEntryVisible(name: string) {
        console.log(`Verifying entry "${name}" is visible in the table...`);
        const row = this.page.locator(fanExclusiveLocators.tableRowByName(name)).first();
        await expect(row).toBeVisible({ timeout: 15000 });
    }

    async verifyEntryNotVisible(name: string) {
        console.log(`Verifying entry "${name}" is no longer visible in the table...`);
        const row = this.page.locator(fanExclusiveLocators.tableRowByName(name)).first();
        await expect(row).not.toBeVisible({ timeout: 15000 });
    }

    // Reads the Name column of the first table row — used right before
    // deleting it so the verification afterward checks against the actual
    // current name, not a value tracked across separate test cases (which
    // can run in different worker processes after a retry).
    async getFirstEntryName(): Promise<string> {
        const nameCell = this.page.locator('table tbody tr').first().locator('td').first();
        return (await nameCell.textContent())?.trim() ?? '';
    }

    async fillPromotionContent(content: string) {
        console.log(`Filling Promotion Content with: "${content}"`);
        const editor = this.promotionContentEditor.locator('.ql-editor');
        // Switching to a tab added moments ago (vs. an already-mounted one)
        // triggers a fresh Quill editor mount, which is noticeably slower —
        // confirmed via page snapshot showing the heading/tab already active
        // while the editor itself hadn't rendered yet within 10s.
        await editor.waitFor({ state: 'visible', timeout: 30000 });
        await editor.click();
        await this.page.keyboard.press('Control+a');
        await this.page.keyboard.type(content);
    }

    async fillTermsContent(content: string) {
        console.log(`Filling Terms Content with: "${content}"`);
        const editor = this.termsContentEditor.locator('.ql-editor');
        await editor.waitFor({ state: 'visible', timeout: 30000 });
        await editor.click();
        await this.page.keyboard.press('Control+a');
        await this.page.keyboard.type(content);
    }

    async fillBannerImageUrl(url: string) {
        console.log(`Filling Banner Image URL with: "${url}"`);
        await this.bannerImageUrlInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.bannerImageUrlInput.clear();
        await this.bannerImageUrlInput.fill(url);
    }

    async fillMobileBannerImageUrl(url: string) {
        console.log(`Filling Mobile Banner Image URL with: "${url}"`);
        await this.mobileBannerImageUrlInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.mobileBannerImageUrlInput.clear();
        await this.mobileBannerImageUrlInput.fill(url);
    }

    async waitForEditFormLoad() {
        console.log('Waiting for edit form to fully load...');
        await this.nameInput.waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.nameInput).not.toHaveValue('', { timeout: 10000 });
        const tabMenu = this.page.locator(fanExclusiveLocators.regionTabMenu);
        await tabMenu.waitFor({ state: 'visible', timeout: 10000 });
    }

    async verifyRegionTabsVisible(regions: string[]) {
        console.log(`Verifying region tabs are visible: ${regions.join(', ')}...`);
        for (const region of regions) {
            const tab = this.page.locator(fanExclusiveLocators.regionTab(region));
            await expect(tab).toBeVisible({ timeout: 10000 });
            console.log(`  ✅ Region tab "${region}" is visible.`);
        }
    }

    async navigateRegionTabs(regions: string[]) {
        console.log(`Navigating through region tabs: ${regions.join(', ')}...`);
        for (const region of regions) {
            const tab = this.page.locator(fanExclusiveLocators.regionTab(region));
            await tab.waitFor({ state: 'visible', timeout: 20000 });
            await tab.click();
            await this.page.waitForTimeout(10000);
            const activeTab = this.page.locator(fanExclusiveLocators.activeRegionTab(region));
            await expect(activeTab).toBeVisible({ timeout: 10000 });
            console.log(`  ✅ Clicked and verified region tab "${region}" is active.`);
        }
    }

    async openRegionCultureDropdown() {
        console.log('Opening Region-Culture dropdown...');
        const trigger = this.page.getByRole('button', { name: fanExclusiveLocators.regionCultureDropdown });
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        await this.page.waitForTimeout(500);
    }

    async verifyRegionNotInDropdown(label: string) {
        console.log(`Verifying region "${label}" is not present in the dropdown...`);
        const option = this.page.locator(fanExclusiveLocators.regionCultureItem(label));
        await expect(option).not.toBeVisible({ timeout: 5000 });
        console.log(`  ✅ Region "${label}" is not available for re-selection.`);
    }

    async clickDeleteRegionBtn() {
        console.log('Clicking "Delete Region" button...');
        await this.deleteRegionBtn.waitFor({ state: 'visible', timeout: 10000 });
        await this.deleteRegionBtn.click();
        await this.page.waitForTimeout(1000);
        console.log('  ✅ Delete Region button clicked.');
    }

    // Returns the aria-label of the first currently-available (not yet added)
    // Region-Culture option — used instead of hardcoding a region name, since
    // this dropdown's available options shrink permanently as shared/reused
    // entries accumulate regions across test runs.
    async getFirstAvailableRegionCultureLabel(): Promise<string> {
        console.log('Reading first available Region-Culture option...');
        const trigger = this.page.getByRole('button', { name: fanExclusiveLocators.regionCultureDropdown });
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        await this.page.waitForTimeout(500);

        const firstOption = this.page.locator('.p-dropdown-item').first();
        await firstOption.waitFor({ state: 'visible', timeout: 10000 });
        const label = await firstOption.getAttribute('aria-label');
        if (!label) throw new Error('First Region-Culture option has no aria-label');

        // Do NOT press Escape to dismiss this dropdown — it lives inside the
        // Edit dialog, and Escape closes that whole parent dialog too (confirmed
        // live: the entire form disappeared, dropping back to the list page).
        // Toggling the same trigger button closes just the dropdown overlay.
        await trigger.click();
        await this.page.waitForTimeout(300);
        console.log(`  ✅ First available Region-Culture: "${label}"`);
        return label;
    }

    // Selects the currently-active region tab and clicks Delete Region on it —
    // used to fully clean up every region a test added, not just the last one,
    // so a shared/reused entry doesn't permanently lose available regions.
    async deleteRegionByTab(label: string) {
        console.log(`Deleting region tab "${label}"...`);
        const tab = this.page.locator(fanExclusiveLocators.regionTab(label));
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.click();
        await this.page.waitForTimeout(500);
        await this.clickDeleteRegionBtn();
    }

    async verifyRegionConfigurationVisible(regionCulture: string) {
        console.log(`Verifying configuration for "${regionCulture}" is visible...`);
        const heading = this.page.getByRole('heading', { name: `Configuration for ${regionCulture}` });
        await expect(heading).toBeVisible({ timeout: 10000 });
        await expect(this.deleteRegionBtn).toBeVisible({ timeout: 10000 });
        // A region's config panel (the custom pure-text-area-component elements)
        // can take longer than 10s to render the very first time it's added to
        // a brand-new entry — confirmed via page snapshot: the heading/tab was
        // already active while #promotionContent itself was still hidden.
        await expect(this.promotionContentEditor).toBeVisible({ timeout: 30000 });
        await expect(this.termsContentEditor).toBeVisible({ timeout: 30000 });

        await expect(this.bannerImageUrlInput).toBeVisible({ timeout: 10000 });
        await expect(this.bannerImageUrlInput).toBeEnabled({ timeout: 10000 });
        await expect(this.mobileBannerImageUrlInput).toBeVisible({ timeout: 10000 });
        await expect(this.mobileBannerImageUrlInput).toBeEnabled({ timeout: 10000 });
    }
}

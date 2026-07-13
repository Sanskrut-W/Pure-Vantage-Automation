import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { internalNotificationLocators } from '../locators/internalNotificationLocators';

export class InternalNotificationPage extends BasePage {
    readonly createNotificationBtn: Locator;
    readonly searchInput: Locator;
    readonly editBtn: Locator;
    readonly disableBtn: Locator;
    readonly deleteBtn: Locator;
    readonly titleInput: Locator;
    readonly messageInput: Locator;
    readonly saveBtn: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly confirmYesBtn: Locator;
    readonly confirmNoBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createNotificationBtn = page.locator(internalNotificationLocators.buttonCreateNotification);
        this.searchInput = page.locator(internalNotificationLocators.inputSearch);
        this.editBtn = page.locator(internalNotificationLocators.buttonEdit);
        this.disableBtn = page.locator(internalNotificationLocators.buttonDisable);
        this.deleteBtn = page.locator(internalNotificationLocators.buttonDelete);
        this.titleInput = page.getByLabel(internalNotificationLocators.inputTitle);
        this.messageInput = page.locator(internalNotificationLocators.inputMessage);
        this.saveBtn = page.locator(internalNotificationLocators.buttonSave);
        this.startDateInput = page.locator(internalNotificationLocators.startDateInput);
        this.endDateInput = page.locator(internalNotificationLocators.endDateInput);
        this.confirmYesBtn = page.getByRole('button', { name: internalNotificationLocators.buttonYes, exact: true });
        this.confirmNoBtn = page.getByRole('button', { name: internalNotificationLocators.buttonNo, exact: true });
    }

    // ─── Create ────────────────────────────────────────────────

    async clickCreateNotification() {
        console.log('Clicking Create Notification button...');
        await this.clickElement(this.createNotificationBtn);
        await this.page.waitForTimeout(1000);
    }

    // ─── Form Fields ───────────────────────────────────────────

    async fillTitle(title: string) {
        console.log(`Filling Title field with "${title}"...`);
        await this.fillInput(this.titleInput, title);
    }

    async fillMessage(message: string) {
        console.log(`Filling Message field with "${message}"...`);
        await this.messageInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.messageInput.clear();
        await this.messageInput.fill(message);
    }

    async selectType(typeName: string) {
        console.log(`Selecting message type: "${typeName}"...`);
        const trigger = this.page.locator(internalNotificationLocators.dropdownTypeTrigger);
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        const option = this.page.locator(internalNotificationLocators.dropdownOption(typeName));
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await this.page.waitForTimeout(500);
    }

    async selectIcon(iconName?: string) {
        console.log(`Selecting icon${iconName ? `: "${iconName}"` : ' (first available)'}...`);
        const trigger = this.page.locator(internalNotificationLocators.dropdownIconTrigger);
        await trigger.waitFor({ state: 'visible', timeout: 10000 });
        await trigger.click();
        const option = iconName
            ? this.page.locator(internalNotificationLocators.dropdownOption(iconName))
            : this.page.locator(internalNotificationLocators.dropdownOptionFirst).first();
        await option.waitFor({ state: 'visible', timeout: 10000 });
        await option.click();
        await this.page.waitForTimeout(500);
    }

    // ─── Date Pickers (mirrors FanExclusivePage pattern) ───────

    async selectStartDateToday() {
        console.log('Selecting today\'s date for Start Date...');
        await this.startDateInput.click();
        await this.page.waitForTimeout(500);
        const todayCell = this.page.locator(internalNotificationLocators.calendarTodayCell).first();
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

        console.log(`Selecting date: ${target.toDateString()}...`);
        await inputLocator.click();
        await this.page.waitForTimeout(500);

        if (targetMonth !== currentMonth) {
            console.log('Target date is in next month — navigating forward...');
            const nextMonthBtn = this.page.locator('.p-datepicker-next');
            await nextMonthBtn.waitFor({ state: 'visible', timeout: 10000 });
            await nextMonthBtn.click();
            await this.page.waitForTimeout(300);
        }

        const dayCell = this.page.locator(
            `.p-datepicker-calendar td:not(.p-datepicker-other-month) span`
        ).filter({ hasText: String(targetDay) }).first();

        await dayCell.waitFor({ state: 'visible', timeout: 10000 });
        await dayCell.click();
        await this.page.keyboard.press('Escape');
        await this.page.locator('.p-datepicker').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
        await this.page.waitForTimeout(300);
    }

    async selectEndDateFuture(daysFromToday: number = 5) {
        await this.selectDateFuture(this.endDateInput, daysFromToday);
    }

    // ─── Save ──────────────────────────────────────────────────

    async clickSave() {
        console.log('Clicking Save button...');
        await this.saveBtn.waitFor({ state: 'visible', timeout: 10000 });
        await expect(this.saveBtn).toBeEnabled({ timeout: 5000 });
        await this.saveBtn.click();
        await this.page.waitForTimeout(1000);
    }

    // ─── Search ────────────────────────────────────────────────

    async searchNotification(text: string) {
        console.log(`Searching for notification: "${text}"...`);
        await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await this.searchInput.clear();
        await this.searchInput.fill(text);
        await this.page.waitForTimeout(1500);
    }

    // ─── Edit ──────────────────────────────────────────────────

    async clickEditFirstNotification() {
        console.log('Clicking Edit button for the first Internal Notification...');
        await this.editBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.editBtn.first());
        await this.page.waitForTimeout(1500);
    }

    // ─── Disable ───────────────────────────────────────────────

    async clickDisableFirstNotification() {
        console.log('Clicking Disable button for the first Internal Notification...');
        await this.disableBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.disableBtn.first());
        await this.page.waitForTimeout(1000);
    }

    // ─── Delete ────────────────────────────────────────────────

    async clickDeleteFirstNotification() {
        console.log('Clicking Delete button for the first Internal Notification...');
        await this.deleteBtn.first().waitFor({ state: 'visible', timeout: 15000 });
        await this.clickElement(this.deleteBtn.first());
        await this.page.waitForTimeout(1000);
    }

    async confirmDelete() {
        console.log('Confirming deletion by clicking "Yes"...');
        await this.clickElement(this.confirmYesBtn);
        await this.page.waitForTimeout(1000);
    }

    async cancelDelete() {
        console.log('Cancelling deletion by clicking "No"...');
        await this.clickElement(this.confirmNoBtn);
        await this.page.waitForTimeout(1000);
    }

    // ─── Toggle Verification ───────────────────────────────────

    async verifyActiveToggleOff() {
        console.log('Verifying isActive toggle is off...');
        const toggle = this.page.locator(internalNotificationLocators.activeToggleInput).first();
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        await expect(toggle).toHaveAttribute('aria-checked', 'false');
    }

    // ─── Verification ──────────────────────────────────────────

    async verifyEntryVisible(entryText: string) {
        console.log(`Verifying entry "${entryText}" is visible in the table...`);
        const entry = this.page.getByText(entryText, { exact: false });
        await expect(entry).toBeVisible({ timeout: 20000 });
    }

    async verifyEntryNotVisible(entryText: string) {
        console.log(`Verifying entry "${entryText}" is no longer visible...`);
        const entry = this.page.getByText(entryText, { exact: false });
        await expect(entry).not.toBeVisible({ timeout: 20000 });
    }
}

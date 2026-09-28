import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { promotionOrderingLocators } from '../locators/promotionOrderingLocators';

export class PromotionOrderingPage extends BasePage {
    readonly promoTypeDropdown: Locator;
    readonly regionDropdown: Locator;
    readonly addPromotionBtn: Locator;

    /////// Add New Promotion To Vertical Popup ///////
    readonly popupDialog: Locator;
    readonly promoDropdown: Locator;
    readonly verticalDropdown: Locator;
    readonly popupSaveBtn: Locator;
    readonly popupCancelBtn: Locator;
    readonly confirmYesBtn: Locator;

    constructor(page: Page) {
        super(page);
        // The trigger's accessible name IS the placeholder text (confirmed via live
        // accessibility snapshot: `button "Select Promo Type"` — no `.p-dropdown-trigger`
        // wrapper with a matching aria-label exists on this page's dropdown variant).
        this.promoTypeDropdown = page.getByRole('button', { name: promotionOrderingLocators.dropdownPromoType, exact: true }).first();
        this.regionDropdown = page.getByRole('button', { name: promotionOrderingLocators.dropdownRegion, exact: true }).first();
        this.addPromotionBtn = this.page.locator(promotionOrderingLocators.addPromotionBtn);

        this.popupDialog = this.page.locator(promotionOrderingLocators.popupDialog);
        this.promoDropdown = this.page.locator(promotionOrderingLocators.promoDropdown);
        this.verticalDropdown = this.page.locator(promotionOrderingLocators.verticalDropdown);
        this.popupSaveBtn = this.page.locator(promotionOrderingLocators.popupSaveBtn);
        this.popupCancelBtn = this.page.locator(promotionOrderingLocators.popupCancelBtn);
        this.confirmYesBtn = this.page.locator(promotionOrderingLocators.confirmYesBtn);
    }

    async selectPromoType(promoType: string) {
        console.log(`Selecting Promo Type: ${promoType} on Promotion Ordering...`);
        await this.clickElement(this.promoTypeDropdown);
        const optionLocator = this.page.getByRole('option', { name: promoType, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForTimeout(1000);
    }

    async selectRegion(regionName: string) {
        console.log(`Selecting Region: ${regionName} on Promotion Ordering...`);
        await this.clickElement(this.regionDropdown);
        const optionLocator = this.page.getByRole('option', { name: regionName, exact: true });
        await this.clickElement(optionLocator);
        await this.page.waitForLoadState('networkidle');
    }

    async clickAddPromotion() {
        console.log('Clicking Add New Promotion To Vertical button...');
        await this.clickElement(this.addPromotionBtn);
    }

    /////// Add New Promotion To Vertical Popup Methods ///////

    async selectFirstAvailablePromo() {
        console.log('Selecting first available Promo in Add New Promotion popup...');
        await this.clickElement(this.promoDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });
        await panel.locator('.p-dropdown-item').first().click();
    }

    /**
     * Returns the Promo name it selected, or null if every option in the picklist is already
     * in `existingNames` — the caller must handle null (Cancel + skip) rather than proceed to
     * Save, since forcing a pick in that case is exactly what causes a stuck "Add Promotion"
     * popup (confirmed live, repeatedly: this app's Promo pool for a given Promo Type +
     * Region filter can be as small as 2 total Promos, so "everything already assigned" is a
     * real, recurring state — not a locator bug to keep working around).
     */
    async selectFirstAvailablePromoNotIn(existingNames: string[]): Promise<string | null> {
        console.log('Selecting first available Promo not already present in the vertical...');
        await this.clickElement(this.promoDropdown);
        const panel = this.page.locator('.p-dropdown-panel').last();
        await panel.waitFor({ state: 'visible', timeout: 5000 });

        // This list may be virtualized, so scanning only the initially-rendered items can
        // miss unused options further down (previously caused a stuck popup when every
        // rendered item happened to already be in the vertical). A prior attempt drove this
        // via ArrowDown + reading a ".p-highlight" item — that hung indefinitely because the
        // highlight class never actually appeared (unbounded actionability wait on a locator
        // matching zero elements). This version only ever reads items already confirmed to
        // exist via .count(), so it can't hang the same way; it scrolls the panel itself to
        // reveal more items and stops once a scroll pass reveals nothing new.
        const items = panel.locator('.p-dropdown-item');
        const seen = new Set<string>();

        for (let pass = 0; pass < 20; pass++) {
            const count = await items.count();
            let foundNew = false;
            for (let i = 0; i < count; i++) {
                const text = (await items.nth(i).innerText()).trim();
                if (!text || seen.has(text)) continue;
                foundNew = true;
                seen.add(text);
                if (!existingNames.includes(text)) {
                    await items.nth(i).click();
                    return text;
                }
            }
            if (!foundNew && pass > 0) {
                // The last scroll revealed nothing new — reached the end of the list.
                break;
            }
            await panel.evaluate((el) => {
                const scrollable = (el.querySelector('.p-dropdown-items-wrapper, [role="listbox"]') as HTMLElement) || el;
                scrollable.scrollTop += scrollable.clientHeight || 200;
            }).catch(() => {});
            await this.page.waitForTimeout(150);
        }

        if (seen.size === 0) {
            throw new Error('Select Promo dropdown rendered no options at all.');
        }
        // Every reachable option is already assigned somewhere — nothing free to pick.
        // Closing the panel (without selecting anything) leaves the choice to the caller
        // instead of forcing a duplicate that would just stall on Save.
        await this.page.keyboard.press('Escape').catch(() => {});
        return null;
    }

    /**
     * Assumes the Add Promo popup is already open. Selects the target vertical once, then
     * tries Promos from the picklist one at a time — clicking Save after each and checking
     * whether the popup actually closed — instead of pre-computing which Promo is "available"
     * from the vertical tables. Pre-computing existing names proved unreliable in practice
     * (table-render timing races, and Promos being exclusive across ALL verticals rather than
     * just the target one, both caused the "available" Promo to still get rejected on Save).
     * Trying the real Save and reacting to its actual outcome sidesteps needing to predict
     * availability at all. Returns the Promo name that saved successfully, or null if every
     * reachable Promo was rejected (Cancel is clicked in that case so the popup doesn't linger).
     */
    async addAvailablePromoToVertical(verticalOption: string): Promise<string | null> {
        console.log(`Trying Promos one by one until one saves to vertical: ${verticalOption}...`);
        await this.selectVertical(verticalOption);

        const tried = new Set<string>();
        // Trimmed from 20: the real Promo pool for a given Promo Type + Region filter has been
        // observed as small as 2-4 total entries, so exhausting anywhere near 20 attempts just
        // means every reachable Promo is already taken — worth confirming faster rather than
        // grinding through the full budget (each attempt costs a Save round-trip).
        const maxAttempts = 8;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await this.clickElement(this.promoDropdown);
            const panel = this.page.locator('.p-dropdown-panel').last();
            await panel.waitFor({ state: 'visible', timeout: 5000 });

            const items = panel.locator('.p-dropdown-item');
            let candidate: string | null = null;

            // Scroll through the (possibly virtualized) list looking for an untried Promo.
            for (let pass = 0; pass < 20 && !candidate; pass++) {
                const count = await items.count();
                for (let i = 0; i < count; i++) {
                    const text = (await items.nth(i).innerText()).trim();
                    if (text && !tried.has(text)) {
                        candidate = text;
                        await items.nth(i).click();
                        break;
                    }
                }
                if (candidate) break;
                await panel.evaluate((el) => {
                    const scrollable = (el.querySelector('.p-dropdown-items-wrapper, [role="listbox"]') as HTMLElement) || el;
                    scrollable.scrollTop += scrollable.clientHeight || 200;
                }).catch(() => {});
                await this.page.waitForTimeout(150);
            }

            if (!candidate) {
                // Ran out of untried Promos entirely — nothing left worth attempting.
                await this.page.keyboard.press('Escape').catch(() => {});
                break;
            }

            tried.add(candidate);
            await this.clickPopupSave();

            // Trimmed from 4000ms: a rejection surfaces near-instantly (validation runs
            // client-side against the vertical tables already in memory), so a long wait here
            // just multiplies wasted time across every rejected attempt.
            const closed = await this.popupDialog.waitFor({ state: 'hidden', timeout: 2500 }).then(() => true).catch(() => false);
            if (closed) {
                return candidate;
            }

            // Save didn't close the popup — this Promo was rejected. Read whatever validation
            // toast appeared (if any) so failures are diagnosable from the actual message
            // instead of just "the popup stayed open" — toasts auto-dismiss, so read with a
            // short timeout rather than the unbounded default.
            const rejectionToast = this.page.locator(`${promotionOrderingLocators.successToast}, ${promotionOrderingLocators.errorToast}`).first();
            const rejectionMessage = await rejectionToast.textContent({ timeout: 1500 }).catch(() => '(no toast appeared)');
            console.log(`Promo "${candidate}" was rejected on Save — toast: "${rejectionMessage}" — trying the next one...`);
        }

        await this.clickPopupCancel().catch(() => {});
        return null;
    }

    async selectVertical(verticalName: string) {
        console.log(`Selecting Vertical: ${verticalName}`);
        await this.selectDropdown(this.verticalDropdown, verticalName);
    }

    async clickPopupSave() {
        console.log('Clicking Save on Add New Promotion To Vertical popup...');
        await this.clickElement(this.popupSaveBtn.first());
        await this.page.waitForTimeout(500);
    }

    async clickPopupCancel() {
        console.log('Clicking Cancel on Add New Promotion To Vertical popup...');
        await this.clickElement(this.popupCancelBtn.first());
        await this.page.waitForTimeout(500);
    }

    /////// Vertical Table Methods ///////

    getVerticalSection(verticalName: string): Locator {
        return this.page.locator(promotionOrderingLocators.verticalTableWrapper)
            .filter({ has: this.page.locator(promotionOrderingLocators.verticalSectionHeader).getByText(verticalName, { exact: true }) });
    }

    getVerticalRows(verticalName: string): Locator {
        // An empty vertical renders a literal "No Data Found" placeholder <tr> — requiring
        // an <h3> (only present on real Promo rows) keeps that placeholder from counting
        // as a row, so an empty vertical correctly reports zero.
        return this.getVerticalSection(verticalName).locator('tbody tr').filter({ has: this.page.locator('h3') });
    }

    async getPromoNameInRow(verticalName: string, rowIndex: number): Promise<string> {
        const row = this.getVerticalRows(verticalName).nth(rowIndex);
        return (await row.locator('h3').innerText()).trim();
    }

    async getAllPromoNamesInVertical(verticalName: string): Promise<string[]> {
        const rows = this.getVerticalRows(verticalName);
        const count = await rows.count();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            names.push((await rows.nth(i).locator('h3').innerText()).trim());
        }
        return names;
    }

    async getAllPromoNamesAcrossVerticals(verticalNames: string[]): Promise<string[]> {
        // A Promo appears to be assignable to only ONE vertical at a time, not per-vertical —
        // confirmed live: adding a Promo to Casino that was already assigned to Sport left the
        // Add popup stuck open on Save, even though it wasn't a duplicate within Casino itself.
        // So "available" must be checked against every vertical's existing Promos, not just
        // the one being added to.
        const names: string[] = [];
        for (const verticalName of verticalNames) {
            names.push(...await this.getAllPromoNamesInVertical(verticalName));
        }
        return names;
    }

    /**
     * Returns true if a real delete was initiated (the confirm dialog appeared and was
     * accepted), or false if × turned out to be a no-op — confirmed live: × does nothing for
     * some rows (no dialog, no request, row stays put) with no visible signal beyond the
     * absence of the dialog. Callers that assert on a resulting toast must check this instead
     * of assuming a click always leads to one.
     */
    async deletePromoFromVertical(verticalName: string, rowIndex: number): Promise<boolean> {
        console.log(`Deleting row ${rowIndex} from ${verticalName} vertical...`);
        const row = this.getVerticalRows(verticalName).nth(rowIndex);
        await this.clickElement(row.locator(promotionOrderingLocators.deleteRowBtn));

        await this.confirmYesBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        if (await this.confirmYesBtn.isVisible().catch(() => false)) {
            await this.clickElement(this.confirmYesBtn);
            return true;
        }
        return false;
    }

    async clickPageSave() {
        console.log('Clicking page-level Save to persist vertical ordering changes...');
        // Only safe to look up once the Add Promotion popup itself is closed, since its
        // own footer button shares the exact same "Save" label/aria-label.
        await this.popupDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        const saveBtn = this.page.getByRole('button', { name: 'Save', exact: true }).first();
        await this.clickElement(saveBtn);
        await this.page.waitForTimeout(500);
    }

    /////// Context Menu (right-click) Methods ///////

    async rightClickVerticalRow(verticalName: string, rowIndex: number) {
        console.log(`Right-clicking row ${rowIndex} in ${verticalName} vertical...`);
        const row = this.getVerticalRows(verticalName).nth(rowIndex);
        await row.scrollIntoViewIfNeeded();
        await row.click({ button: 'right' });
        await this.page.waitForTimeout(300);
    }

    async clickContextMenuOption(optionText: string) {
        console.log(`Clicking context menu option: ${optionText}`);
        const menu = this.page.locator(promotionOrderingLocators.contextMenu);
        await menu.waitFor({ state: 'visible', timeout: 5000 });
        await this.clickElement(menu.getByText(optionText, { exact: true }));
    }

    async moveRowUp(verticalName: string, rowIndex: number) {
        await this.rightClickVerticalRow(verticalName, rowIndex);
        await this.clickContextMenuOption(promotionOrderingLocators.moveUpOption);
    }

    async moveRowDown(verticalName: string, rowIndex: number) {
        await this.rightClickVerticalRow(verticalName, rowIndex);
        await this.clickContextMenuOption(promotionOrderingLocators.moveDownOption);
    }
}

import { Page, Locator } from '@playwright/test';
import { TutorialLocators } from '../locators/tutorialLocators';

export class TutorialPage {
    readonly page: Page;

    // Landing Page Options
    readonly regionDropdown: Locator;
    readonly createTutorialBtn: Locator;
    readonly searchInput: Locator;
    readonly dataTable: Locator;
    readonly nextBtn: Locator;
    readonly prevBtn: Locator;
    readonly pageNumbersBtn: Locator;
    readonly editBtn: Locator;
    readonly deleteBtn: Locator;

    // Popup Dialog Options
    readonly popupDialog: Locator;
    readonly tutorialNameInput: Locator;
    readonly popupRegionsDropdown: Locator;
    readonly popupVerticalsDropdown: Locator;
    readonly popupPlatformsDropdown: Locator;
    readonly tutorialTypeDropdown: Locator;
    readonly kenticoUrlDropdown: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly loggedInCheckbox: Locator;
    readonly loggedOutCheckbox: Locator;
    readonly saveBtn: Locator;
    readonly cancelBtn: Locator;
    readonly successToast: Locator;

    constructor(page: Page) {
        this.page = page;

        // Landing Selectors
        this.regionDropdown = page.locator(TutorialLocators.landingRegionDropdown);
        this.createTutorialBtn = page.locator(TutorialLocators.createTutorialBtn);
        // Confirmed live via outerHTML: only one `input[placeholder="Search"]` exists on this
        // page now — `.nth(1)` assumed a second match (pre-redesign layout) that no longer exists.
        this.searchInput = page.locator(TutorialLocators.searchBar).first();
        this.dataTable = page.locator(TutorialLocators.tutorialTable);
        this.nextBtn = page.locator(TutorialLocators.nextPageBtn);
        this.prevBtn = page.locator(TutorialLocators.prevPageBtn);
        this.pageNumbersBtn = page.locator(TutorialLocators.pageNumbers);
        this.editBtn = page.locator(TutorialLocators.editBtn);
        this.deleteBtn = page.locator(TutorialLocators.deleteBtn);

        // Dialog Selectors
        this.popupDialog = page.locator(TutorialLocators.dialogContainer);
        this.tutorialNameInput = page.locator(TutorialLocators.tutorialNameInput);
        this.popupRegionsDropdown = page.locator(TutorialLocators.popupRegionsDropdown);
        this.popupVerticalsDropdown = page.locator(TutorialLocators.popupVerticalsDropdown);
        this.popupPlatformsDropdown = page.locator(TutorialLocators.popupPlatformsDropdown);
        this.tutorialTypeDropdown = page.locator(TutorialLocators.tutorialTypeDropdown);
        this.kenticoUrlDropdown = page.locator(TutorialLocators.kenticoUrlDropdown);
        this.startDateInput = page.locator(TutorialLocators.startDateInput);
        this.endDateInput = page.locator(TutorialLocators.endDateInput);
        this.loggedInCheckbox = page.locator(TutorialLocators.loggedInCheckbox);
        this.loggedOutCheckbox = page.locator(TutorialLocators.loggedOutCheckbox);
        this.saveBtn = page.locator(TutorialLocators.saveBtn);
        this.cancelBtn = page.locator(TutorialLocators.cancelBtn);
        this.successToast = page.locator(TutorialLocators.successToast);
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
        await this.regionDropdown.waitFor({ state: 'visible' });
    }

    async selectLandingRegion(regionName: string) {
        await this.regionDropdown.click();
        await this.page.waitForTimeout(500); // Overlay render wait

        // Confirmed live: the full region list is virtualized — only options currently in the
        // scroll viewport exist in the DOM, so an alphabetically-late region like "Betway Zambia"
        // never renders (and the locator below times out) unless the panel's own filter box is
        // used to narrow the list first, the same way a human would search instead of scrolling.
        const panel = this.page.locator('.p-dropdown-panel').last();
        const filterInput = panel.locator('input[type="text"]').first();
        if (await filterInput.isVisible().catch(() => false)) {
            await filterInput.fill(regionName);
            await this.page.waitForTimeout(300);
        }

        // Scoped to `panel` (not `this.page`) — an unscoped page-wide query can match a stale
        // `.p-dropdown-item` left over from another `.p-dropdown-panel` instance in the DOM
        // (PrimeVue teleports panels out of their trigger), which is never interactable and
        // hangs the click for the full 120s timeout even though the real, open option is
        // right there. Confirmed live: the open panel's items carry this exact class/aria-label.
        const option = panel.locator(`.p-dropdown-item[aria-label="${regionName}"], .p-dropdown-item:has-text("${regionName}")`).first();
        await option.click();
        await this.page.waitForTimeout(1000); // Table rebuild wait
    }

    async clickCreateTutorial() {
        await this.createTutorialBtn.click({ force: true });
        await this.popupDialog.waitFor({ state: 'visible' });
    }

    async searchForTutorial(text: string) {
        await this.searchInput.fill('');
        await this.searchInput.fill(text);
        await this.searchInput.press('Enter');
        await this.page.waitForTimeout(1000);
    }

    async selectPopupRegion(regionName: string) {
        await this.popupRegionsDropdown.click();
        await this.page.waitForTimeout(500);
        await this.page.locator(`.p-multiselect-item[aria-label="${regionName}"], .p-multiselect-item:has-text("${regionName}")`).click();
        await this.popupRegionsDropdown.locator('.p-multiselect-close').click().catch(() => { }); // Close dropdown if needed
    }

    async selectTutorialType(type: string) {
        await this.tutorialTypeDropdown.click();
        await this.page.locator(`.p-dropdown-item:has-text("${type}")`).click();
    }
}

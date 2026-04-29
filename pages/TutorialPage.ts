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
        this.searchInput = page.locator(TutorialLocators.searchBar).nth(1);
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
        await this.regionDropdown.waitFor({ state: 'visible', timeout: 15000 });
    }

    async selectLandingRegion(regionName: string) {
        await this.regionDropdown.click();
        await this.page.waitForTimeout(500); // Overlay render wait
        const option = this.page.locator(`.p-dropdown-item[aria-label="${regionName}"], .p-dropdown-item:has-text("${regionName}")`).first();
        await option.click();
        await this.page.waitForTimeout(1000); // Table rebuild wait
    }

    async clickCreateTutorial() {
        await this.createTutorialBtn.click({ force: true });
        await this.popupDialog.waitFor({ state: 'visible', timeout: 5000 });
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

import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentationLocators } from '../locators/segmentationLocators';

export class SegmentationPage extends BasePage {
    readonly createSegmentBtn: Locator;
    readonly editBtn: Locator;
    readonly exportBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createSegmentBtn = page.getByRole('button', { name: segmentationLocators.buttonCreateSegment, exact: true });
        this.editBtn = page.getByRole('button', { name: segmentationLocators.buttonEdit, exact: true });
        this.exportBtn = page.getByRole('button', { name: segmentationLocators.buttonExport, exact: true });
        this.deleteBtn = page.getByRole('button', { name: segmentationLocators.buttonDelete, exact: true });
    }

    /**
     * Clicks the Create Segment button
     */
    async clickCreateSegment() {
        console.log('Clicking Create Segment button...');
        await this.clickElement(this.createSegmentBtn);
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

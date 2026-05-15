import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { segmentTaggingLocators } from '../locators/segmentTaggingLocators';

export class SegmentTaggingPage extends BasePage {
    readonly createSegmentationTagBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.createSegmentationTagBtn = this.page.locator(segmentTaggingLocators.createSegmentationTagBtn);
    }

    async clickCreateSegmentationTag() {
        console.log('Clicking Create Segmentation Tag button...');
        await this.clickElement(this.createSegmentationTagBtn);
    }
}

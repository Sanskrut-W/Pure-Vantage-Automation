import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { campaignLocators } from '../locators/campaignLocators';

export class CampaignPage extends BasePage {
    readonly selectRegionBtn: Locator;
    readonly createCampaignBtn: Locator;

    readonly editBtn: Locator;
    readonly linkWorkflowBtn: Locator;
    readonly detailsBtn: Locator;
    readonly deleteBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.selectRegionBtn = page.getByRole('button', { name: campaignLocators.buttonSelectRegion });
        this.createCampaignBtn = page.getByRole('button', { name: campaignLocators.buttonCreateCampaign });
        
        // Use getByRole for robust accessibility-based button querying
        this.editBtn = page.getByRole('button', { name: campaignLocators.buttonEdit, exact: true });
        this.linkWorkflowBtn = page.getByRole('button', { name: campaignLocators.buttonLinkWorkflow, exact: true });
        this.detailsBtn = page.getByRole('button', { name: campaignLocators.buttonDetails, exact: true });
        this.deleteBtn = page.getByRole('button', { name: campaignLocators.buttonDelete, exact: true });
    }

    /**
     * Clicks the Select Region button if visible on the Campaign Management page.
     */
    async clickSelectRegion() {
        console.log('Clicking Select Region button on Campaign Management...');
        if (await this.selectRegionBtn.count() > 0) {
            await this.clickElement(this.selectRegionBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Clicks the Create Campaign button if visible on the Campaign Management page.
     */
    async clickCreateCampaign() {
        console.log('Clicking Create Campaign button...');
        if (await this.createCampaignBtn.count() > 0) {
            await this.clickElement(this.createCampaignBtn);
            await this.page.waitForTimeout(1000);
        }
    }

    /**
     * Performs Select Region + Create Campaign in sequence.
     */
    async selectRegionAndCreateCampaign() {
        await this.clickSelectRegion();
        await this.clickCreateCampaign();
    }

    async clickEditFirstCampaign() {
        console.log('Clicking Edit button on first campaign...');
        await this.clickElement(this.editBtn.first());
    }

    async clickLinkWorkflowFirstCampaign() {
        console.log('Clicking Link Workflow button on first campaign...');
        await this.clickElement(this.linkWorkflowBtn.first());
    }

    async clickDetailsFirstCampaign() {
        console.log('Clicking Details button on first campaign...');
        await this.clickElement(this.detailsBtn.first());
    }

    async clickDeleteFirstCampaign() {
        console.log('Clicking Delete button on first campaign...');
        await this.clickElement(this.deleteBtn.first());
    }
}

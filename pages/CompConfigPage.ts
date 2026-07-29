import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { compConfigLocators } from '../locators/compConfigLocators';

export class CompConfigPage extends BasePage {
    readonly payoutReportBtn: Locator;
    readonly createCompBtn: Locator;

    constructor(page: Page) {
        super(page);
        // Payout Report's outerHTML only shows the inner label span, not a
        // confirmed aria-label on the button itself (unlike Create Comp) — a
        // role-based accessible-name match is resilient either way, since
        // Playwright falls back to visible text content when aria-label is absent.
        this.payoutReportBtn = this.page.getByRole('button', { name: 'Payout Report' });
        this.createCompBtn = this.page.locator(compConfigLocators.createCompBtn);
    }

    async clickPayoutReport() {
        console.log('Clicking Payout Report button...');
        await this.clickElement(this.payoutReportBtn);
    }

    async clickCreateComp() {
        console.log('Clicking Create Comp button...');
        await this.clickElement(this.createCompBtn);
    }
}

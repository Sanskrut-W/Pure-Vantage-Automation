// npx playwright test tests/ScheduleSegment.spec.ts --headed
import { test, expect } from '../fixtures/baseFixture';
import { CommonUtils } from '../utils/commonUtils';

// ─── Shared navigation / setup helpers ─────────────────────────────────────────
async function navigateToSegmentSchedule(page: any, sidebarPage: any, segmentSchedulePage: any) {
    await page.goto('/main/home');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.reload().catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
    await sidebarPage.waitForPageLoad();
    await sidebarPage.waitForAppReady();
    await sidebarPage.navigateToSegmentSchedule();
    await segmentSchedulePage.scheduleSegmentBtn.waitFor({ state: 'visible', timeout: 60000 });
    await segmentSchedulePage.selectFirstRegion();
}

async function openScheduleSegmentPopup(segmentSchedulePage: any) {
    await segmentSchedulePage.clickScheduleSegment();
    await segmentSchedulePage.waitForPopupLoad();
}

/**
 * Waits for a notification (either a floating toast or an inline alert banner) and judges success
 * purely by its TEXT, not by which locator matched it. Confirmed live this app's PrimeNG Toast
 * renders its message wrapper with role="alert" as standard accessibility markup — so a genuine
 * SUCCESS toast (text "<Summary><Detail>" concatenated with no separator, e.g.
 * "SuccessSegment scheduled successfully") is ALSO matched by page.getByRole('alert'), same as the
 * persistent validation-failure banner ("Error\nA scheduled notification with campaign name 'X'
 * already exists..."). Treating "an alert element exists" as automatic failure was wrong — it
 * misclassified a real success. The only reliable signal is whether the text starts with
 * "Success" vs "Error".
 */
async function waitForScheduleOutcome(page: any, timeoutMs = 15000): Promise<{ ok: boolean; text: string | null }> {
    const notification = page.locator('.p-toast-message-text, [role="alert"]').first();
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        if (await notification.isVisible().catch(() => false)) {
            const text = ((await notification.textContent()) ?? '').trim();
            return { ok: /^success/i.test(text), text };
        }
        await page.waitForTimeout(250);
    }
    return { ok: false, text: null };
}

/**
 * Fills every field that's mandatory regardless of which notification channel toggles are used:
 * Name, Description, Campaign, Segment, Scheduled Date, Expiry Date. Dry Run is forced ON here
 * unconditionally — per team convention every Schedule Segment test case must run as a dry run so
 * it never actually fires a real email/SMS/push/notification against the live site. Returns the
 * Campaign that was selected, since callers may need to retry with a different one.
 */
async function fillCoreMandatoryFields(segmentSchedulePage: any, name: string, description: string): Promise<string> {
    await segmentSchedulePage.fillName(name);
    await segmentSchedulePage.fillDescription(description);
    const campaign = await segmentSchedulePage.selectFirstCampaign();
    await segmentSchedulePage.selectFirstSegment();
    await segmentSchedulePage.setScheduledDate();
    await segmentSchedulePage.setExpiryDate();
    await segmentSchedulePage.ensureDryRunOn(true);
    return campaign;
}

/**
 * Turns OFF all 4 notification-channel toggles (Send Email/SMS/Push/Notification Panel) — used to
 * isolate a single toggle's effect, since this popup's toggles render with unpredictable defaults
 * across environments and this suite should never assume a given toggle's starting state.
 */
async function ensureAllChannelTogglesOff(segmentSchedulePage: any) {
    await segmentSchedulePage.ensureSendEmailOn(false);
    await segmentSchedulePage.ensureSendSmsOn(false);
    await segmentSchedulePage.ensureSendPushOn(false);
    await segmentSchedulePage.ensureSendNotificationPanelOn(false);
}

/**
 * Fills the core mandatory fields, enables exactly one notification channel (plus its now-visible
 * template dropdown) and Dry Run, then schedules. Confirmed live this app rejects a new scheduled
 * notification that collides with an EXISTING one for the same Campaign — two variants seen so
 * far: an exact/near match ("A scheduled notification with campaign name 'X' already exists for
 * this segmentation group") and a too-close-in-time match ("new scheduled date must be 1 hour
 * away from existing scheduled date. Please select a different date/time"). Both stem from the
 * same root cause: this environment accumulates leftover Pending entries per Campaign whenever a
 * run fails before reaching its own cleanup, and setScheduledDate() always picks the same
 * "now"-based day/time, so successive runs land close together. Rather than fail outright on
 * either, this retries with a different Campaign (selectDifferentActiveCampaign) up to a few
 * times before giving up — switching Campaign is the only variable this loop changes, so it won't
 * help if the SAME Campaign's Pending entries are themselves all clustered within an hour of each
 * other, but it resolves the common case of the conflict being tied to one specific Campaign.
 */
async function scheduleWithSingleChannel(
    page: any,
    segmentSchedulePage: any,
    name: string,
    channel: 'Email' | 'SMS' | 'Push' | 'Notification Panel'
) {
    const campaign = await fillCoreMandatoryFields(segmentSchedulePage, name, `${channel} channel test`);
    const triedCampaigns = [campaign];
    await ensureAllChannelTogglesOff(segmentSchedulePage);

    if (channel === 'Email') {
        await segmentSchedulePage.ensureSendEmailOn(true);
        await segmentSchedulePage.selectFirstEmailTemplate();
    } else if (channel === 'SMS') {
        await segmentSchedulePage.ensureSendSmsOn(true);
        await segmentSchedulePage.selectFirstSmsTemplate();
    } else if (channel === 'Push') {
        await segmentSchedulePage.ensureSendPushOn(true);
        await segmentSchedulePage.selectFirstPushTemplate();
    } else {
        await segmentSchedulePage.ensureSendNotificationPanelOn(true);
        await segmentSchedulePage.selectFirstNotificationPanelTemplate();
    }

    const MAX_ATTEMPTS = 5;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        await expect(segmentSchedulePage.scheduleBtn, `Expected Schedule to be enabled with ${channel} + Dry Run ON`).toBeEnabled({ timeout: 10000 });
        await segmentSchedulePage.clickSchedule();
        const { ok, text } = await waitForScheduleOutcome(page);

        if (ok) {
            console.log('Schedule Segment toast message:', text);
            return;
        }

        const isSchedulingCollision = !!text && (
            /already exists for this segmentation group/i.test(text) ||
            /must be \d+ hour[s]? away from existing scheduled date/i.test(text)
        );
        if (!isSchedulingCollision || attempt === MAX_ATTEMPTS) {
            throw new Error(
                text
                    ? `Expected the segment to be scheduled successfully, but got: "${text}"`
                    : 'Expected a confirmation that the segment was scheduled, but none appeared within 15s.'
            );
        }

        console.log(`Campaign "${triedCampaigns[triedCampaigns.length - 1]}" collides with an existing scheduled entry (${text}) — retrying with a different Campaign (attempt ${attempt + 1}/${MAX_ATTEMPTS})...`);
        await page.getByRole('alert').getByRole('button', { name: 'Close' }).click().catch(() => {});
        const nextCampaign = await segmentSchedulePage.selectDifferentActiveCampaign(triedCampaigns);
        triedCampaigns.push(nextCampaign);
    }
}

/**
 * Extracts a bare "HH:mm" time token from a date/time string, regardless of the surrounding
 * date's format or ordering (e.g. "06/05/2026 16:32" or "5/6/2026, 4:32 PM" both contain a plain
 * HH:mm-style substring) — used to compare a time picked in the popup against the same time
 * echoed back by the table/popup afterward without depending on an exact date-format match.
 * Returns null if no HH:mm-shaped substring is found.
 */
function extractTimeHHmm(value: string): string | null {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hours = match[1].length === 1 ? `0${match[1]}` : match[1];
    return `${hours}:${match[2]}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-1 to TC-3 — Page Level Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Page Level Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
    });

    test('TC-1 Verify Segment Schedule page is accessible from Marketing menu', async ({ page, segmentSchedulePage }, testInfo) => {
        await expect(segmentSchedulePage.regionDropdown, 'Expected the region filter dropdown').toBeVisible();
        await expect(segmentSchedulePage.scheduleSegmentBtn, 'Expected the Schedule Segment button').toBeVisible();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-1_page_accessible');
        console.log('Segment Schedule page is accessible with all key elements visible.');
    });

    test('TC-2 Verify selecting a region loads the Segment Schedule table without error', async ({ page, segmentSchedulePage }, testInfo) => {
        await expect(segmentSchedulePage.segmentScheduleTable, 'Expected the Segment Schedule table to render after selecting a region').toBeVisible({ timeout: 15000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-2_region_loads_table');
        console.log('Selecting a region loaded the Segment Schedule table successfully.');
    });

    test('TC-3 Verify clicking Schedule Segment opens the popup with all 6 fields and 5 toggles', async ({ page, segmentSchedulePage }, testInfo) => {
        await openScheduleSegmentPopup(segmentSchedulePage);

        await expect(segmentSchedulePage.nameInput, 'Expected Name field').toBeVisible();
        await expect(segmentSchedulePage.descriptionInput, 'Expected Description field').toBeVisible();
        await expect(segmentSchedulePage.campaignDropdown, 'Expected Campaign field').toBeVisible();
        await expect(segmentSchedulePage.segmentDropdown, 'Expected Segment field').toBeVisible();
        await expect(segmentSchedulePage.scheduledDateInput, 'Expected Scheduled Date field').toBeVisible();
        await expect(segmentSchedulePage.expiryDateInput, 'Expected Expiry Date field').toBeVisible();

        await expect(segmentSchedulePage.sendEmailToggle, 'Expected Send Email toggle').toBeVisible();
        await expect(segmentSchedulePage.sendSmsToggle, 'Expected Send SMS toggle').toBeVisible();
        await expect(segmentSchedulePage.sendPushToggle, 'Expected Send Push toggle').toBeVisible();
        await expect(segmentSchedulePage.sendNotificationPanelToggle, 'Expected Send Notification Panel toggle').toBeVisible();
        await expect(segmentSchedulePage.dryRunToggle, 'Expected Dry Run toggle').toBeVisible();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule button').toBeVisible();
        await expect(segmentSchedulePage.dialogCancelBtn, 'Expected Cancel button').toBeVisible();

        await segmentSchedulePage.clickDialogCancel();
        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-3_popup_opens_with_all_fields');
        console.log('Schedule Segment popup opened with all 6 fields and 5 toggles visible.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-4 to TC-8 — Conditional Template Field Tests
//  None of these persist a segment — each ends by closing the popup (Cancel), so no cleanup.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Conditional Template Field Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
        await ensureAllChannelTogglesOff(segmentSchedulePage);
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        await segmentSchedulePage.clickDialogCancel().catch(() => {});
    });

    test('TC-4 Verify Email Template field appears only when Send Email is ON', async ({ page, segmentSchedulePage }, testInfo) => {
        expect(await segmentSchedulePage.isEmailTemplateVisible(), 'Expected Email Template hidden while Send Email is OFF').toBe(false);

        await segmentSchedulePage.ensureSendEmailOn(true);
        expect(await segmentSchedulePage.isEmailTemplateVisible(), 'Expected Email Template to appear once Send Email is ON').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-4_email_template_conditional');
    });

    test('TC-5 Verify SMS Template field appears only when Send SMS is ON', async ({ page, segmentSchedulePage }, testInfo) => {
        expect(await segmentSchedulePage.isSmsTemplateVisible(), 'Expected SMS Template hidden while Send SMS is OFF').toBe(false);

        await segmentSchedulePage.ensureSendSmsOn(true);
        expect(await segmentSchedulePage.isSmsTemplateVisible(), 'Expected SMS Template to appear once Send SMS is ON').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-5_sms_template_conditional');
    });

    test('TC-6 Verify Push Template field appears only when Send Push is ON', async ({ page, segmentSchedulePage }, testInfo) => {
        expect(await segmentSchedulePage.isPushTemplateVisible(), 'Expected Push Template hidden while Send Push is OFF').toBe(false);

        await segmentSchedulePage.ensureSendPushOn(true);
        expect(await segmentSchedulePage.isPushTemplateVisible(), 'Expected Push Template to appear once Send Push is ON').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-6_push_template_conditional');
    });

    test('TC-7 Verify Notification Panel Template field appears only when Send Notification Panel is ON', async ({ page, segmentSchedulePage }, testInfo) => {
        expect(await segmentSchedulePage.isNotificationPanelTemplateVisible(), 'Expected Notification Panel Template hidden while its toggle is OFF').toBe(false);

        await segmentSchedulePage.ensureSendNotificationPanelOn(true);
        expect(await segmentSchedulePage.isNotificationPanelTemplateVisible(), 'Expected Notification Panel Template to appear once its toggle is ON').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-7_notification_panel_template_conditional');
    });

    test('TC-8 Verify turning ON multiple toggles reveals all of their respective Template fields together', async ({ page, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.ensureSendEmailOn(true);
        await segmentSchedulePage.ensureSendSmsOn(true);
        await segmentSchedulePage.ensureSendPushOn(true);
        await segmentSchedulePage.ensureSendNotificationPanelOn(true);

        expect(await segmentSchedulePage.isEmailTemplateVisible(), 'Expected Email Template visible').toBe(true);
        expect(await segmentSchedulePage.isSmsTemplateVisible(), 'Expected SMS Template visible').toBe(true);
        expect(await segmentSchedulePage.isPushTemplateVisible(), 'Expected Push Template visible').toBe(true);
        expect(await segmentSchedulePage.isNotificationPanelTemplateVisible(), 'Expected Notification Panel Template visible').toBe(true);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-8_all_templates_together');
        console.log('All 4 conditional Template fields appeared together when their toggles were all ON.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-9 to TC-13 — Schedule Button Enablement Tests
//  None of these persist a segment (Schedule is never clicked) — no cleanup needed.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Schedule Button Enablement Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        await segmentSchedulePage.clickDialogCancel().catch(() => {});
    });

    test('TC-9 Verify Schedule stays disabled when all 4 notification-channel toggles are OFF, even with Dry Run ON and every other field filled', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC9_${Date.now()}`;
        await fillCoreMandatoryFields(segmentSchedulePage, name, 'No channel toggle enabled');
        await ensureAllChannelTogglesOff(segmentSchedulePage);

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to stay disabled with no notification channel selected').toBeDisabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-9_schedule_disabled_no_channel');
    });

    // TC-10 to TC-13: Schedule requires BOTH conditions together — all 6 mandatory fields filled
    // AND at least one notification-channel toggle ON. Each test proves the AND explicitly: the
    // toggle alone (with fields still empty) is asserted NOT enough to enable Schedule, and only
    // once the 6 fields are also filled does it become enabled.

    test('TC-10 Verify Schedule requires both all 6 fields filled AND Send Email ON (Send Email alone is not enough)', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC10_${Date.now()}`;
        await ensureAllChannelTogglesOff(segmentSchedulePage);
        await segmentSchedulePage.ensureSendEmailOn(true);
        await segmentSchedulePage.selectFirstEmailTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to stay disabled with Send Email ON but the 6 mandatory fields still empty').toBeDisabled();

        await fillCoreMandatoryFields(segmentSchedulePage, name, 'Email channel only');

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to become enabled once all 6 fields are filled with Send Email ON').toBeEnabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-10_schedule_enabled_email_only');
    });

    test('TC-11 Verify Schedule requires both all 6 fields filled AND Send SMS ON (Send SMS alone is not enough)', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC11_${Date.now()}`;
        await ensureAllChannelTogglesOff(segmentSchedulePage);
        await segmentSchedulePage.ensureSendSmsOn(true);
        await segmentSchedulePage.selectFirstSmsTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to stay disabled with Send SMS ON but the 6 mandatory fields still empty').toBeDisabled();

        await fillCoreMandatoryFields(segmentSchedulePage, name, 'SMS channel only');

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to become enabled once all 6 fields are filled with Send SMS ON').toBeEnabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-11_schedule_enabled_sms_only');
    });

    test('TC-12 Verify Schedule requires both all 6 fields filled AND Send Push ON (Send Push alone is not enough)', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC12_${Date.now()}`;
        await ensureAllChannelTogglesOff(segmentSchedulePage);
        await segmentSchedulePage.ensureSendPushOn(true);
        await segmentSchedulePage.selectFirstPushTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to stay disabled with Send Push ON but the 6 mandatory fields still empty').toBeDisabled();

        await fillCoreMandatoryFields(segmentSchedulePage, name, 'Push channel only');

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to become enabled once all 6 fields are filled with Send Push ON').toBeEnabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-12_schedule_enabled_push_only');
    });

    test('TC-13 Verify Schedule requires both all 6 fields filled AND Send Notification Panel ON (the toggle alone is not enough)', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC13_${Date.now()}`;
        await ensureAllChannelTogglesOff(segmentSchedulePage);
        await segmentSchedulePage.ensureSendNotificationPanelOn(true);
        await segmentSchedulePage.selectFirstNotificationPanelTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to stay disabled with Send Notification Panel ON but the 6 mandatory fields still empty').toBeDisabled();

        await fillCoreMandatoryFields(segmentSchedulePage, name, 'Notification Panel channel only');

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to become enabled once all 6 fields are filled with Send Notification Panel ON').toBeEnabled();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-13_schedule_enabled_notification_panel_only');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-14 to TC-18 — Successful Schedule Tests
//  Each of these actually clicks Schedule (as a Dry Run) so a real row is created — the shared
//  afterEach cancels it regardless of pass/fail so it doesn't pile up in the live table.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Successful Schedule Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
        createdName = undefined;
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        if (!createdName) return;
        const nameToCancel = createdName;
        createdName = undefined;
        await segmentSchedulePage.cancelSegmentScheduleIfPresent(nameToCancel);
    });

    test('TC-14 Verify scheduling a segment via Send Email succeeds as a Dry Run', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC14_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Email');
        createdName = name;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-14_schedule_email_success');
        console.log(`✅ TC-14 PASSED — Segment "${name}" scheduled successfully via Send Email (Dry Run).`);
    });

    test('TC-15 Verify scheduling a segment via Send SMS succeeds as a Dry Run', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC15_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'SMS');
        createdName = name;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-15_schedule_sms_success');
        console.log(`✅ TC-15 PASSED — Segment "${name}" scheduled successfully via Send SMS (Dry Run).`);
    });

    test('TC-16 Verify scheduling a segment via Send Push succeeds as a Dry Run', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC16_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Push');
        createdName = name;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-16_schedule_push_success');
        console.log(`✅ TC-16 PASSED — Segment "${name}" scheduled successfully via Send Push (Dry Run).`);
    });

    test('TC-17 Verify scheduling a segment via Send Notification Panel succeeds as a Dry Run', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC17_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Notification Panel');
        createdName = name;

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-17_schedule_notification_panel_success');
        console.log(`✅ TC-17 PASSED — Segment "${name}" scheduled successfully via Send Notification Panel (Dry Run).`);
    });

    test('TC-18 Verify scheduling a segment with all 4 notification channels enabled together succeeds as a Dry Run', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC18_${Date.now()}`;
        await fillCoreMandatoryFields(segmentSchedulePage, name, 'All channels together');

        await segmentSchedulePage.ensureSendEmailOn(true);
        await segmentSchedulePage.selectFirstEmailTemplate();
        await segmentSchedulePage.ensureSendSmsOn(true);
        await segmentSchedulePage.selectFirstSmsTemplate();
        await segmentSchedulePage.ensureSendPushOn(true);
        await segmentSchedulePage.selectFirstPushTemplate();
        await segmentSchedulePage.ensureSendNotificationPanelOn(true);
        await segmentSchedulePage.selectFirstNotificationPanelTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to be enabled with all 4 channels ON').toBeEnabled({ timeout: 10000 });
        await segmentSchedulePage.clickSchedule();
        createdName = name;

        const toastText = page.locator('.p-toast-message-text').first();
        await expect(toastText, 'Expected a toast confirming the segment was scheduled').toBeVisible({ timeout: 15000 });
        console.log('Schedule Segment toast message:', await toastText.textContent());

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-18_schedule_all_channels_success');
        console.log(`✅ TC-18 PASSED — Segment "${name}" scheduled successfully with all 4 channels enabled (Dry Run).`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-19 to TC-21 — Field Interaction Tests
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Field Interaction Tests', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        await segmentSchedulePage.clickDialogCancel().catch(() => {});
    });

    test('TC-19 Verify selecting a Scheduled Date closes its own calendar via the Expiry Date field click, and does not clear the Scheduled Date value', async ({ page, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.setScheduledDate();

        const scheduledDateValue = await segmentSchedulePage.scheduledDateInput.inputValue();
        expect(scheduledDateValue, 'Expected Scheduled Date to retain the picked value after Expiry Date was clicked to dismiss the calendar').not.toBe('');

        const scheduledPanel = page.locator('#scheduledDate_panel');
        await expect(scheduledPanel, 'Expected the Scheduled Date calendar to be closed').toBeHidden();

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-19_scheduled_date_dismiss');
    });

    test('TC-20 Verify Expiry Date can be set after Scheduled Date and is later than it', async ({ page, segmentSchedulePage }, testInfo) => {
        await segmentSchedulePage.setScheduledDate();
        await segmentSchedulePage.setExpiryDate();

        const scheduledDateValue = await segmentSchedulePage.scheduledDateInput.inputValue();
        const expiryDateValue = await segmentSchedulePage.expiryDateInput.inputValue();
        expect(expiryDateValue, 'Expected Expiry Date to have a value').not.toBe('');
        expect(expiryDateValue, 'Expected Expiry Date to differ from Scheduled Date').not.toBe(scheduledDateValue);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-20_expiry_date_after_scheduled');
    });

    test('TC-21 Verify Campaign and Segment dropdowns can each be populated with a real value', async ({ page, segmentSchedulePage }, testInfo) => {
        const campaign = await segmentSchedulePage.selectFirstCampaign();
        const segment = await segmentSchedulePage.selectFirstSegment();

        expect(campaign, 'Expected a Campaign to be selected').not.toBe('');
        expect(segment, 'Expected a Segment to be selected').not.toBe('');
        console.log(`Selected Campaign: "${campaign}", Segment: "${segment}"`);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-21_campaign_segment_selection');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-22 — Popup Cancel Test
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Popup Cancel Test', () => {

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
    });

    test('TC-22 Verify Cancel on the popup discards the form without scheduling anything', async ({ page, segmentSchedulePage }, testInfo) => {
        await openScheduleSegmentPopup(segmentSchedulePage);
        await segmentSchedulePage.fillName(`SegSchedule_TC22_${Date.now()}`);
        await segmentSchedulePage.fillDescription('Should be discarded');

        await segmentSchedulePage.clickDialogCancel();
        await expect(segmentSchedulePage.popupDialog, 'Expected the popup to close after Cancel').not.toBeVisible({ timeout: 10000 });

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-22_popup_cancel_discards');
        console.log('Cancel on the popup correctly discarded the form without scheduling.');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-23 — Edit Tests
//  Schedules a real Dry Run segment, edits it, then explicitly cancels it as part of the test
//  itself. The shared afterEach cancels it again defensively (a no-op once the explicit cancel
//  step already succeeded, since cancelSegmentScheduleIfPresent checks row visibility first) so
//  it never piles up in the live table even if an earlier assertion fails.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Edit Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
        createdName = undefined;
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        if (!createdName) return;
        const nameToCancel = createdName;
        createdName = undefined;
        await segmentSchedulePage.cancelSegmentScheduleIfPresent(nameToCancel);
    });

    test('TC-23 Verify editing a scheduled segment opens it pre-filled, saves the change, and it can then be cancelled', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC23_${Date.now()}`;
        // Set BEFORE scheduling (not after) so the afterEach can still cancel the row if the
        // create actually succeeded but a later assertion in this helper throws — otherwise a
        // throw here would skip createdName entirely and leave the row stuck un-cancelled.
        createdName = name;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Email');

        const originalCampaignName = await segmentSchedulePage.getRowCampaignNameText(name);

        await segmentSchedulePage.clickEditForRow(name);
        const prefilledName = await segmentSchedulePage.getNameValue();
        expect(prefilledName, 'Expected the Edit popup to reopen pre-filled with the same Name').toBe(name);

        const originalScheduledDateValue = await segmentSchedulePage.scheduledDateInput.inputValue();
        const originalExpiryDateValue = await segmentSchedulePage.expiryDateInput.inputValue();

        // Renamed (not just Description changed) — confirmed live that saving an edit while
        // resubmitting the exact same Name trips a "duplicate name is not allowed" rejection (the
        // app's uniqueness check doesn't exclude the record's own current name), so the edit needs
        // a genuinely new Name to succeed.
        const editedName = `${name}_edited`;
        await segmentSchedulePage.fillName(editedName);
        await segmentSchedulePage.fillDescription('Edited via automation');

        // Also shift Scheduled Date and Expiry Date forward by 2 hours, so the edit changes the
        // date/time fields too, not just Name/Description/Campaign.
        await segmentSchedulePage.shiftScheduledTimeByHours(2);
        await segmentSchedulePage.shiftExpiryTimeByHours(2);

        // Same rejection applies to Campaign — resubmitting with the same Campaign it already has
        // is also rejected as a duplicate, so a different one must be selected during edit too.
        let newCampaignName = await segmentSchedulePage.selectDifferentActiveCampaign(originalCampaignName);
        console.log(`Changed Campaign from "${originalCampaignName}" to "${newCampaignName}" during edit.`);
        createdName = editedName; // the row now exists under the new Name — cleanup must target that

        // Confirmed live: the Edit popup is titled "Update Segment" and its submit button reads
        // "Save" — distinct from Create's "Schedule" button, hence the dedicated saveBtn/clickSaveEdit().
        // Same self-clearing scheduling-collision conflicts as create() can also surface here (this
        // Campaign already has a Pending entry too close in time/name to the new one) — retry with
        // yet another Campaign rather than failing outright, same as scheduleWithSingleChannel does.
        const triedCampaignsForEdit = [originalCampaignName, newCampaignName];
        const MAX_EDIT_ATTEMPTS = 5;
        for (let attempt = 1; attempt <= MAX_EDIT_ATTEMPTS; attempt++) {
            await expect(segmentSchedulePage.saveBtn, "Expected the Edit popup's Save button to be enabled").toBeEnabled({ timeout: 10000 });
            await segmentSchedulePage.clickSaveEdit();
            const { ok, text } = await waitForScheduleOutcome(page);

            if (ok) {
                console.log('Edit Segment Schedule toast message:', text);
                break;
            }

            const isSchedulingCollision = !!text && (
                /already exists for this segmentation group/i.test(text) ||
                /must be \d+ hour[s]? away from existing scheduled date/i.test(text)
            );
            if (!isSchedulingCollision || attempt === MAX_EDIT_ATTEMPTS) {
                throw new Error(
                    text
                        ? `Expected the segment update to succeed, but got: "${text}"`
                        : 'Expected a confirmation that the segment was updated, but none appeared within 15s.'
                );
            }

            console.log(`Campaign "${newCampaignName}" collides with an existing scheduled entry (${text}) during edit — retrying with a different Campaign (attempt ${attempt + 1}/${MAX_EDIT_ATTEMPTS})...`);
            await page.getByRole('alert').getByRole('button', { name: 'Close' }).click().catch(() => {});
            newCampaignName = await segmentSchedulePage.selectDifferentActiveCampaign(triedCampaignsForEdit);
            triedCampaignsForEdit.push(newCampaignName);
        }

        // Re-open the segment via Edit a second time to confirm the changes actually persisted,
        // rather than trusting the success toast alone.
        await segmentSchedulePage.clickEditForRow(editedName);
        const reopenedName = await segmentSchedulePage.getNameValue();
        const reopenedDescription = await segmentSchedulePage.getDescriptionValue();
        const reopenedCampaign = await segmentSchedulePage.getCampaignValue();
        const reopenedScheduledDateValue = await segmentSchedulePage.scheduledDateInput.inputValue();
        const reopenedExpiryDateValue = await segmentSchedulePage.expiryDateInput.inputValue();

        expect(reopenedName, 'Expected the re-opened Name to reflect the edit').toBe(editedName);
        expect(reopenedDescription, 'Expected the re-opened Description to reflect the edit').toBe('Edited via automation');
        expect(reopenedCampaign, 'Expected the re-opened Campaign to reflect the edit').toBe(newCampaignName);
        expect(reopenedScheduledDateValue, `Expected the re-opened Scheduled Date ("${reopenedScheduledDateValue}") to differ from the original ("${originalScheduledDateValue}") after shifting it by 2 hours`).not.toBe(originalScheduledDateValue);
        expect(reopenedExpiryDateValue, `Expected the re-opened Expiry Date ("${reopenedExpiryDateValue}") to differ from the original ("${originalExpiryDateValue}") after shifting it by 2 hours`).not.toBe(originalExpiryDateValue);

        await segmentSchedulePage.clickDialogCancel();

        await segmentSchedulePage.cancelSegmentScheduleIfPresent(editedName);
        await expect.poll(
            () => segmentSchedulePage.isRowStatusCancelled(editedName),
            { message: `Expected "${editedName}"'s Status to become "Cancelled" after cancelling it`, timeout: 15000 }
        ).toBe(true);
        createdName = undefined; // already cancelled above — afterEach doesn't need to repeat it

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-23_edit_then_cancel');
        console.log(`✅ TC-23 PASSED — Segment "${name}" was scheduled, edited to "${editedName}", and then successfully cancelled.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-26 to TC-29 — Approve / Decline Tests
//  Each schedules a real Dry Run segment, exercises Approve or Decline through its Yes/No
//  confirmation, and observes the resulting toast (Yes) or lack of change (No). The shared
//  afterEach cancels the segment regardless of pass/fail, same as every other describe block in
//  this file — cancelSegmentScheduleIfPresent is defensive (checks row visibility, tolerates a
//  disabled/absent Cancel button) so it's a safe no-op if Approve/Decline turns out to leave the
//  row in a terminal state that no longer allows cancelling.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Approve/Decline Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
        createdName = undefined;
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        if (!createdName) return;
        const nameToCancel = createdName;
        createdName = undefined;
        await segmentSchedulePage.cancelSegmentScheduleIfPresent(nameToCancel);
    });

    test('TC-26 Verify Approve followed by Yes confirms the segment and shows a success toast', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC26_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Email');
        createdName = name;

        await segmentSchedulePage.clickApproveForRow(name);
        await expect(segmentSchedulePage.confirmYesBtn, 'Expected a Yes/No confirmation after clicking Approve').toBeVisible({ timeout: 10000 });
        await segmentSchedulePage.clickConfirmYes();

        const { ok, text } = await waitForScheduleOutcome(page);
        expect(ok, `Expected a SUCCESS toast confirming the segment was approved, but got: "${text}"`).toBe(true);
        console.log('Approve toast message:', text);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-26_approve_yes_success');
        console.log(`✅ TC-26 PASSED — Segment "${name}" was approved successfully.`);
    });

    test('TC-27 Verify Approve followed by No leaves the segment unchanged', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC27_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Email');
        createdName = name;

        const reviewStatusBefore = await segmentSchedulePage.getRowReviewStatusText(name);

        await segmentSchedulePage.clickApproveForRow(name);
        await expect(segmentSchedulePage.confirmNoBtn, 'Expected a Yes/No confirmation after clicking Approve').toBeVisible({ timeout: 10000 });
        await segmentSchedulePage.clickConfirmNo();

        await expect(segmentSchedulePage.confirmNoBtn, 'Expected the confirmation modal to close after No').not.toBeVisible({ timeout: 10000 });
        const reviewStatusAfter = await segmentSchedulePage.getRowReviewStatusText(name);
        expect(reviewStatusAfter, 'Expected Review Status to stay unchanged after declining the Approve confirmation').toBe(reviewStatusBefore);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-27_approve_no_unchanged');
        console.log(`✅ TC-27 PASSED — Clicking No on the Approve confirmation left segment "${name}" unchanged.`);
    });

    test('TC-28 Verify Decline followed by Yes declines the segment and shows a success toast', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC28_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Email');
        createdName = name;

        await segmentSchedulePage.clickDeclineForRow(name);
        await expect(segmentSchedulePage.confirmYesBtn, 'Expected a Yes/No confirmation after clicking Decline').toBeVisible({ timeout: 10000 });
        await segmentSchedulePage.clickConfirmYes();

        const { ok, text } = await waitForScheduleOutcome(page);
        expect(ok, `Expected a SUCCESS toast confirming the segment was declined, but got: "${text}"`).toBe(true);
        console.log('Decline toast message:', text);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-28_decline_yes_success');
        console.log(`✅ TC-28 PASSED — Segment "${name}" was declined successfully.`);
    });

    test('TC-29 Verify Decline followed by No leaves the segment unchanged', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC29_${Date.now()}`;
        await scheduleWithSingleChannel(page, segmentSchedulePage, name, 'Email');
        createdName = name;

        const reviewStatusBefore = await segmentSchedulePage.getRowReviewStatusText(name);

        await segmentSchedulePage.clickDeclineForRow(name);
        await expect(segmentSchedulePage.confirmNoBtn, 'Expected a Yes/No confirmation after clicking Decline').toBeVisible({ timeout: 10000 });
        await segmentSchedulePage.clickConfirmNo();

        await expect(segmentSchedulePage.confirmNoBtn, 'Expected the confirmation modal to close after No').not.toBeVisible({ timeout: 10000 });
        const reviewStatusAfter = await segmentSchedulePage.getRowReviewStatusText(name);
        expect(reviewStatusAfter, 'Expected Review Status to stay unchanged after declining the Decline confirmation').toBe(reviewStatusBefore);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-29_decline_no_unchanged');
        console.log(`✅ TC-29 PASSED — Clicking No on the Decline confirmation left segment "${name}" unchanged.`);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  TC-24 to TC-25 — Date/Time Persistence Tests
//  Verifies the time picked in Scheduled Date / Expiry Date is actually what gets saved, not
//  silently shifted/defaulted/truncated. Scheduled Date's saved time is checked via the table row
//  (the only place it's displayed); Expiry Date has no table column, so it's checked by
//  re-opening the segment via Edit and reading the field's value again.
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Segment Schedule - Date/Time Persistence Tests', () => {
    let createdName: string | undefined;

    test.beforeEach(async ({ page, sidebarPage, segmentSchedulePage }) => {
        await navigateToSegmentSchedule(page, sidebarPage, segmentSchedulePage);
        await openScheduleSegmentPopup(segmentSchedulePage);
        createdName = undefined;
    });

    test.afterEach(async ({ segmentSchedulePage }) => {
        if (!createdName) return;
        const nameToCancel = createdName;
        createdName = undefined;
        await segmentSchedulePage.cancelSegmentScheduleIfPresent(nameToCancel);
    });

    test('TC-24 Verify the Scheduled Date time picked in the popup is saved correctly and reflected in the table', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC24_${Date.now()}`;
        await segmentSchedulePage.fillName(name);
        await segmentSchedulePage.fillDescription('Verify Scheduled Date time persistence');
        await segmentSchedulePage.selectFirstCampaign();
        await segmentSchedulePage.selectFirstSegment();
        await segmentSchedulePage.setScheduledDate();
        await segmentSchedulePage.setExpiryDate();
        await segmentSchedulePage.ensureDryRunOn(true);

        // Captured BEFORE saving — the popup closes on success and this field won't be readable
        // afterward, so this is the only chance to record what was actually set.
        const setScheduledDateValue = await segmentSchedulePage.scheduledDateInput.inputValue();
        console.log('Scheduled Date set in popup:', setScheduledDateValue);

        await ensureAllChannelTogglesOff(segmentSchedulePage);
        await segmentSchedulePage.ensureSendEmailOn(true);
        await segmentSchedulePage.selectFirstEmailTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to be enabled').toBeEnabled({ timeout: 10000 });
        await segmentSchedulePage.clickSchedule();
        createdName = name;

        const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(toastText, 'Expected a SUCCESS toast confirming the segment was scheduled').toBeVisible({ timeout: 15000 });

        const expectedTime = extractTimeHHmm(setScheduledDateValue);
        expect(expectedTime, `Expected the Scheduled Date field's value ("${setScheduledDateValue}") to contain a recognizable HH:mm time`).not.toBeNull();

        const rowScheduledDateText = await segmentSchedulePage.getRowScheduledDateText(name);
        console.log('Scheduled Date shown in table row:', rowScheduledDateText);
        const savedTime = extractTimeHHmm(rowScheduledDateText);

        expect(savedTime, `Expected the table row's Scheduled Date time ("${rowScheduledDateText}") to match what was set in the popup ("${setScheduledDateValue}")`).toBe(expectedTime);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-24_scheduled_time_saved_correctly');
        console.log(`✅ TC-24 PASSED — Scheduled time "${expectedTime}" was saved and displayed correctly.`);
    });

    test('TC-25 Verify the Expiry Date time picked in the popup is saved correctly (round-tripped via Edit)', async ({ page, segmentSchedulePage }, testInfo) => {
        const name = `SegSchedule_TC25_${Date.now()}`;
        await segmentSchedulePage.fillName(name);
        await segmentSchedulePage.fillDescription('Verify Expiry Date time persistence');
        await segmentSchedulePage.selectFirstCampaign();
        await segmentSchedulePage.selectFirstSegment();
        await segmentSchedulePage.setScheduledDate();
        await segmentSchedulePage.setExpiryDate();
        await segmentSchedulePage.ensureDryRunOn(true);

        const setExpiryDateValue = await segmentSchedulePage.expiryDateInput.inputValue();
        console.log('Expiry Date set in popup:', setExpiryDateValue);

        await ensureAllChannelTogglesOff(segmentSchedulePage);
        await segmentSchedulePage.ensureSendEmailOn(true);
        await segmentSchedulePage.selectFirstEmailTemplate();

        await expect(segmentSchedulePage.scheduleBtn, 'Expected Schedule to be enabled').toBeEnabled({ timeout: 10000 });
        await segmentSchedulePage.clickSchedule();
        createdName = name;

        const toastText = page.locator('.p-toast-message-success, [data-p-severity="success"]').first();
        await expect(toastText, 'Expected a SUCCESS toast confirming the segment was scheduled').toBeVisible({ timeout: 15000 });

        await segmentSchedulePage.clickEditForRow(name);
        const reopenedExpiryDateValue = await segmentSchedulePage.expiryDateInput.inputValue();
        console.log('Expiry Date shown when reopened via Edit:', reopenedExpiryDateValue);
        await segmentSchedulePage.clickDialogCancel().catch(() => {});

        const expectedTime = extractTimeHHmm(setExpiryDateValue);
        expect(expectedTime, `Expected the Expiry Date field's value ("${setExpiryDateValue}") to contain a recognizable HH:mm time`).not.toBeNull();
        const savedTime = extractTimeHHmm(reopenedExpiryDateValue);

        expect(savedTime, `Expected the re-opened Expiry Date time ("${reopenedExpiryDateValue}") to match what was originally set ("${setExpiryDateValue}")`).toBe(expectedTime);

        await CommonUtils.captureScreenshot(page, testInfo, 'reports/screenshots', 'TC-25_expiry_time_saved_correctly');
        console.log(`✅ TC-25 PASSED — Expiry time "${expectedTime}" was saved and displayed correctly.`);
    });
});

# Video → test

Record yourself running a test case in PureVantage, and get test code back in this repo's format
(locators → page object → baseFixture → spec with `TC_` ids).

## Use

1. Connect to the VPN and make sure your session is fresh (`npm run auth` if tests are bouncing to SSO).
2. Save the screen recording (MP4) to `recordings/`, e.g. `recordings/recurring-rewards-create-weekly.mp4`.
3. In Claude Code on this repo:

   ```
   /video-to-test recordings/recurring-rewards-create-weekly.mp4
   ```

   Optionally add the module name and TC prefix: `/video-to-test recordings/x.mp4 "Recurring Rewards" TC_RR`.

Claude extracts key frames, writes the steps to `recordings/work/<name>/steps.md`, reads the real DOM
with your saved session, then writes or extends the locators, page object, fixture, sidebar entry and
spec, and runs the new test until it passes.

## Recording tips

- Start from the home page and click through the **sidebar**, so the navigation path is in the video.
- Pause ~1 second on everything you're verifying (toast, validation message, row in the table, disabled Save).
- One test case per recording, or say out loud / note in the file name if it covers several.
- Record at normal speed. Avoid scrolling past things quickly.

## Helpers

| Command | What it does |
|---|---|
| `npm run frames -- recordings/x.mp4 [--fps 4]` | Extract key frames + timestamps |
| `npm run snapshot -- "Cashback Promotions"` | Print the live page's elements (ids, labels, PrimeNG classes) |
| `npm run snapshot -- "Recurring Rewards" --click "Create Configuration" --scope dialog` | Same, for a popup (read-only: refuses Save/Delete/Yes) |

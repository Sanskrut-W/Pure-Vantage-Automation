# TC-1 Verify a Single registration simulation succeeds with all mandatory fields filled
Module: Workflow Management → Simulate Registration   (NEW — no page object; sibling specs SimulateOpt-in / simulatebet are self-contained)
TC prefix: TC-1 (from --tc)
URL: /main/component-display/stencil-workflow-management/simulate-registration

| # | Time | Action | Target | Data | Expected result |
|---|------|--------|--------|------|-----------------|
| 1 | 0.0–5.0 | Click sidebar | Workflow Management → Simulate Registration | | Page "Simulate Registration" opens on Single tab with 8 fields, Simulate disabled, Reset Form |
| 2 | 10.5–12.0 | Generate a UUID in an external tool (guidgenerator) and copy it | | | |
| 3 | 14.0 | Click into empty Player Account ID | Player Account ID * | | Red "Field must be a valid UUID" |
| 4 | 15.5 | Paste UUID | Player Account ID * | 770b9a91-5cea-4388-a9fa-c89cbe50a39a | Error clears |
| 5 | 19–21.5 | Type | First Name * | fghjk | |
| 6 | 22–23 | Type | Last Name * | sdfg | |
| 7 | 24–25.5 | Type | Mobile * | 987654333 | |
| 8 | 26.5–28.5 | Type partial email | Email * | hgbfv@ | Red "Field must be a valid email" |
| 9 | 29.5–32 | Finish email | Email * | hgbfv@g,ail.com | Error clears |
| 10 | 33–34 | Open dropdown, pick option | Region * | Betway Botswana | Region shows "Betway Botswana" |
| 11 | 35–38 | Type | Referral Code * | 12345fdsa | |
| 12 | 38.5–40 | Type | Sign Up Code * | dsfdgfgr321 | Simulate becomes enabled |
| 13 | 40.5–44 | Click | Simulate | | Spinner on Simulate |
| 14 | 50.5–54.5 | — | Toast + form | | Toast "Success / Registration simulated successfully"; all fields cleared; Simulate disabled again |

## Uncertainties
- The tester's email "hgbfv@g,ail.com" (comma) was accepted as valid by the app — the test uses a well-formed email instead. Possible validation gap worth a separate check.
- The external GUID generator is replaced by `crypto.randomUUID()`.
- Inline error selector `small.p-error` is taken from the sibling Simulate Opt-in spec (confirmed live there), not probed on this page.
- Region "Betway Botswana" is used exactly as recorded.

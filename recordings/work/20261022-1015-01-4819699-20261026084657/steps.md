# Edit Bulk Comp — enable Send SMS with an SMS template and Save
Module: Marketing → Marketing Comps → Comp Bulk   (existing: pages/CompsBulkPage.ts)
TC prefix: TC- (existing spec tests/compbulk.spec.ts, last id TC-47)

| # | Time | Action | Target | Data | Expected result |
|---|------|--------|--------|------|-----------------|
| 1 | 0.0s | Page already open | Comp Bulk list (`/main/component-display/stencil-comps/comp-bulk`) | — | Table visible |
| 2 | 1.5s | Click row "⋮" menu | First row ("Mane", TopUpTuesday_Casino_F, BW, Starting) | — | Menu: Edit / Review / Reprocess / Configurations / Payout Errors / Payouts / Delete |
| 3 | 3.0s | Click Edit | Row menu | — | "Edit Bulk Comp" dialog opens, Description "Mane", Comp Code pre-filled, Region Code loads to "BW" |
| 4 | 5.0s | Type in | Bulk Comp Description | "Maneee" | Value updated |
| 5 | 7.0s | Tick checkbox | Send SMS | — | "SMS Message Template" dropdown appears |
| 6 | 8.5s | Open dropdown, pick option | SMS Message Template | "Name1234567u" (first option) | Template selected |
| 7 | 11.5s | Click | Save | — | (expected) success toast, dialog closes |
| 8 | 12.5s | — | Toast | — | **Actual: error toast "Error — Error saving bulk comp"; dialog stays open** |
| 9 | 18–35s | Opens DevTools → Network, clicks Save again | — | — | `POST https://dev-gatewayapi.osiristrading.net/compsapi/api/v1/Bulk/Edit` → **400 Bad Request**, same error toast |

## Uncertainties
- The recording is a bug reproduction: Save on Edit with Send SMS + template returns 400 / "Error saving bulk comp". The test asserts the *expected* behavior (success toast, dialog closes, updated row), so it will fail while the bug exists.
- The recording edits a shared row ("Mane", status Starting). The test creates its own `AutoBulkComp_…` bulk comp (CSV route, as in TC-6) and edits that instead. If the 400 only happens for rows in "Starting" status, the fresh row (Uploading/AwaitingApproval) may not reproduce it.
- Success toast text is unknown (never shown in the recording) — asserted by success severity, plus the specific error toast "Error saving bulk comp" must not appear.
- SMS template: the recording picked the first option ("Name1234567u"); the test picks the first option too.

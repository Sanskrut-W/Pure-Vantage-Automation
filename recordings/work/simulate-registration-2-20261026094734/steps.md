# TC-2 Verify a Bulk registration simulation succeeds and the form resets
Module: Workflow Management → Simulate Registration   (existing: tests/SimulateRegisteration.spec.ts, self-contained helpers)
TC prefix: TC-

| # | Time | Action | Target | Data | Expected result |
|---|------|--------|--------|------|-----------------|
| 1 | 0.0–3.0s | Click sidebar | Workflow Management → Simulate Registration | | Simulate Registration page opens on the Single tab |
| 2 | 5.0–6.0s | Click toggle | Bulk | | Bulk form: Number of Simulations (1–10000) * = 10,000, Region *, Referral Code *, Sign Up Code *, Simulate (disabled), Reset Form |
| 3 | 7.0–8.0s | Clear + type | Number of Simulations | 100 | Field shows 100 |
| 4 | 9.0–11.5s | Open dropdown, pick option | Region * | Betway Agents | Region shows "Betway Agents" |
| 5 | 13.0–14.0s | Type | Referral Code * | sdfgn | |
| 6 | 14.5–15.0s | Type | Sign Up Code * | nhfd | Simulate becomes enabled |
| 7 | 16.0–16.5s | Click | Simulate | | Button shows a spinner |
| 8 | 18.0–20.5s | Observe | Toast | | "Success — Bulk registrations simulated successfully" |
| 9 | 18.0–21.0s | Observe | Form | | Form resets: Number of Simulations back to 10,000, Region placeholder, codes empty, Simulate disabled |

## Uncertainties
- Referral/Sign Up codes in the recording ("sdfgn", "nhfd") are throwaway text; the test uses fixed constants of the same shape.
- The test really submits 100 simulated registrations to the shared dev environment each run (same as the recording).
- Toast text read from a small, partly blurred frame: "Bulk registrations simulated successfully".

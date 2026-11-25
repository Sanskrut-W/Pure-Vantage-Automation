# TC_RR_24 Verify a Sport Requirement can be created for a new Recurring Reward
Module: Marketing → Recurring Rewards → (row ⋯) Sports Requirements   (existing: pages/RecurringRewardsPage.ts)
TC prefix: TC_RR

| # | Time | Action | Target | Data | Expected result |
|---|------|--------|--------|------|-----------------|
| 1 | 0–4s | Sidebar click | Marketing → Recurring Rewards | | Recurring Rewards list loads |
| 2 | 10s | Click | Create Configuration | | "Create New Recurring Reward" popup opens |
| 3 | 14s | Type | Promotion Name | `QFG` | |
| 4 | 16s | Dropdown | Region Code | Betway Botswana | |
| 5 | 18s | Date picker | Start Date | today (2026/10/26 15:29) | |
| 6 | 22–26s | Date picker | End Date | 2026/11/30 15:29 | |
| 7 | 26s | Dropdown | Recurring Frequency | Daily | |
| 8 | 28s | Type | Wager Amount Requirement | 23 | Save enabled |
| 9 | 30s | Click | Save | | Toast "Success – Recurring reward created successfully"; row QFG at top |
| 10 | 34–36s | Row ⋯ menu | QFG → Sports Requirements | | Menu: Edit, Clone, Approve, Sports Requirements, Casino Requirements, Comp Configuration, Notifications, Delete |
| 11 | 38s | — | | | "Recurring Rewards Sport" page, "No Sport Requirements Found" |
| 12 | 40s | Click | Create Sport Requirement | | "Create Sport Requirement" popup opens |
| 13 | 42s | Dropdown | Feed Name | mockfeed1 | |
| 14 | 44–48s | Dropdown (chevron) | Sport | Soccer | Tip text changes; League/Country/Event/Market become dropdowns |
| 15 | 50s | Dropdown | League | Premier League | |
| 16 | 52s | Dropdown | Country | Afghanistan | |
| 17 | 54s | Dropdown | Bet Slip Type * | Wager | Save becomes enabled |
| 18 | 56s | Dropdown | Event | 2026-10-26 - England - Manchester United vs Arsenal (1st option) | |
| 19 | 58–62s | Dropdown | Market | Match Result | |
| 20 | 64–70s | Type | Minimum Betslip Odds / Minimum Legs Required / Minimum Leg Odds Multiplier | 2 / 1 / 2 | |
| 21 | 72–76s | Toggle | Single Leg Only, Apply Odds And Multiplier To Legs In Total | on, on | |
| 22 | 78s | Click | Save | | Toast "Success – Sport Requirement created successfully"; row Soccer / Afghanistan / Premier League / event / Match Result / 2 / 1 / Single Leg Only on / Wager |
| 23 | 84–86s | Click | Back (‹) button | | Back on Recurring Rewards list |
| 24 | 90–94s | Row ⋯ menu → Delete → Yes | QFG | | "Delete Recurring Reward" confirm; toast `Successfully deleted reward "QFG"`; row gone |

## Uncertainties
- Event options are mock fixtures dated today ("2026-10-26 - …"); the test picks the first Event option instead of hardcoding the dated label.
- End Date: recording picked 2026/11/30; the test reuses the existing `setEndDate()` helper (today), which is the same as TC_RR_17. The value doesn't matter for this check.
- Region Code: recording picked "Betway Botswana"; the test uses the existing `selectFirstRegionCode()` ("pick any" choice).
- Promotion Name "QFG" → `AutoRecurringReward_<timestamp>`; Wager Amount 23 → helper's 10.
- The two switches have no ids; they're located by order inside the dialog (Single Leg Only = 1st, Apply Odds… = 2nd), confirmed live.
- Deleting the reward is assumed to remove its Sport Requirement too (the recording does exactly that and the app reports success).

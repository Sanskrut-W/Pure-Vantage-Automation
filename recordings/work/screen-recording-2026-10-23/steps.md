# Verify SMS template body is kept when Notification Delivery is switched to Push
Module: Marketing → Notification Management → Message Templates   (existing: pages/MessageTemplatesPage.ts)
TC prefix: TC- (next free: TC-28)

| # | Time | Action | Target | Data | Expected result |
|---|------|--------|--------|------|-----------------|
| 1 | 0.0s | View list | Region filter | Betway Botswana | Templates listed; TANAY is SMS / InGame |
| 2 | 2.0s | Click | Config on TANAY | – | Configure Template popup (SMS textarea, culture English (en-US)) |
| 3 | 4.5–29s | Type | SMS body textarea | "Hi, I am Tanay. I work at Zensar." | Character counter updates |
| 4 | 30.0s | Click | Save | – | Toast "Success — Config saved in template successfully" |
| 5 | 33.0s | Click | Edit on TANAY | – | Update Message Template popup, Notification Delivery = SMS Notification |
| 6 | 34–36s | Select | Notification Delivery | Push Notification | – |
| 7 | 37.0s | Click | Save | – | Toast "Success — Template saved successfully"; Type column = Push |
| 8 | 41.0s | Click | Config on TANAY | – | Push layout (Quill editor, Header Text, CTAs, Firebase settings) |
| 9 | 43–49s | Select text | Editor | – | Editor shows "Hi, I am Tanay. I work at Zensar." (body carried over) |

## Uncertainties
- Recording edits a shared template (TANAY); the test uses its own AutoTest_TC28_ template and deletes it.
- New templates have no culture: SMS textarea is disabled until English (en-US) is picked (confirmed live).
- Typed text has a stray cursor jump ("I w</p>ork at Zensar."); the test uses the intended sentence.

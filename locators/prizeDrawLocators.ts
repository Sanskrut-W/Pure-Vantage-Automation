// ═══════════════════════════════════════════════════════════════════════════════
// PRIZE DRAW — new feature (Workflow Management -> Prize Draw), built from the user's functional
// description plus outerHTML confirmed live for: the "Create Prize" button, the popup's 4 base
// fields (Promotion Name, Total Prize Positions, Chance To Win, Type), the "Add Configuration"
// button, a single Configuration block's 6 fields (Prize Type, Number Of Winners, Lower Position,
// Upper Position, Value, Chance) plus its own delete (trash) button, the running "Total Chance"
// validation message, the Save button, the list page's Delete + confirm-Yes buttons, and the
// search bar.
//
// Confirmed live (captured outerHTML of a freshly opened, still-empty popup, before anything is
// typed): every field already renders with its error message visible — "Field is required" for
// Promotion Name and Prize Type, "Field must not be a number less than 1" for Total Prize
// Positions/Chance To Win/Number Of Winners/Lower Position/Upper Position/Chance, but "Field must
// not be a number less than 0" for Value specifically — NOT "less than 1" like the others, despite
// the user's own functional summary grouping Value in with the "doesn't accept less than 1" set.
// Trusting the live markup over the paraphrased summary here per project convention. Chance also
// carries a confirmed max="100"/aria-valuemax="100" on its <input>.
//
// Flagged assumptions (not independently confirmed live — repeated as comments at point of use):
//  - The list page's table itself (row markup, columns beyond the 4 named) was never captured —
//    assumed to follow this app's universal `.pure__table` wrapper convention (same assumption
//    BetPromotionRulesPage/TimedPromotionsPage make for their own list pages).
//  - The row-level Delete action: the user supplied a standalone "Delete" button (aria-label
//    "Delete", class `marginl-3` — suggesting it sits next to another button rather than alone in
//    a table cell) together with a ConfirmDialog "Yes" button. Treated as the row's own direct
//    delete action (this app's confirmed convention elsewhere, e.g. Hourly/Prize Configuration),
//    with the kebab "..." menu fallback other list pages use kept as a defensive second attempt.
//  - "Number Of Winners must not exceed Total Prize Positions" and "Total Chance must equal 100%"
//    are both stated validation RULES, but their exact trigger point (inline on blur vs. only on
//    Save) and exact wording for the Number-of-Winners rule were not captured — only the Total
//    Chance message's exact wording was ("Total Chance must equal 100%. Current total: X%").
// ═══════════════════════════════════════════════════════════════════════════════

export const prizeDrawLocators = {
    buttonCreatePrize: 'Create Prize',
    buttonAddConfiguration: 'Add Configuration',
    buttonSave: 'Save',
    buttonDelete: 'Delete',
    buttonYes: 'Yes',
    buttonNo: 'No',

    // NOT confirmed live for this feature specifically — only Delete + ConfirmDialog Yes were
    // captured. Follows the same two conventions this app already confirms elsewhere (e.g.
    // CompBulkConfigurationsPage's kebab "Edit" menu item) — a direct row "Edit" button first
    // (mirroring Delete's own direct-button convention), falling back to the kebab "..." menu.
    buttonEdit: 'Edit',
    editMenuItem: 'a.p-menuitem-link[aria-label="Edit"]',

    // Confirmed live: static ids on the popup's 4 base fields.
    promotionNameInput: '#promotionName',
    totalPrizePositionsWrapper: '#totalPrizePositions',
    chanceToWinWrapper: '#chanceToWin',
    typeDropdown: '#type',

    // Confirmed live: generic PrimeNG error-message convention used across this app.
    validationError: '.p-error.pure__error-message',
    dropdownItem: '.p-dropdown-item',

    // Confirmed live: the running Total Chance validation message's own wrapper.
    totalChanceError: 'small.p-error',

    searchInput: 'input.pure-input.w-20r[placeholder="Search"]',
};

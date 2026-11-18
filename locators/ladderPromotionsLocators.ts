// ═══════════════════════════════════════════════════════════════════════════════
// LADDER PROMOTIONS — new feature (Marketing -> Promotions -> Ladder Promotions), built from the
// user's functional description plus outerHTML confirmed live for: the "Create Ladder Promotion"
// button, the popup's 4 fields (Description, Region, Start Date, End Date) plus a disabled "Is
// Premium" checkbox, the Save/Cancel footer buttons, the search bar, the row-level kebab ("...")
// menu's Delete item, and the delete ConfirmDialog's Yes/No buttons.
//
// Confirmed live (captured outerHTML of the popup): Description and the Region dropdown share one
// row, Start Date and End Date share the next row — both calendar inputs carry
// aria-controls="startDate_panel" / "endDate_panel" respectively, the same PrimeNG Calendar panel-id
// convention already confirmed and used by TimedPromotionsPage.setDateRange.
//
// Flagged assumptions (not independently confirmed live — repeated as comments at point of use):
//  - Description's 255-character max was stated as a functional fact by the user, not captured as a
//    `maxlength` attribute on the live <input> markup — trusted as given, but tests check tolerantly
//    (either the value is capped or a validation error appears) in case it's enforced some other way.
//  - Region's actual option list was never captured — tests pick whichever option renders first,
//    the same unconfirmed-dropdown-contents convention already used by PrizeDrawPage.selectFirstType.
//  - The list page's table itself (row markup, columns) was never captured — assumed to follow this
//    app's universal `.pure__table` wrapper convention (same assumption PrizeDrawPage/
//    BetPromotionRulesPage/TimedPromotionsPage make for their own list pages).
//  - The required-field / max-length validation message markup was never captured for this feature
//    specifically — reuses this app's generic PrimeNG error-message convention (`.p-error`), same
//    assumption PrizeDrawPage's own locators file makes.
// ═══════════════════════════════════════════════════════════════════════════════

export const ladderPromotionsLocators = {
    buttonCreateLadderPromotion: 'Create Ladder Promotion',
    buttonSave: 'Save',
    buttonCancel: 'Cancel',
    buttonYes: 'Yes',
    buttonNo: 'No',
    buttonDelete: 'Delete',
    // Confirmed live (user-supplied outerHTML): same kebab menu, same `.p-menuitem-text` convention
    // as Delete's own menu item.
    buttonEdit: 'Edit',
    // Confirmed live (user-supplied outerHTML): same kebab menu, same `.p-menuitem-text` convention.
    buttonClone: 'Clone',
    // Confirmed live (user-supplied outerHTML): same kebab menu, same `.p-menuitem-text`
    // convention. Only one of the two is expected to appear at a time per the user's own
    // description ("you can unmark only when the promotion is marked as premium") — not
    // independently confirmed which exact mechanism enforces that (item hidden vs. disabled).
    buttonMarkPremium: 'Mark Premium',
    buttonUnmarkPremium: 'Unmark Premium',

    // Confirmed live: static ids on the popup's 4 fields.
    descriptionInput: '#description',
    regionDropdown: '#regionCode',
    startDateWrapper: '#startDate',
    endDateWrapper: '#endDate',

    // Confirmed live: disabled-by-default checkbox, informational only.
    isPremiumCheckbox: '#isPremium',

    // Confirmed live: generic PrimeNG error-message convention used across this app.
    validationError: '.p-error',
    dropdownItem: '.p-dropdown-item',

    searchInput: '#search-input',

    // Confirmed live: row-level kebab trigger + its Delete menu item.
    kebabTrigger: 'button.pure__table-menu-trigger',
    deleteMenuItem: '.p-menuitem-text',
};

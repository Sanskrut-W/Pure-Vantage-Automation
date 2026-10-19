export const rulesEngineLocators = {
    buttonCreateRule: 'Create Rule',

    // ─── Step 1: Basics — all ids confirmed live ──────────────────────────────
    inputDescription: '#description',
    dropdownRegion: '#region',
    dropdownCampaign: '#campaign',
    dropdownAction: '#action',

    // ─── Step 2: Qualification — all ids confirmed live ───────────────────────
    inputRequiredAmount: '#requiredAmount input',
    dropdownEligibilityFrequency: '#eligibilityFrequency',
    calendarStartDate: '#startDate input',
    calendarEndDate: '#endDate input',
    checkboxIsFirstQualifyingAmount: '#isFirstQualifyingAmount',
    checkboxMultiAward: '#multiAward',
    // Confirmed live (only this option's live behavior is described, not its exact label spelling)
    // — the ONE eligibility frequency value that opens the Schedule step; every other option skips it.
    eligibilityFrequencyRecurringOption: 'Recurring',

    // ─── Step 3: Rules ─────────────────────────────────────────────────────────
    // "Combine groups with" dropdown's own id was never captured live (only its chevron icon was) —
    // located via this app's proven float-label structure instead (a control is always immediately
    // followed by its own `<label for=id>` sibling), confirmed identical across every other dropdown/
    // input/checkbox in this feature. See RulesEnginePage.getDropdownByLabel.
    labelCombineGroupsWith: 'Combine groups with',

    buttonAddGroup: 'Add group',
    inputGroupDescription: '#groupDescription',
    dropdownGroupOperator: '#groupOperator',

    // Confirmed live: rendered as <h4>Sport conditions</h4> etc — lowercase "conditions".
    headingSportConditions: 'Sport conditions',
    headingCasinoConditions: 'Casino conditions',
    headingDepositConditions: 'Deposit conditions',

    // Confirmed live: the active Group's name renders as "Editing conditions for **{name}**",
    // and its 3 condition types render as sibling <section class="feed-processor-rule-card
    // feed-processor-rule-card--sport/casino/deposit"> blocks, each with its own saved-rows
    // <table> (Edit/Delete per row, same aria-label convention as everywhere else in this app).
    selectedGroupLabel: '.feed-processor-rules__selected-label strong',
    sportConditionCard: 'section.feed-processor-rule-card--sport',
    casinoConditionCard: 'section.feed-processor-rule-card--casino',
    depositConditionCard: 'section.feed-processor-rule-card--deposit',

    buttonAddSport: 'Add sport',
    // All ids confirmed live
    dropdownBetSlipType: '#betSlipType',
    dropdownSettlementFilter: '#settlementFilter',
    dropdownFeedName: '#feedName',
    dropdownSport: '#sport',
    inputLeague: '#league',
    inputCountry: '#country',
    // Confirmed live: Event/Market/Outcome render as plain inputs with id="event"/"market"/
    // "outcome" before Feed Name+Sport are selected, but switch to a DIFFERENT id
    // ("eventId"/"marketId"/"outcomeId") once Angular swaps them for their p-dropdown version —
    // League/Country keep the same id in both states, these three don't. Matching both ids
    // covers whichever one is actually rendered.
    inputEvent: '#event, #eventId',
    inputMarket: '#market, #marketId',
    inputOutcome: '#outcome, #outcomeId',
    inputBookingCode: '#bookingCode',
    inputMinimumWagerAmount: '#minimumWagerAmount input',
    inputMinimumBetslipOddsMultiplier: '#minimumBetslipOddsMultiplier input',
    inputMinimumLegsRequired: '#minimumLegsRequired input',
    inputMinimumLegOddsMultiplier: '#minimumLegOddsMultiplier input',
    checkboxApplyOddsAndMultiplierToLegsInTotal: '#applyOddsAndMultiplierToLegsInTotal',
    checkboxApplyRuleToAllBets: '#applyRuleToAllBets',
    checkboxIsSingleLegOnly: '#isSingleLegOnly',
    checkboxIsBuildABet: '#isBuildABet',

    // ─── Casino popup — all ids confirmed live. Game renders DISABLED until Provider is
    // selected — same dependency pattern as Sport's Sport-disabled-until-Feed-Name.
    buttonAddCasino: 'Add casino',
    dropdownCasinoProvider: '#casinoProvider',
    dropdownCasinoGame: '#casinoGame',
    inputCasinoCategory: '#category',
    // Confirmed live: reuses the EXACT SAME id as the Sport popup's own Minimum Wager Amount —
    // no collision since only one popup is ever open at a time.
    inputCasinoMinimumWagerAmount: '#minimumWagerAmount input',
    inputCasinoMinimumMultiplierAmount: '#minimumMultiplierAmount input',

    // ─── Deposit popup — all ids confirmed live ────────────────────────────────
    buttonAddDeposit: 'Add deposit',
    inputMinimumDepositAmount: '#minimumDepositAmount input',
    dropdownRequiredPaymentMethod: '#requiredPaymentMethod',

    // ─── Step 4: Schedule — Add Recurring Frequency popup, all confirmed live ─
    buttonAddRecurringFrequency: 'Add Recurring Frequency',
    // Time-only p-calendar (clock icon trigger) — confirmed live.
    inputStartTime: '#startTime input',
    // p-inputnumber, min=1 max=24 — confirmed live its displayed value carries a " hrs" suffix
    // (e.g. "1 hrs"), so exact-value assertions must account for that rather than a bare digit.
    inputDurationHours: '#durationHours input',
    scheduleSummaryText: '.feed-processor-schedule-summary span',
    pillSectionHeadingWeek: 'Days of the week',
    pillSectionHeadingMonths: 'Months',
    pillSectionHeadingDates: 'Days of the month',

    // ─── Step 5: Review — confirmed live. NOTE: the captured Review step's action row shows
    // ONLY "Back" and "Back to list" — no "Activate" button was present despite the user's
    // description of one. Flagged, not assumed either way; see RulesEnginePage's own comment.
    reviewStatusBanner: '.feed-processor-review__status',
    reviewConfigPanelField: '.feed-processor-review__field',
    reviewPanel: 'section.feed-processor-review__panel',
    reviewPanelBadge: '.feed-processor-review__badge',
    buttonActivate: 'Activate',
    buttonBackToList: 'Back to list',

    // ─── Shared across every step/popup — confirmed live as this app's universal convention ──
    buttonNext: 'Next',
    buttonBack: 'Back',
    buttonSave: 'Save',
    buttonCancel: 'Cancel',
    buttonEdit: 'Edit',
    buttonDelete: 'Delete',
    buttonConfirmYes: 'Yes',
    buttonConfirmNo: 'No',

    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',
    validationError: '.p-error, .p-invalid, small.p-error',

    // ─── Rules Engine list page — confirmed live. Each row's own actions are NOT inline
    // Edit/Delete buttons (unlike the saved Sport/Casino/Deposit condition rows) — they're behind
    // a kebab "..." menu, same convention as the Leaderboard list's own row menu.
    ruleRowMenuTrigger: '.pure__table-menu-trigger',
    menuItemDeleteRule: 'Delete',
    // Confirmed live (user-supplied outerHTML): the same kebab menu also offers Open/Clone/
    // Activate — and, once the Rule is Active, Deactivate replaces Activate in that same slot.
    // Named distinctly from the existing (Review-step, unconfirmed) buttonActivate above to avoid
    // conflating the two different "Activate" controls.
    menuItemOpenRule: 'Open',
    menuItemCloneRule: 'Clone',
    menuItemActivateRule: 'Activate',
    menuItemDeactivateRule: 'Deactivate',
    // Confirmed live (user-supplied): the exact toast shown when Activate is attempted on a Rule
    // with zero Sport/Casino/Deposit conditions.
    toastActivationBlockedNoCondition: 'Approval is not allowed: at least one casino, sport, or deposit condition is required.',
};

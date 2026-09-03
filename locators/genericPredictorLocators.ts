export const genericPredictorLocators = {
    // Page-level
    createBtn: 'button[aria-label="Create Predictor"]',
    viewLeaguesBtn: 'View Leagues',

    // Create/Edit Predictor popup — 5 core fields
    inputName: '#name',
    dropdownRegion: '#regionCode',
    calendarStartDateTime: '#startDateTimeCalendar input',
    calendarEndDateTime: '#endDateTimeCalendar input',
    dropdownLeague: '#leagueId',

    // Advanced accordion — toggled open via its header text (no stable id, PrimeNG generates a
    // fresh pr_id_XXXX per session)
    advancedAccordionHeader: 'Advanced',

    // Advanced fields — 14 total
    calendarParticipationStartDateTime: '#participationStartDateTimeCalendar input',
    calendarParticipationEndDateTime: '#participationEndDateTimeCalendar input',
    calendarPredictionStartDateTime: '#predictionStartDateTimeCalendar input',
    calendarPredictionEndDateTime: '#predictionEndDateTimeCalendar input',
    inputMinimumSelections: '#minimumselections input',
    inputMaximumSelections: '#maximumselections input',
    inputMinimumDeposit: '#minimumdeposit input',
    inputMaximumWager: '#maximumwager input',
    inputCompetitionType: '#competitiontype',
    inputRedirectUrl: '#redirecturl',
    inputSportId: '#sportId',
    inputLeagueName: '#leagueName',
    inputLeagueCountry: '#leagueCountry',
    dropdownAllocationCompCode: '#allocationCompCode',

    // 11 checkboxes
    checkboxDuplicateTeams: '#duplicateTeams',
    checkboxAllowRepeatTeams: '#allowRepeatTeams',
    checkboxMultiTeam: '#multiTeam',
    checkboxRequireOrderedSelection: '#requireOrderedSelection',
    checkboxRequiresMaxSelection: '#requiresMaxSelection',
    checkboxDrawSelections: '#drawSelections',
    checkboxIsMultiRound: '#isMultiRound',
    checkboxMultiWinner: '#multiWinner',
    checkboxRequiresTicket: '#requiresTicket',
    checkboxIsTesting: '#isTesting',
    checkboxIsAutoOptin: '#isAutoOptin',

    buttonSave: 'Save',
    buttonCancel: 'Cancel',

    // PrimeNG dropdown overlay — filter/search box + option items
    dropdownFilterInput: '.p-dropdown-filter, .p-dropdown-panel input[type="text"]',
    dropdownItem: '.p-dropdown-item, [role="option"]',

    // Row-level "..." kebab menu (opens a floating PrimeNG Menu with Edit/Delete/Promotion
    // Periods items) — only reachable from the Inactive list under the predictor's own Region
    // (confirmed live).
    rowMenuTrigger: 'button.pure__table-menu-trigger',
    menuItemEdit: 'Edit',
    menuItemDelete: 'Delete',
    menuItemPromotionPeriods: 'Promotion Periods',
    // Event row menu item — confirmed live, same .p-menuitem-link structure as Edit/Delete.
    // Distinct from buttonCancel (the popup's Cancel button) — this is a MENU ITEM.
    menuItemCancel: 'Cancel',

    // Delete confirmation — a CUSTOM Yes/No modal, distinct from the standard PrimeNG
    // ConfirmDialog (.p-confirm-dialog-accept/reject) used elsewhere in this suite.
    buttonConfirmYes: 'Yes',
    buttonConfirmNo: 'No',

    // Promotion Periods — Create Period popup, all ids confirmed live.
    createPeriodBtn: 'button[aria-label="Create Period"]',
    inputPeriodName: '#periodNameInput',
    inputPeriodNumber: '#periodNumberInput input',
    calendarPeriodStartDate: '#startDateCalendar input',
    calendarPeriodEndDate: '#endDateCalendar input',

    // 2 checkboxes — confirmed live: unlike every other checkbox in this app, these labels DO
    // carry a real `for` attribute pointing straight at the native <input>, so they're driven as
    // plain native checkboxes (click/isChecked), not the `.p-checkbox-box` force-click hack used
    // for the other checkboxes in this suite. Also confirmed: the second checkbox's real label is
    // "First Competitive Week" (id "competitiveWeek"), not "First Competitive" as first described.
    checkboxPracticeRound: '#practiceRound',
    checkboxCompetitiveWeek: '#competitiveWeek',

    // Period Events — reached via a Period row's "..." menu -> Events (confirmed live: a genuine
    // page navigation, same as Promotion Periods itself, not a dialog).
    menuItemEvents: 'Events',
    createEventBtn: 'button[aria-label="Create Event"]',
    inputEventName: '#eventName',
    calendarEventStartDateTime: '#eventStartDateTime input',
    dropdownEventLeague: '#leagueId',

    // Create Event popup — Event Participants section. Confirmed live: participant fields (Team,
    // Participant Type, Participant Role) carry no id and no `for` attribute, so they can only be
    // targeted by DOM position within their "Participant N" block.
    addParticipantBtn: 'button[aria-label="Add Participant"]',

    // Capture Outcome — reached via an Event row's "..." menu -> Capture Outcome. A `.p-dialog`
    // popup (not a page navigation, unlike Events/Promotion Periods) with 3 fields, all confirmed
    // live. Home/Away Score are p-inputnumber with min="0" — a negative value keeps Save disabled.
    menuItemCaptureOutcome: 'Capture Outcome',
    dropdownResultType: '#resultType',
    inputHomeScore: '#homeScore input',
    inputAwayScore: '#awayScore input',

    // Period Stats — reached via an Event row's "..." menu -> Period Stats (confirmed live: a
    // genuine page navigation, same pattern as Events/Promotion Periods, not a dialog).
    menuItemPeriodStats: 'Period Stats',

    // Period row menu (Predictor Periods page) — Stats/Winners, both genuine page navigations,
    // confirmed live. "Stats" lands on the SAME "Predictor Period Stats" page as an Event row's
    // "Period Stats" item — just a different entry point into the same destination.
    menuItemStats: 'Stats',
    menuItemWinners: 'Winners',

    // Predictor row menu (Generic Predictor list page) — Activate/Deactivate, confirmed live:
    // same .p-menuitem-link structure as Edit/Delete/Promotion Periods. Activate only appears on
    // Inactive rows and Deactivate only on Active rows (mirror-image visibility, same rule as
    // Edit/Delete/Promotion Periods being Inactive-only).
    menuItemActivate: 'Activate',
    menuItemDeactivate: 'Deactivate',

    // Predictor row menu — Toggle Testing Status / Toggle Auto-Optin Status, confirmed live: same
    // menu item is clicked to turn the corresponding table-column switch both on and off (a true
    // toggle, not two separate actions). The "Is Testing" / "Auto Opt-in" switches in the table
    // itself are read-only (disabled) — only changeable via these row menu items.
    menuItemToggleTestingStatus: 'Toggle Testing Status',
    menuItemToggleAutoOptinStatus: 'Toggle Auto-Optin Status',

    // Event Participants — reached via an Event row's "..." menu -> Participants (confirmed live:
    // a genuine page navigation, same pattern as Events/Promotion Periods, not a dialog). Create
    // is a page-level button; Edit/Delete/Results are confirmed live to be PER-ROW buttons inside
    // each row's own frozen action column (no separate "select the row" step).
    menuItemParticipants: 'Participants',
    createParticipantBtn: 'button[aria-label="Create"]',
    editParticipantBtn: 'button[aria-label="Edit"]',
    deleteParticipantBtn: 'button[aria-label="Delete"]',
    resultsParticipantBtn: 'button[aria-label="Results"]',
    // Confirmed live search box on this page (distinct from the Generic Predictor list page,
    // which has none).
    participantsSearchInput: 'input.w-20r[placeholder="Search"]',

    // Results popup (opened via a Participant row's "Results" button) — a genuine `.p-dialog`
    // with 3 fields, all confirmed live. Is Winner is a Yes/No dropdown (underlying value
    // true/false); Finish Position and Participant Score are p-inputnumber (min="0"), same
    // negative-value keystroke-filtering quirk as Capture Outcome's Home/Away Score.
    dropdownIsWinner: '#isWinner',
    inputFinishPosition: '#finishPosition input',
    inputParticipantScore: '#participantScore input',
};

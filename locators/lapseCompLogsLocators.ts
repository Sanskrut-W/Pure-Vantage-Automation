export const lapseCompLogsLocators = {
    // <pure-header-details-component> renders Description / Comp Code / Schedule / Next
    // Execution Date as ".leaderboard__item-container" pairs (label + value) — same shared
    // component/markup already used identically elsewhere in this suite (e.g.
    // compPayoutLocators.compConfigCodeValue). A bare ".leaderboard__item-container-text"
    // match is ambiguous, so this scopes to the container whose OWN label reads "Comp Code".
    // The Comp Configuration page (reached via View Comp) renders the exact same component, so
    // this one selector is reused on both pages rather than duplicated.
    headerCompCodeValue: '.leaderboard__item-container:has(.marginb-1:text-is("Comp Code")) .leaderboard__item-container-text',

    viewCompBtn: 'button[aria-label="View Comp"]',

    // Carries no aria-label (its accessible text is a literal "&nbsp;") — matched by its
    // chevron-left icon instead, same pattern already used for Lapse Comp Region's Back button.
    backButton: 'button.btn--info.p-button-icon-only:has(.pi-chevron-left)',
};

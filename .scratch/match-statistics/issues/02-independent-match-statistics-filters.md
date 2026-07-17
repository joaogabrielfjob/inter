# 02 — Independent Match Statistics Filters

**What to build:** A supporter can refine Estatísticas with its own Year, Month, Team, and Competition Match Statistics Filters. Choices remain drafts until search, then update only the Estatísticas URL and Complete Performance Summary; clearing restores the unfiltered search.

**Blocked by:** 01 — Current-year Performance Summary.

**Status:** resolved

- [ ] Estatísticas offers the full independent historical filter catalogue for Year, Month, Team, and Competition without cascading choices.
- [ ] A supporter can draft multiple choices and confirm one Match Statistics Search; Results filters and query parameters are never carried into or overwritten by Estatísticas.
- [ ] A Team selection includes Matches with that Team as either participant, producing Internacional's head-to-head Performance Summary for an opponent.
- [ ] A valid no-match combination retains the usual zero-valued card layout, and clearing filters restores the unfiltered search.
- [ ] Web feature and server route tests cover confirmation, URL state, clear-to-default, independent page state, non-cascading options, no-match values, invalid links, and request retry behavior.

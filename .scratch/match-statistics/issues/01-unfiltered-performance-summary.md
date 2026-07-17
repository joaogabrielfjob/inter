# 01 — Current-year Performance Summary

**What to build:** A supporter can open Estatísticas from the header and see a complete unfiltered Performance Summary in responsive numeric cards. Every displayed measure is calculated from all matching completed Matches rather than a paginated Match Results batch.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [ ] Estatísticas is a top-level destination whose bare URL normalizes to the explicit current calendar-year Match Statistics Search.
- [ ] The server returns one Complete Performance Summary with no cursor, calculated from Internacional's perspective across every matching completed Match.
- [ ] The page visibly presents Matches Played; grouped wins, draws, and losses; Goals scored and conceded; Goal Difference; Taxa de vitórias; and Clean Sheets as responsive numeric cards.
- [ ] Win Rate is wins divided by Matches Played, rounded to one decimal place; a valid Zero-Match Performance Summary displays zero values, including 0%.
- [ ] Server route and web feature tests cover the observable default-search, aggregate, and card behavior, including home/away perspective and a cohort larger than a Match Results batch.

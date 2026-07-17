# Match Statistics

Status: ready-for-agent

## Problem Statement

A supporter can browse completed Match Results, but cannot quickly understand Internacional's performance across a meaningful collection of Matches. They need a clear Match Statistics page that uses familiar filtering criteria without coupling its selected cohort to Resultados.

## Solution

Add Estatísticas as a top-level page at `/estatisticas`. It presents a compact, responsive card-based Performance Summary for the Complete Performance Summary selected by its own Year, Month, Team, and Competition filters. The initial search is unfiltered and has no query parameters. The summary reports Match-level performance from Internacional's perspective: Matches Played, wins, draws, losses, Goals scored, Goals conceded, Goal Difference, Win Rate, and Clean Sheets.

## User Stories

1. As a supporter, I want an Estatísticas header link beside Jogos and Resultados, so that I can reach Match Statistics directly.
2. As a supporter, I want Estatísticas to open on the current calendar year, so that I start with a relevant current baseline.
3. As a supporter, I want an unfiltered Estatísticas URL to have no query parameters, so that I can refresh or share the all-matches Match Statistics Search I am viewing.
4. As a supporter, I want Estatísticas to have its own Year filter, so that I can choose the historical period to summarize.
5. As a supporter, I want Estatísticas to have its own Month filter, so that I can narrow a year to a calendar month.
6. As a supporter, I want Estatísticas to have its own Team filter, so that I can see Internacional's record against a particular opponent.
7. As a supporter, I want Estatísticas to have its own Competition filter, so that I can understand performance within one competition.
8. As a supporter, I want the four Match Statistics Filters to remain drafts until I search, so that changing several choices does not repeatedly replace the summary.
9. As a supporter, I want a confirmed Match Statistics Search represented in Estatísticas' URL, so that browser navigation and sharing reproduce the selected cohort.
10. As a supporter, I want Resultados and Estatísticas to keep independent confirmed searches, so that visiting one page never transfers or overwrites the other's filters.
11. As a supporter, I want the Team filter to include Matches where the selected Team was either home or away, so that an opponent selection gives me a complete head-to-head summary.
12. As a supporter, I want the same full historical filter choices to remain available after I select another filter, so that I can intentionally choose any valid combination.
13. As a supporter, I want Matches Played displayed prominently, so that I know the size of the cohort behind every other measure.
14. As a supporter, I want wins, draws, and losses shown together, so that I can assess the record at a glance.
15. As a supporter, I want Goals scored, Goals conceded, and Goal Difference, so that I can assess Internacional's scoring performance.
16. As a supporter, I want a clearly named Taxa de vitórias, so that I can see the share of selected Matches that Internacional won without confusing it with points-based aproveitamento.
17. As a supporter, I want Clean Sheets displayed, so that I can see how often Internacional conceded no Goals.
18. As a supporter, I want every measure calculated from Internacional's perspective whether it was home or away, so that away Matches have the correct outcome and scoring direction.
19. As a supporter, I want the summary to include every completed Match matching my filters, so that its values do not depend on Resultados pagination or browser loading.
20. As a supporter, I want valid searches with no completed Matches to retain the normal card layout with zero values, so that the page remains stable and immediately understandable.
21. As a supporter, I want a Zero-Match Performance Summary to show a 0% Win Rate, so that all cards stay numeric and consistent.
22. As a supporter, I want Limpar filtros on Estatísticas to restore the unfiltered search, so that I can return to the all-matches summary.
23. As a supporter, I want Match Statistics shown as responsive numeric cards rather than charts, so that the initial page stays compact and usable on small screens.
24. As a supporter, I want loading, invalid-link, request-failure, and retry interactions to follow the familiar Resultados experience, so that the new page behaves predictably.

## Implementation Decisions

- Add a top-level Estatísticas route and header navigation. Navigating between Resultados and Estatísticas must not carry either page's filters; opening Estatísticas establishes its Default Match Statistics Search.
- Give Estatísticas a dedicated Match Statistics feature module that owns its URL-backed confirmed Match Statistics Search, draft filters, query identity, request/display states, and responsive card presentation. This follows the deep page seam established for Match Results without merging the two page states.
- The Match Statistics URL accepts the same optional Year, Month, Team, and Competition query criteria as Match Results. It has no cursor. A bare `/estatisticas` normalizes to the current calendar Year's explicit query; a well-formed no-match search remains valid.
- Reuse the completed-Match filter catalogue values and their independent availability. The catalogue is data shared by the pages, not filter state shared by the pages.
- Provide a dedicated browser-facing Match Statistics read endpoint that accepts only Match Statistics Filters and returns one complete aggregate, not Match rows or a paginated collection. Its response contains Matches Played, wins, draws, losses, Goals scored, Goals conceded, Goal Difference, Win Rate, and Clean Sheets.
- Calculate the Complete Performance Summary on the server from every matching completed Match. Do not calculate it from Match Results batches or fetch all browser-visible Result pages. This implements ADR-0009.
- Determine Internacional's home/away role using the established Team identity approach from ADR-0004, including its legacy fallback where required. For each selected Match, classify result and scoring measures from Internacional's perspective.
- Count a win, draw, or loss by comparing Internacional's score with its opponent's score. Goals scored and conceded use the corresponding side's final score; Goal Difference is scored minus conceded. A Clean Sheet is a selected Match with zero Goals conceded.
- Calculate Win Rate as wins divided by Matches Played multiplied by 100, rounded to one decimal place. The Portuguese presentation label is **Taxa de vitórias**; do not label it **aproveitamento**.
- Return zero for every numeric measure, including Win Rate, when a valid Match Statistics Search has no completed Matches. The browser renders the usual card grid rather than a no-results empty state.
- Render a compact responsive numeric-card grid: a prominent Matches Played card, a grouped wins/draws/losses card, and individual cards for Goals scored, Goals conceded, Goal Difference, Taxa de vitórias, and Clean Sheets. Do not introduce a chart library or charts.
- Keep the filters' draft-and-confirm interaction: selection changes update drafts only; the search action confirms the Match Statistics Search through the URL; clear discards drafts and confirmed criteria and restores the unfiltered search.
- Preserve existing Match Results behavior, including its unfiltered all-history default and cursor pagination. Match Statistics is deliberately a separate aggregate capability.

## Testing Decisions

- Test externally observable contracts and user-visible behavior, not SQL construction, React state implementation, or card CSS details.
- Use the existing Match HTTP route-test seam as the server seam. Test that the Match Statistics endpoint accepts well-formed filters, rejects malformed filters before reading data, returns one complete browser-facing aggregate without a cursor, and returns zero-valued measures for a valid no-match search.
- At the server seam, cover Internacional as home and away, wins/draws/losses, Goals scored/conceded, positive and negative Goal Difference, Clean Sheets including 0-0, a one-decimal Win Rate, and aggregation across more than a Resultados batch size.
- Use the existing Match Results web-feature test style—MemoryRouter, mocked HTTP, and user-visible DOM assertions—as the Estatísticas feature seam. Test an unfiltered URL, loading the confirmed URL search, draft-then-search behavior, independent filter state, clear-to-unfiltered behavior, all numeric cards, and zero-valued card presentation.
- Test the header as user-visible navigation: Estatísticas is available alongside Jogos and Resultados, and navigation starts the page's own default search rather than copying Resultados query parameters.
- Test visible failure and recovery states for the Match Statistics aggregate and filter catalogue, following the established Resultados retry patterns.

## Out of Scope

- Player, scorer, assist, lineup, possession, shots, cards, substitutions, or any other event-level statistics.
- Charts, time-series visualizations, comparison visualizations, exports, or saved searches.
- Changing Match Results' pagination, default all-history search, filter state, or Result Card presentation.
- Sharing selected filter state between Resultados and Estatísticas.
- Any schema migration or new persisted statistics table; the first version computes the aggregate from completed Match data.
- Replacing the existing ESPN source or changing Team identity rules.

## Further Notes

- Use the domain terms Match Statistics, Match Statistics Filters, Match Statistics Search, Default Match Statistics Search, Complete Performance Summary, Zero-Match Performance Summary, Clean Sheet, and Win Rate from `CONTEXT.md`.
- ADR-0009 requires complete server-side aggregation without pagination. ADR-0004 governs Team identity used to determine Internacional's perspective.
- The established browser-facing Match read boundary remains the precedent for the aggregate's browser-facing response; persistence structures and ESPN identity must not be exposed to the browser.

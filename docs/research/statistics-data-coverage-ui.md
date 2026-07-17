# Communicating statistics data coverage

**Question:** How do established football-statistics interfaces communicate the period behind a statistic, and where should this app place its `2020–present` limitation?

**Researched:** 2026-07-17

## Findings

### 1. Put the chosen period in the statistics context, not in the metric cards

[FBref's 2020–2021 Arsenal statistics page](https://fbref.com/en/squads/18bb7c10/2020-2021/Arsenal-Stats) makes the season part of the page title (`2020-2021 Arsenal Stats`) and immediately offers the relevant competition context. Its data table is therefore never visually detached from the period it describes.

**Pattern:** scope is a small piece of context immediately before the results, rather than repeated in each value card.

### 2. Use a compact data-coverage disclosure adjacent to results

[Stathead's Baseball Season & Career Finder](https://stathead.com/tiny/yQd70) keeps its search controls separate from a concise disclosure after the result table. It starts `Data coverage: Since 1871` and links from the sentence to further coverage details. This is the closest first-party example of a fixed coverage boundary being surfaced without distracting from the statistics.

**Pattern:** a one-line, low-emphasis `Data coverage` label alongside the result context; detailed caveats belong behind a link, when they exist.

### 3. Let the time selector show the selectable history, with an explicit all-history state

The [Premier League Stats Centre](https://www.premierleague.com/en/stats/top/players/goals/all-seasons) exposes a `Season` filter whose visible choices begin with `All Seasons` and then list individual seasons, including `2020/21`. This distinguishes the active aggregation scope from the metric itself and makes the available history inspectable in the control.

**Pattern:** show the range through the period control when it is selectable; give the unbounded aggregation a named state such as `All Seasons` rather than leaving it ambiguous.

### 4. Treat long-history and per-season statistics as two explicit navigation modes

[StatBunker's player statistics](https://www.statbunker.com/players/getplayerstats) presents `All time stats` as a top-level destination alongside `Competitions`, and states that its stats update after each completed match. The historical scope is an information-architecture choice, rather than an unexplained default hidden in a result table.

**Pattern:** if a data product has both historical and period-specific summaries, name the history mode plainly (`All time`, `All seasons`) and keep recency/update information separate.

### 5. Offer a separate coverage/methodology page only for material caveats

[College Football Reference's Data Coverage page](https://www.sports-reference.com/cfb/about/data-coverage.html) explains that completeness varies by historical period, then documents precise ranges and exceptions by metric. [Baseball Reference's coverage page](https://www.baseball-reference.com/about/coverage.shtml) similarly records which historical statistics are complete, partial, or unavailable.

**Pattern:** reserve a linked methodology page for source, completeness, and exception details. It is not necessary for a simple, uniformly covered 2020–present match aggregate.

### Conclusion for a fixed historical floor

The examples above communicate *selected* time windows through titles and filters. They do not need a warning banner because their selectable archive has no unusual fixed start date. This app does: its data begins in 2020 even when the user clears the filters. That makes a short coverage note useful metadata, not a filter label or a statistic.

## Recommendation for Inter

Keep one muted, single-line coverage note **between the filter row and the performance-summary cards**:

> Cobertura dos dados: de 2020 até o presente.

This is closest to the established context-before-results pattern while preserving the page's compact card-based design. It applies to every filter combination and is visible just before the numbers it qualifies. Do not place it inside a card (it is not a performance measure), in the header (too distant from the aggregate), or make it a prominent alert (the limitation is informative, not an error).

The present implementation's wording — “Os dados abrangem partidas de 2020 até os dias atuais.” — already follows the placement recommendation. `Cobertura dos dados: de 2020 até o presente.` is a tighter alternative that follows Stathead's established terminology. If the actual ingestion cadence is known, use a precise, supportable freshness statement; otherwise avoid implying real-time updates.

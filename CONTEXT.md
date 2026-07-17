# Internacional Match Centre

This context presents Internacional's fixtures and completed matches. It keeps the language for match discovery consistent across the application.

## Language

**Match**:
A football contest between a home team and an away team, whether scheduled or completed.
_Avoid_: game

**Match Day**:
The calendar day on which a Match is scheduled or was completed. It is independent of a time zone.
_Avoid_: timestamp, datetime

**Kickoff Time**:
The optional local clock time at which a Match begins.
_Avoid_: timestamp, datetime

**Match Results**:
The collection of completed matches and the criteria used to browse them.
_Avoid_: results page, finished-games feature

**Match Statistics**:
Measures of Internacional's performance calculated from a selected collection of completed Matches.
_Avoid_: statistic page, analytics

**Match Statistics Filters**:
The criteria a supporter confirms to narrow Match Statistics. They are owned independently from Match Results Filters, even when they offer the same choices.
_Avoid_: shared filters, Results filters

**Match Statistics Search**:
The confirmed set of Match Statistics Filters used to calculate Match Statistics.
_Avoid_: Match Results Search, filter draft

**Unfiltered Match Statistics Search**:
A Match Statistics Search with no optional Match Statistics Filters, calculated from every completed Match.
_Avoid_: reset state, current-season statistics

**Clear Match Statistics Filters**:
The always-available supporter action that discards drafted and confirmed Match Statistics Filters and restores an Unfiltered Match Statistics Search.
_Avoid_: current-season reset, clear to empty search

**Match Statistics Filter Options**:
The full historical, independently selectable Year, Month, Team, and Competition values drawn from completed Matches for Match Statistics Filters. An option remains available even when its combination with other filters has no completed Matches.
_Avoid_: shared filter options, dependent filters

**Performance Summary**:
The compact match-level overview within Match Statistics, calculated from Internacional's perspective whether it is the home or away Team, including outcomes and scoring measures but not player totals.
_Avoid_: dashboard, player statistics

**Complete Performance Summary**:
A Performance Summary calculated from every completed Match in its Match Statistics Search, without pagination.
_Avoid_: paginated statistics, loaded-results summary

**Zero-Match Performance Summary**:
A Performance Summary for a valid Match Statistics Search with no completed Matches, displaying zero-valued measures in the usual card layout.
_Avoid_: empty state, missing statistics

**Clean Sheet**:
A completed Match in which Internacional conceded no Goals.
_Avoid_: shutout

**Win Rate**:
The percentage of Matches won by Internacional in a Performance Summary, calculated as wins divided by Matches Played and rounded to one decimal place.
_Avoid_: aproveitamento, points percentage

**Goal**:
A score-changing event in a completed Match, attributed to its scorer, Team, and Match minute when known.
_Avoid_: call

**Own Goal**:
A Goal scored by a player against that player's own Team. It appears in the Goal Summary under the Team whose score increased and identifies the scorer with `C`.
_Avoid_: normal Goal

**Penalty Goal**:
A Goal scored from a penalty kick and identified with `P` in its Goal Summary entry.
_Avoid_: normal Goal

**Goal Summary**:
The chronological list of known Goals for a completed Match, shown to explain its final score; it is empty for a scoreless Match.
_Avoid_: match details, score details

**Unavailable Goal Summary**:
The state of a completed Match whose final score is known but whose Goal Summary could not be retrieved from ESPN.
_Avoid_: scoreless Match, empty Goal Summary

**Verified Goal Summary**:
A Goal Summary whose per-Team Goal counts match the completed Match's final score.
_Avoid_: partial Goal Summary, unverified Goal Summary

**Goal Summary Backfill**:
The one-time retrieval of Goal Summaries for completed Matches already stored by the application.
_Avoid_: historical import

**Goal Summary Ingestion**:
The separate retrieval and storage of a Goal Summary after its completed Match has been ingested from ESPN. A later Verified Goal Summary replaces an earlier one, while a failed retrieval does not replace one.
_Avoid_: goal scraping

**Match Results Filters**:
The criteria a supporter confirms to narrow Match Results. Filter choices are not applied until confirmed as a search.
_Avoid_: live search, instant filtering

**Match Results Search**:
The confirmed set of Match Results Filters used to retrieve Match Results.
_Avoid_: filter draft, live query

**Unfiltered Match Results Search**:
A Match Results Search with no optional Match Results Filters, showing all completed matches from newest to oldest.
_Avoid_: reset state, initial page

**Clear Match Results Filters**:
The always-available supporter action that discards both drafted and confirmed Match Results Filters and returns to an Unfiltered Match Results Search.
_Avoid_: reset state, cancel search

**Match Results Filter Options**:
The independently selectable values drawn from completed Matches for Match Results Filters. An option remains available even when its combination with other filters has no Match Results.
_Avoid_: dependent filters, cascading filters

**Team Filter**:
A Match Results Filter that selects completed Matches involving the chosen Team as either participant; choosing an opponent therefore scopes Internacional's Match Statistics to that head-to-head collection.
_Avoid_: opponent filter, home-or-away filter

**Month Filter Option**:
A calendar-month Match Results Filter Option, presented throughout Match Results with its full Brazilian Portuguese name.
_Avoid_: month abbreviation, shortened month label

**Fixture**:
A scheduled match that has not yet been completed.
_Avoid_: upcoming result

**Team**:
A football club that appears as the home or away participant in a Match. Its current canonical name is displayed for every Match in which it participates.
_Avoid_: club, side

**Team Emblem**:
The visual mark that identifies a Team and is shared by every Match involving that Team.
_Avoid_: team image, logo, badge, crest

**ESPN Team ID**:
The numeric identifier in ESPN's explicit Team link, used to recognize a Team during ESPN ingestion.
_Avoid_: emblem URL ID, team name key

**ESPN Match ID**:
The numeric identifier in ESPN's explicit Match link, used to retrieve and retry that Match's Goal Summary.
_Avoid_: Match title, Match URL

**Current Season Ingestion**:
The routine refresh that retrieves Internacional's current completed Matches and Fixtures from ESPN.
_Avoid_: historical import, full backfill

**Historical Season Ingestion**:
A separate, on-demand routine that retrieves completed Matches from every prior ESPN season available for Internacional.
_Avoid_: current refresh, full backfill

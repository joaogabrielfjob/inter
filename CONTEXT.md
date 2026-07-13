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

**Current Season Ingestion**:
The routine refresh that retrieves Internacional's current completed Matches and Fixtures from ESPN.
_Avoid_: historical import, full backfill

**Historical Season Ingestion**:
A separate, on-demand routine that retrieves completed Matches from every prior ESPN season available for Internacional.
_Avoid_: current refresh, full backfill

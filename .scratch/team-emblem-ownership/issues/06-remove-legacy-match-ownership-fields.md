# 06 — Remove legacy Match ownership fields

**What to build:** Complete the Team migration by removing old per-Match Team-name and ESPN-emblem ownership fields after every supported read, migration, and ingestion path relies on shared Teams and Team Emblems.

**Blocked by:** 02 — Backfill legacy Matches into Teams; 03 — Serve Team-backed Matches in the browser; 04 — Ingest Teams and Team Emblems from ESPN.

**Status:** resolved

**Resolution:** On 2026-07-12, applied `20260712130000_remove_legacy_match_ownership` to the local PostgreSQL database. Verification found 53 Matches, all with home and away Team links, and confirmed that `home`, `away`, `home_emblem`, and `away_emblem` no longer exist on `match`.

- [x] Matches rely solely on their home and away Team relationships for current names and Team Emblems.
- [x] Legacy per-Match Team-name and ESPN-emblem ownership data is removed only after the new paths are verified.
- [x] Scheduled Matches, Match Results, filters, and ESPN ingestion remain correct after the contract step.
- [x] The full relevant test suite passes with no browser-facing ESPN emblem URLs remaining.

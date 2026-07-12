# 06 — Remove legacy Match ownership fields

**What to build:** Complete the Team migration by removing old per-Match Team-name and ESPN-emblem ownership fields after every supported read, migration, and ingestion path relies on shared Teams and Team Emblems.

**Blocked by:** 02 — Backfill legacy Matches into Teams; 03 — Serve Team-backed Matches in the browser; 04 — Ingest Teams and Team Emblems from ESPN.

**Status:** blocked

**Blocker:** Its manual migration intentionally refuses to remove legacy fields until Ticket 02's database backfill has run and no Match has a missing Team relationship. The required database credential is unavailable in this workspace.

- [ ] Matches rely solely on their home and away Team relationships for current names and Team Emblems.
- [ ] Legacy per-Match Team-name and ESPN-emblem ownership data is removed only after the new paths are verified.
- [ ] Scheduled Matches, Match Results, filters, and ESPN ingestion remain correct after the contract step.
- [ ] The full relevant test suite passes with no browser-facing ESPN emblem URLs remaining.

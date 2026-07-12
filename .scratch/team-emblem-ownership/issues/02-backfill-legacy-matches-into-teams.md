# 02 — Backfill legacy Matches into Teams

**What to build:** Migrate existing Matches into shared Teams and retained Team Emblems so historical Match data gains application-owned emblem delivery without losing Match information or silently hiding ambiguous legacy records.

**Blocked by:** 01 — Expand Team and Team Emblem ownership.

**Status:** blocked

**Blocker:** The backfill is implemented as `bun run backfill:teams` in `scrap`, but this workspace has no `DATABASE_URL`. Run it against the target database after applying the additive migration and resolve its reported legacy records before the removal migration.

- [ ] Existing distinct legacy Team names become reusable Teams and their Matches are linked to those Teams.
- [ ] Available legacy emblem sources are retained as Team Emblems under application-controlled storage.
- [ ] Legacy records that cannot be identified or downloaded safely are reported for review while their Matches are preserved.
- [ ] A backfilled Match remains queryable with its original scores, Match Day, Kickoff Time, league, and status.

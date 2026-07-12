# 02 — Backfill legacy Matches into Teams

**What to build:** Migrate existing Matches into shared Teams and retained Team Emblems so historical Match data gains application-owned emblem delivery without losing Match information or silently hiding ambiguous legacy records.

**Blocked by:** 01 — Expand Team and Team Emblem ownership.

**Status:** resolved

**Resolution:** On 2026-07-12, applied `20260712120000_add_team_emblem_ownership`, ran `bun run backfill:teams` against the configured local database, and reran it to verify completion. The first run backfilled 53 Matches; both runs reported 0 legacy sides needing review, and the verification run found 0 remaining Matches to backfill.

- [x] Existing distinct legacy Team names become reusable Teams and their Matches are linked to those Teams.
- [x] Available legacy emblem sources are retained as Team Emblems under application-controlled storage.
- [x] Legacy records that cannot be identified or downloaded safely are reported for review while their Matches are preserved.
- [x] A backfilled Match remains queryable with its original scores, Match Day, Kickoff Time, league, and status.

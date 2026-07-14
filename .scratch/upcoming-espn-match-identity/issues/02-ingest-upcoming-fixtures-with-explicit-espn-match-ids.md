# 02 — Ingest Upcoming Fixtures with explicit ESPN Match IDs

**What to build:** Upcoming Fixture calendar rows retain and use their explicit ESPN Match ID, so a schedule correction, including one crossing midnight, updates the existing Fixture. Rows without an explicit ID use the conservative existing fallback and are reported for operator review.

**Blocked by:** 01 — Use ESPN Match ID for Match ingestion identity.

**Status:** ready-for-agent

- [ ] Upcoming Fixture ingestion extracts the ESPN Match ID only from an explicit Match link and supplies it to Match ingestion.
- [ ] Re-ingesting the same identified Fixture after a Match Day or Kickoff Time correction produces one refreshed Fixture.
- [ ] A calendar row with no explicit ESPN Match ID neither guesses identity nor merges records beyond the existing fallback, and is reported for review.

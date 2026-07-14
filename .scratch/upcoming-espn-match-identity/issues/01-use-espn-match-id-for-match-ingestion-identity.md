# 01 — Use ESPN Match ID for Match ingestion identity

**What to build:** Re-ingesting an ESPN-identified completed Match updates its existing Match—even when its Match Day, Kickoff Time, Teams, scores, competition, or status changed—rather than creating a duplicate. Browser-facing Match data remains free of ESPN identifiers.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A Match with an explicit ESPN Match ID is located by that identity and has its mutable Match data refreshed without using Match Day as an identity condition.
- [ ] Completed Match ingestion retains the explicit ESPN Match ID and repeat ingestion with corrected schedule data leaves exactly one Match.
- [ ] The existing fallback identity remains available only when ESPN identity is absent, and the browser-facing Match representation does not expose ESPN Match ID.

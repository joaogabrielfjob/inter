# 04 — Ingest Teams and Team Emblems from ESPN

**What to build:** Update ESPN ingestion so fresh Match data creates and refreshes shared Teams and Team Emblems safely, without making browsers depend on ESPN or losing Match data when an image refresh fails.

**Blocked by:** 01 — Expand Team and Team Emblem ownership.

**Status:** resolved

- [ ] Scraped Team links provide an optional ESPN Team ID used for Team recognition; the implementation validates both results and calendar row structures before treating the ID as mandatory.
- [ ] A valid previously unseen ESPN Team ID automatically creates the Team and attempts to retain its Team Emblem.
- [ ] Missing, malformed, or ambiguous source IDs use the name-and-alias fallback and are reported rather than silently merging Teams.
- [ ] Unchanged Team Emblems reuse the current retained asset; changed emblems receive a new content-hashed application path.
- [ ] A failed refresh preserves the last known-good Team Emblem, and a failed initial download still allows the Team and Match to be imported for later retry.

# 02 — Ingest Verified Goal Summaries for new completed Matches

**What to build:** New and current completed Matches receive a Verified Goal Summary after their result is ingested from ESPN, so supporters see normal Goals, penalty Goals, and Own Goals immediately on the card's back face.

**Blocked by:** 01 — Goal Summary card states and Match Results contract.

**Status:** ready-for-agent

- [ ] Completed-result ingestion retains the explicit ESPN Match ID and then retrieves its Goal Summary in a separate following step without preventing result ingestion if that step fails.
- [ ] Only Goal Summaries whose per-Team counts match the final score are verified and displayed; failures or mismatches become unavailable while 0–0 is a verified empty summary.
- [ ] Goal entries retain ESPN scorer names and minutes, are chronological within the scoring Team, use `P` for penalty Goals and `C` for Own Goals, and place an Own Goal under the Team whose score increased.
- [ ] Re-ingesting a verified Goal Summary replaces the existing entries without duplicates, and a later failed retrieval preserves the known-good summary.

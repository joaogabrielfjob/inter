# 03 — Backfill and retry historical Goal Summaries

**What to build:** Existing completed Matches receive the same ESPN Match identity and Goal Summary coverage as new Matches, while unavailable historical Goal Summaries can be retried safely later.

**Blocked by:** 02 — Ingest Verified Goal Summaries for new completed Matches.

**Status:** ready-for-agent

- [ ] A Goal Summary Backfill resolves explicit ESPN Match IDs for completed Matches already stored and retrieves their Goal Summaries without discarding existing results.
- [ ] The backfill reports Matches that cannot be resolved or verified and records them as unavailable for a later retry.
- [ ] Re-running the backfill skips Verified Goal Summaries and retries only unavailable ones, retaining verified data if a retry fails.
- [ ] Historical Goal Summaries appear through the existing Match Results batch and use the same card presentation as newly ingested Matches.

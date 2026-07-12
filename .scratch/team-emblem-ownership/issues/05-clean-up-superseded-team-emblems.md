# 05 — Clean up superseded Team Emblems

**What to build:** Provide a server-owned maintenance operation that removes old unreferenced Team Emblems after their seven-day retention period, triggered securely by Railway on a daily schedule.

**Blocked by:** 01 — Expand Team and Team Emblem ownership.

**Status:** blocked

**Blocker:** The protected server operation is implemented, but configuring the separate daily Railway cron service requires Railway dashboard access and is intentionally not performed in this workspace.

- [ ] The server cleanup operation deletes only non-current Team Emblems that have been superseded for more than seven days and removes their metadata only after successful file deletion.
- [ ] Current Team Emblems and recently superseded emblems remain untouched.
- [ ] Cleanup is reachable only through Railway's private network and requires the configured secret token.
- [ ] A separate short-lived Railway cron service triggers cleanup daily; the scraper does not perform cleanup.

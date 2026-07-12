# 03 — Serve Team-backed Matches in the browser

**What to build:** Make scheduled Matches and Match Results display current Team names and application-owned Team Emblems, including a neutral fallback when a Team has no current emblem.

**Blocked by:** 02 — Backfill legacy Matches into Teams.

**Status:** resolved

- [ ] The browser-facing Match response exposes current Team names and application-owned emblem URLs without exposing ESPN URLs or persistence-specific Team structures.
- [ ] Scheduled Matches and Match Results display the Team-backed name and emblem consistently.
- [ ] A missing Team Emblem renders a neutral fallback without hiding the Match or Team name.
- [ ] Existing Match search, filtering, empty-state, and error-state behavior remains intact.

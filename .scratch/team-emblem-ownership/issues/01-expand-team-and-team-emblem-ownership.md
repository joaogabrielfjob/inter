# 01 — Expand Team and Team Emblem ownership

**What to build:** Establish the additive persistence and server storage capabilities for Teams and retained Team Emblems while leaving legacy Match ownership fields working. The server can store Team Emblems in the configured local or Railway Volume location and serve them through application-owned paths.

**Blocked by:** None — can start immediately.

**Status:** resolved

- [ ] A Team can own a current Team Emblem and retain enough previous-emblem metadata for later lifecycle operations without disrupting existing Match reads.
- [ ] The server stores Team Emblem files outside source-controlled application assets, using local Git-ignored storage in development and the configured Railway Volume location in production.
- [ ] A retained Team Emblem is served from an application-owned path, never by proxying or returning an ESPN URL.
- [ ] Existing Match behavior remains green while legacy Match fields are still present.

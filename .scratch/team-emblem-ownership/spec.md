# Team Emblem Ownership

Status: ready-for-agent

## Problem Statement

The Match Centre currently saves ESPN image URLs directly on each Match and sends those URLs to browsers. As a result, a supporter opening scheduled Matches or Match Results depends on ESPN being available and continuing to serve the same image URLs. The same Team Emblem is duplicated across Matches, a Team cannot be recognized independently of its display name, and the application has no controlled lifecycle for refreshed emblems.

## Solution

The Match Centre will own the delivery of Team Emblems. ESPN remains an ingestion source: the scraper identifies Teams from explicit ESPN links when available, downloads emblems during ingestion, and the application serves retained copies from application-controlled storage. A Team has one current canonical name and one current Team Emblem shared by all of its Matches.

Production emblems are persisted on a Railway Volume and local development emblems in a Git-ignored local directory. Emblem changes create a new content-hashed stored file. The server owns a dedicated cleanup operation that removes orphaned old files after seven days; a separate Railway cron service triggers it daily using Railway's private network and a secret token.

## User Stories

1. As a supporter, I want Match pages to load Team Emblems from the Match Centre, so that ESPN availability does not affect the page.
2. As a supporter, I want the same Team Emblem to appear consistently across scheduled Matches and Match Results, so that I can recognize Teams reliably.
3. As a supporter, I want current Team names to appear on all Matches, including historical ones, so that corrected or renamed Teams are represented consistently.
4. As a supporter, I want Match information to remain visible when an upstream emblem cannot be downloaded, so that an image problem does not hide a Match.
5. As a supporter, I want a neutral fallback mark when a Team has no retained Team Emblem yet, so that the page remains understandable.
6. As a data maintainer, I want a Team to have one reusable current Team Emblem, so that the system does not duplicate the same asset on every Match.
7. As a data maintainer, I want a newly discovered Team with a valid ESPN Team ID to be created automatically, so that new opponents appear without manual setup.
8. As a data maintainer, I want the scraper to use an explicit ESPN Team ID when it is available, so that display-name changes do not create duplicate Teams.
9. As a data maintainer, I want rows that lack a reliable ESPN Team ID to be logged and handled through name/alias fallback, so that uncertain upstream markup does not silently merge Teams incorrectly.
10. As a data maintainer, I want a changed upstream Team Emblem to replace the Team's current reference, so that the application can adopt legitimate emblem updates.
11. As a data maintainer, I want an unchanged upstream Team Emblem to avoid creating another stored file, so that storage is not wasted.
12. As a data maintainer, I want a failed Team Emblem refresh to preserve the last known-good Team Emblem, so that temporary ESPN failures do not degrade existing Match pages.
13. As a data maintainer, I want a Team whose first emblem download fails to remain available for Match ingestion, so that Match coverage is not coupled to an asset download.
14. As an operator, I want production Team Emblems to survive Railway deployments, so that deploying the application does not erase them.
15. As a developer, I want Team Emblems to be stored in a local Git-ignored directory during development, so that I can develop and test without Railway.
16. As an operator, I want changed Team Emblems to receive new content-hashed application paths, so that browsers do not show stale cached images.
17. As an operator, I want superseded Team Emblems retained for seven days, so that already-open pages do not receive a broken image while storage remains bounded.
18. As an operator, I want orphaned Team Emblems to be removed by a dedicated server cleanup operation, so that retention is not a responsibility of the scraper.
19. As an operator, I want only a Railway cron service on the private network with the configured secret token to trigger cleanup, so that deletion capability is not publicly exposed.
20. As a data maintainer, I want existing legacy Matches backfilled into Teams and retained Team Emblems, so that historical Match data gains the same availability guarantees.
21. As a data maintainer, I want unresolved legacy records reported for review rather than discarded, so that migration does not silently lose data.

## Implementation Decisions

- Introduce Team as the reusable participant referenced by a Match. A Team owns its current canonical name and may carry an optional ESPN Team ID during the transition.
- Introduce Team Emblem as a retained asset associated with a Team. Keep enough history and replacement metadata to identify the current emblem and safely delete superseded ones.
- Migrate existing Matches from direct home/away names and ESPN emblem URLs to home/away Team relationships. Preserve scores, Match Day, Kickoff Time, league, and status. Backfill distinct legacy Teams and download retained emblems; report unresolved records for manual review.
- Translate persisted Match records to the existing browser-facing Match read representation with current Team names and application-owned Team Emblem URLs. Do not expose ESPN URLs or persistence-specific Team/Team Emblem structures to the browser.
- Retain the existing Match HTTP read boundary as the browser contract. Add a server-owned static-emblem delivery boundary and a neutral browser fallback for missing emblems.
- Refactor ESPN ingestion so each side of a scraped row yields Team display data, optional explicit ESPN Team ID parsed from its Team link, and an emblem source URL. Never derive Team identity from the emblem URL.
- Treat the ESPN Team ID as optional until results and calendar row structures are both verified. Use the name-and-alias fallback for rows without it and log malformed or ambiguous rows.
- For an existing Team, download an ESPN emblem only during ingestion. Compare content with the current retained emblem; write a new content-hashed file and change the current reference only when content changed.
- A failed refresh must keep the current retained Team Emblem. For a new Team whose initial download fails, import the Team and Match without an emblem so that later ingestions can retry it.
- Configure a single Team Emblem storage abstraction with a local Git-ignored development directory and the Railway Volume mount path in production. Store only file metadata and application paths in the database, not image bytes.
- The server owns the cleanup module and protected cleanup operation because it owns the mounted Volume. A separate short-lived Railway cron service invokes that operation daily through Railway's private network and supplies a secret token. The operation deletes only non-current Team Emblems replaced more than seven days ago, then removes their metadata.
- Do not expose cleanup through the public internet. Do not make cleanup part of the scraper.
- Display each Team's current canonical name for every Match; do not retain Match-time name snapshots.

## Testing Decisions

- Test observable behavior rather than ORM calls, filesystem helper internals, or component implementation details.
- The primary integration seam is the Match HTTP read boundary. Its tests should prove that Match responses contain current Team names and application-owned emblem URLs, while retaining existing search and filter behavior.
- Test ESPN ingestion at its row-to-domain boundary. Cover explicit ESPN Team ID extraction from Team links, valid Team discovery, name/alias fallback, malformed-row reporting, current-emblem preservation after refresh failure, and Match import when an initial emblem download fails.
- Test Team Emblem storage and lifecycle through its public service behavior: unchanged content reuses the current emblem, changed content creates a new application path, and failed writes do not replace a known-good current emblem.
- Test the protected cleanup operation at its server boundary: it accepts only private-job authentication, deletes only orphaned emblems older than seven days, leaves current/recent assets intact, and removes corresponding metadata only after successful deletion.
- Test the browser fallback at the Match-card boundary so a missing Team Emblem produces the neutral mark without losing Team or Match information.
- Test the migration/backfill with representative legacy Match data: shared legacy Teams become one Team, valid legacy emblems are retained, and unresolved records are reported without deleting Matches.
- Follow existing server route tests for browser-facing Match contracts and existing web tests that use mocked HTTP responses and DOM-visible assertions for scheduled Matches and Match Results.

## Out of Scope

- Replacing ESPN as the source of Match data or Team Emblems.
- Introducing a general-purpose media library, content-management interface, or user-uploaded assets.
- Historical Team-name snapshots per Match.
- Making the Railway Volume available to multiple service instances or introducing object storage in this change.
- Automatically resolving every legacy ambiguity without reporting it for review.
- Public or manually accessible cleanup endpoints.

## Further Notes

- The application has permission to retain and serve the ESPN Team Emblems for this use.
- The ESPN results-page investigation found explicit Team links with numeric IDs. Calendar-page link structure remains to be verified before an ESPN Team ID becomes mandatory.
- This spec follows the domain glossary in `CONTEXT.md` and the accepted decisions in ADR-0003 through ADR-0005. The supporting investigation is recorded in `docs/research/espn-team-identity.md`.

# Stable ESPN Match Identity for Fixtures

Status: ready-for-agent

## Problem Statement

An ESPN fixture is currently identified by its home Team, away Team, and Match Day. Match Day and Kickoff Time are mutable schedule data, not source identity. When production ingestion previously read ESPN's calendar in UTC, Internacional v Cruzeiro was saved as 23/07/2026 at 00:30. After timezone-correct ingestion read the same ESPN fixture as 22/07/2026 at 21:30, the application created a second Match because the Match Day had changed.

Supporters can therefore see duplicate Fixtures, and an ESPN correction or reschedule can create another duplicate even when the scraper is otherwise functioning correctly.

## Solution

Upcoming Fixture ingestion will retain ESPN's explicit ESPN Match ID and use it as the Match identity whenever ESPN supplies one. Re-ingesting the same ESPN Match will update its Match Day, Kickoff Time, Teams, competition, and status instead of creating another Match.


## User Stories

1. As a supporter, I want each Fixture to appear once, so that the schedule is trustworthy.
2. As a supporter, I want a changed kickoff to update the existing Fixture, so that I see the current ESPN schedule rather than a duplicate.
3. As a supporter, I want a Fixture whose kickoff crosses midnight after an upstream correction to retain its identity, so that Match Day changes do not create another card.
4. As a data maintainer, I want Upcoming Fixture rows to retain ESPN Match IDs, so that source identity does not depend on mutable Match Day or Kickoff Time.
5. As a data maintainer, I want repeat ingestion of an ESPN Fixture to update the existing Match by ESPN Match ID, so that refreshes are idempotent.
6. As a data maintainer, I want the same identity behavior for completed Matches and Fixtures, so that all ESPN-sourced Matches follow one clear rule.
7. As an operator, I want calendar rows without an explicit ESPN Match ID reported and handled conservatively, so that missing upstream identity cannot merge different Matches.
8. As a developer, I want the browser-facing Match representation to remain free of ESPN persistence identifiers, so that source-specific details stay internal.

## Implementation Decisions

- Treat ESPN Match ID as the canonical source identity for every Match when ESPN provides an explicit Match link. The existing optional, uniquely constrained persisted ESPN Match ID is reused; no new identity column is required.
- Extend upcoming-calendar row extraction to locate the explicit ESPN Match link and parse its numeric Match ID with the existing ESPN Match ID parser.
- Deepen the Match ingestion module so callers supply optional ESPN identity and mutable Match data, while the module chooses its persistence lookup: ESPN Match ID first; the existing home-Team, away-Team, Match Day key only when ESPN identity is absent.
- A Match found by ESPN Match ID is updated with the newly ingested Match Day, Kickoff Time, Teams, scores, competition, and status. Match Day is not an identity condition in this path.
- Retain the current fallback identity only for upstream rows that genuinely lack an explicit ESPN Match ID. Record such rows for operator review; do not infer an ID from display text, Team names, dates, or kickoff times.
- Keep ESPN Match ID internal to ingestion and persistence. The Match HTTP read representation and browser contracts remain unchanged.
- Preserve the recently added `America/Sao_Paulo` ESPN-page timezone pinning. Stable identity complements it; it does not replace correct source localization.

## Testing Decisions

- Test externally observable ingestion behavior at the Match ingestion module seam, not individual Prisma call shapes or Puppeteer selectors.
- Add coverage showing that a Fixture with the same ESPN Match ID but a changed Match Day and Kickoff Time updates one Match rather than creating two.
- Add coverage showing that completed-Match and Upcoming Fixture ingestion both retain an explicit ESPN Match ID from their respective ESPN rows.
- Add coverage for calendar rows missing an ESPN Match ID: ingestion uses the conservative fallback and reports the missing source identity rather than guessing.
- Follow the existing ESPN identity parser tests and Match service tests as prior art. Keep the existing HTTP route tests to prove that ESPN Match IDs do not leak to browsers.

## Out of Scope

- Changing the browser layout or browser-facing Match HTTP contract.
- Replacing ESPN as the source of Fixtures or completed Matches.
- Guessing source identity for rows that lack an explicit ESPN Match link.
- Automatically merging historical Matches without ESPN-ID verification.
- A general Match scheduling or manual fixture-management interface.

## Further Notes

- The ESPN Match ID was already introduced for completed Matches and Goal Summary retrieval. This work extends that established identity model to Upcoming Fixtures.
- The primary test seam is the Match ingestion module because it is where stable source identity must override mutable schedule fields. This keeps calendar extraction and persistence callers simple.

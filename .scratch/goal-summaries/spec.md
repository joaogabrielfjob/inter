# Goal Summaries for Match Results

Status: ready-for-agent

## Problem Statement

A supporter can see the final score of a completed Match, but cannot see who scored or when. The existing Match Results card therefore does not explain how a result happened. The application currently retains only Match results, not ESPN Match identity or Goal information.

## Solution

Each completed Match Result will have an instant, two-sided card. Its unchanged front face gains a top-right **Ver gols** action. The action flips the card horizontally to a Goal Summary face, and **Voltar ao resultado** flips it back. The Goal Summary is retrieved from ESPN after Match result ingestion, stored with the Match, and returned with each Match Results batch.

The application will backfill Goal Summaries for completed Matches already stored and will ingest them for future completed Matches. It will only present a Verified Goal Summary: per-Team Goal counts must match the final score. A missing or inconsistent upstream Goal list remains visible to the supporter as an Unavailable Goal Summary rather than being confused with a scoreless Match.

## User Stories

1. As a supporter, I want to open a completed Match card's Goal Summary, so that I can understand who scored in the Match.
2. As a supporter, I want the card front to retain its current score, Team, competition, Match Day, and venue presentation, so that browsing Match Results remains familiar.
3. As a supporter, I want the Goal Summary action in the card's top-right corner, so that I can find it without adding a new lower section to the card.
4. As a supporter, I want the card to flip to its Goal Summary and back to its result, so that the additional information remains contained in the same card.
5. As a supporter, I want the flip to be immediate after selecting **Ver gols**, so that I do not wait for another request after interacting with the card.
6. As a supporter who prefers reduced motion, I want the card face to change without the flip animation, so that the interaction respects my device preference.
7. As a supporter, I want smaller Team Emblems at the top of the Goal Summary face, so that I can quickly identify each Team's Goal column.
8. As a supporter, I want a Team's Goals listed beneath its own Team Emblem from earliest to latest, so that the scoring sequence is easy to scan.
9. As a supporter, I want home-Team entries to read scorer then minute and away-Team entries to read minute then scorer, so that the two columns are visually balanced.
10. As a supporter, I want a normal Goal displayed with its scorer and Match minute, so that I know who scored and when.
11. As a supporter, I want a penalty Goal marked with **P**, so that I can distinguish it from a normal Goal without cluttering the card.
12. As a supporter, I want an Own Goal marked with **C** and placed beneath the Team whose score increased, so that the Goal Summary still explains the score correctly.
13. As a supporter, I want stoppage-time minutes retained when ESPN provides them, so that Goal timing is accurate.
14. As a supporter, I want a 0–0 Match to say **Sem gols na partida**, so that an empty Goal list is explained clearly.
15. As a supporter, I want a Match whose ESPN Goal information could not be verified to say **Não foi possível encontrar os gols desta partida**, so that I do not mistake missing information for a scoreless Match.
16. As a supporter, I want every completed-Match card to provide the Goal Summary action, so that the interaction remains predictable for scoreless and unavailable cases too.
17. As a supporter, I want Goal information returned with each small Match Results batch, so that opening any loaded card is instant.
18. As a data maintainer, I want ESPN's stable Match ID retained for each completed Match, so that the scraper can retrieve and retry the exact Goal Summary page without searching by mutable display data.
19. As a data maintainer, I want completed Match results saved even when their separate Goal Summary retrieval fails, so that temporary ESPN failures do not hide results.
20. As a data maintainer, I want every existing completed Match considered by the one-time Goal Summary Backfill, so that historical Match Results receive the same feature as future ones.
21. As a data maintainer, I want future completed Matches to receive Goal Summary ingestion after result ingestion, so that the feature stays current.
22. As a data maintainer, I want an inconsistent ESPN Goal list rejected when it does not add up to the final score, so that supporters never see a misleading partial explanation.
23. As a data maintainer, I want a repeat Goal Summary ingestion to replace a prior verified summary rather than append duplicate Goals, so that repeated runs remain correct.
24. As a data maintainer, I want a failed later retrieval to retain a previously verified Goal Summary, so that temporary upstream failures do not degrade known-good information.

## Implementation Decisions

- Follow ADR-0007: retain the numeric ESPN Match ID obtained from the explicit ESPN Match link in a completed-result row. Do not use Match title, Team names, or date as the source identity for Goal Summary retrieval.
- Follow ADR-0008: ingest completed Match results first, then run Goal Summary ingestion as a separate following step. A Goal Summary failure must not roll back or prevent result ingestion.
- Extend the persisted Match model with its ESPN Match ID and a Goal Summary availability state. Persist each Goal as display-ready data associated with its Match: scorer name exactly as ESPN displays it, Match minute, scoring Team side, and optional Own Goal or penalty marker. Do not introduce a general Player model.
- A Goal Summary is Verified only when its per-Team Goal counts exactly match the completed Match's final score. A 0–0 Match has a Verified empty Goal Summary. Retrieval, parsing, or validation failure produces an Unavailable Goal Summary unless a prior Verified Goal Summary already exists.
- A later Verified Goal Summary replaces the Match's complete existing Goal list atomically. It must not append duplicate Goals. A later failed retrieval preserves an existing Verified Goal Summary.
- Extract the ESPN Match ID from result rows during current-season and Historical Season Ingestion. The one-time Goal Summary Backfill must resolve IDs for existing completed Matches from ESPN result rows before retrieving their summaries; rows that cannot be resolved or verified remain unavailable for a later retry.
- Parse ESPN Match pages for scorer display names, minutes including stoppage time, penalty labels, and Own Goal labels. Preserve normal Goal chronology within each scoring Team. An Own Goal is stored under the Team whose score increased.
- Extend the existing browser-facing Match read representation and Match Results HTTP collection to include only the Goal Summary content and availability needed by the card. Do not expose ESPN Match IDs or persistence-specific structures to the browser.
- Keep Match Results cursor pagination and filtering behavior unchanged. Goal Summary data travels with each existing small batch; the browser does not make a per-card Goal request.
- Keep the current Result Card front face information and layout order. Add a top-right text action labelled **Ver gols**. Its Goal Summary face has smaller Team Emblems, home Goals left-aligned as `Scorer (P/C) — minute`, away Goals right-aligned as `minute — Scorer (P/C)`, and **Voltar ao resultado**.
- Use a short horizontal flip transition between card faces. Respect `prefers-reduced-motion` by changing faces without the animated transition.
- The 0–0 Goal Summary face says **Sem gols na partida**. An Unavailable Goal Summary face retains both Team Emblems and says **Não foi possível encontrar os gols desta partida**.
- Do not add special card-height expansion, an internal Goal-list scroll area, or another event type in this feature.

## Testing Decisions

- Test externally observable behavior, not ORM calls, CSS implementation details, or Puppeteer selector internals.
- Test Goal Summary ingestion at its public service boundary using representative ESPN Match-page data. Cover normal Goals, chronological ordering, stoppage time, penalty and Own Goal markers, scoring-side assignment, scoreless Matches, parsing failures, and score-count mismatches.
- Test the repeat-ingestion seam: a later Verified Goal Summary replaces the prior Goal list without duplicates; a later unavailable retrieval preserves the prior verified list.
- Test ESPN Match ID extraction from finished-result rows and backfill resolution behavior, including an unresolved historical Match becoming unavailable without losing its result.
- Test the existing Match HTTP read boundary, following the current route-test style. Prove that a Match Results batch contains browser-facing Goal Summary data for Verified, scoreless, and Unavailable states while preserving filters and cursor pagination.
- Test the Result Card through user-visible DOM behavior, following the existing Match Results React test style. Prove that a supporter can flip and return; that normal, penalty, Own Goal, scoreless, and unavailable presentations are correct; and that the action is available on every completed Match card.
- Test reduced-motion behavior as an observable accessibility contract where the existing browser test setup can express it; do not assert specific animation classes or duration internals.

## Out of Scope

- Cards, substitutions, line-ups, venue changes, referee information, possession, shots, or any Match event other than Goals.
- A general Player, Team-event, or Match-statistics model.
- A dedicated Match-details page, dialog, or separate Goal Summary HTTP request.
- Replacing ESPN as the Match or Goal source.
- Redesigning the existing Result Card front face, changing its height proactively, or adding Goal-list scrolling.
- Replacing the text actions with a ball icon.
- Automatically repairing ESPN data whose Goal counts do not match the final score.

## Further Notes

- This specification uses the glossary terms Goal, Goal Summary, Verified Goal Summary, Unavailable Goal Summary, Goal Summary Backfill, Goal Summary Ingestion, Own Goal, Penalty Goal, and ESPN Match ID from `CONTEXT.md`.
- The ESPN investigation confirmed an explicit Match link in completed-result rows and Match pages that display scorer names, Goal minutes, stoppage time, and penalty labels.
- The feature is constrained by ADR-0002's browser-facing Match read boundary and ADR-0006's cursor pagination, in addition to ADR-0007 and ADR-0008.

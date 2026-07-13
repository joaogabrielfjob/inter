# 04 — Parse grouped ESPN Goals and ignore non-Goal events

**What to build:** Goal Summary ingestion must correctly interpret ESPN's scoring columns when a scorer has multiple Goal minutes in one display entry, and it must ignore card and other non-Goal rows that appear alongside a Goal in the same Team column.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A repeated scorer entry such as `Vitor Roque - 4', 24', 43'` produces three chronological Goals for the scoring Team rather than one Goal at the first minute.
- [ ] A Team column containing a Goal and a card event only produces the Goal; the card recipient and minute are never stored as a Goal.
- [ ] Goal Summary verification succeeds for the confirmed ESPN replays: Match 524 (Palmeiras 4–1 Internacional), Match 9 (Internacional 4–1 Vasco da Gama), and Match 440 (Grêmio 3–1 Internacional).
- [ ] Existing single-Goal entries, stoppage time, penalty markers, Own Goal markers, scoreless Matches, and mismatched summaries retain their current behavior.

## Investigation evidence

The current scraper selects all display text in the ancestor of a `soccer-goal02` icon and passes each text node to a parser that accepts only one minute. It therefore loses repeated minutes and interprets adjacent card rows as Goals. The resulting per-Team Goal counts do not match the completed Match score, so Goal Summary Ingestion correctly records an Unavailable Goal Summary.

Replayed ESPN pages:

- Match 524 / ESPN 732816: `Vitor Roque - 4', 24', 43'` is parsed as only minute 4, yielding 2–1 instead of 4–1.
- Match 9 / ESPN 401841126: `Johan Carbonero - 21', 71'` loses minute 71; the adjacent red-card row `Carlos Cuesta - 90'+2'` is treated as an away Goal, yielding 3–2 instead of 4–1.
- Match 440 / ESPN 665884: the adjacent red-card row `Wálter Kannemann - 52'` is treated as a home Goal, yielding 4–1 instead of 3–1.

## Testing notes

Add focused Goal Summary scraper/parser tests using the three representative rendered-column shapes above. At the Goal Summary Ingestion service boundary, assert that each parsed summary verifies against its stored completed-Match score. Do not make the test depend on live ESPN markup or Puppeteer.

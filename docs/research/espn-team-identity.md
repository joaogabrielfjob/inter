# ESPN team identity in match pages

**Question:** Can the ESPN results/calendar pages used by the scraper provide a stable source identifier for each team, including Internacional's opponents?

## Finding

Yes, for the results page inspected on 2026-07-12: each team has an explicit link whose path contains an ESPN numeric team ID. This is a stronger ingestion key than a display name or an emblem URL.

The current scraper does not retain those links. It extracts only the text in the home/away columns and the two image `src` values. [Current scraper](../../scrap/src/handler/match_handler.ts) (finished matches, lines 20–49; upcoming matches, lines 90–117).

## Evidence

An authenticated-by-browser, read-only Puppeteer capture of ESPN's current Internacional **results** page returned these team links and image URLs:

| Team | Explicit team link | Image source token |
| --- | --- | --- |
| Red Bull Bragantino | `https://www.espn.com.br/futebol/time/_/id/6079/red-bull-bragantino` | `/i/teamlogos/soccer/500/6079.png` |
| Vitória | `https://www.espn.com.br/futebol/time/_/id/3457/vitoria` | `/i/teamlogos/soccer/500/3457.png` |
| Vasco da Gama | `https://www.espn.com.br/futebol/time/_/id/3454/vasco-da-gama` | `/i/teamlogos/soccer/500/3454.png` |
| Internacional | `https://www.espn.com.br/futebol/time/_/id/1936/internacional` | `/i/teamlogos/soccer/500/1936.png` |

The inspected page is the same source pattern used by the scraper: [ESPN Internacional results](https://www.espn.com.br/futebol/time/resultados/_/id/1936/bra.internacional). The current URL builder likewise identifies Internacional as `id/1936`. [Source](../../scrap/src/handler/match_handler.ts).

The ID happens to match the number embedded in these current emblem URLs. That correlation is insufficient as an integration contract: the image is passed through ESPN's `combiner` CDN with sizing/cropping/query parameters, while the team link expressly represents the team. The existing scraper also strips and later reconstructs that image URL, which makes it especially unsuitable as an identity source. [Source](../../scrap/src/handler/match_handler.ts).

## Limitation

The equivalent live calendar-page probe exceeded the timebox before it returned. The scraper's calendar path uses the same table layout and separately reads home/away columns and the two images, but this does **not** prove the link structure is identical for every future calendar row. [Source](../../scrap/src/handler/match_handler.ts).

## Recommendation

Add an optional `espnId` to `Team` and extract it from each home/away team's explicit `a[href]` team link, parsing the numeric segment after `/id/`. Use `(source = ESPN, espnId)` as the ingestion lookup key; keep `Team.id` for internal relations and `Team.name` for display. Do not derive identity from the emblem URL.

Before making `espnId` required, add a scraper-level check against both results and calendar fixtures/pages: require exactly one matching team link per side, log rows that do not meet that expectation, and fall back to the existing name/alias workflow for those rows. This keeps a source-markup change from incorrectly merging Teams.

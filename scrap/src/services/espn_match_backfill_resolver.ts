import type { Browser } from 'puppeteer'
import { espnMatchIdFromLink } from '../lib/espn_match_identity'
import { newEspnPage } from '../lib/espn_page'
import { parseDate } from '../lib/parse_date'
import type { HistoricalRetryableCompletedMatch } from './goal_summary_backfill'

type EspnFinishedResultRow = {
  date: string
  home: string
  homeScore: number
  away: string
  awayScore: number
  matchLink?: string
}

const resultsUrl = (season: number) =>
  `https://www.espn.com.br/futebol/time/resultados/_/id/1936/temporada/${season}`

export async function resolveHistoricalEspnMatchId(browser: Browser, match: HistoricalRetryableCompletedMatch) {
  const page = await newEspnPage(browser)
  try {
    const season = match.date.getUTCFullYear()
    await page.goto(resultsUrl(season), { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await page.waitForSelector('.Table__TR.Table__TR--sm.Table__even', { timeout: 10_000 })
    const rows = await page.evaluate(() => Array.from(document.querySelectorAll('.Table__TR.Table__TR--sm.Table__even')).flatMap((row) => {
      const columns = row.querySelectorAll('td')
      const date = columns[0]?.innerText.trim()
      const home = columns[1]?.innerText.trim()
      const score = columns[2]?.innerText.trim()
      const away = columns[3]?.innerText.trim()
      const matchLink = Array.from(row.querySelectorAll('a')).find((link) => /\/jogoId\/\d+/.test(link.href))?.href
      const [homeScore, awayScore] = score?.split('-').map((value) => Number.parseInt(value.trim(), 10)) ?? []

      return date && home && away && homeScore !== undefined && awayScore !== undefined
        && Number.isFinite(homeScore) && Number.isFinite(awayScore)
        ? [{ date, home, homeScore, away, awayScore, matchLink }]
        : []
    }))

    return resolveEspnMatchIdFromFinishedRows(match, rows, season)
  } finally {
    await page.close()
  }
}

export function resolveEspnMatchIdFromFinishedRows(
  match: HistoricalRetryableCompletedMatch,
  rows: EspnFinishedResultRow[],
  season = match.date.getUTCFullYear(),
) {
  const ids = rows.flatMap((row) => {
    const date = parseDate(row.date, season)
    const id = espnMatchIdFromLink(row.matchLink)
    return date?.getTime() === match.date.getTime()
      && row.home === match.homeTeamName
      && row.away === match.awayTeamName
      && row.homeScore === match.homeScore
      && row.awayScore === match.awayScore
      && id !== undefined
      ? [id]
      : []
  })

  return ids.length === 1 ? ids[0] : undefined
}

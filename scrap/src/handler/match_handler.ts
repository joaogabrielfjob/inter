import { Browser } from 'puppeteer'
import { MatchStatus } from '../enums/match_status'
import { parseDate } from '../lib/parse_date'
import { matchService } from '../services/match_service'
import { espnTeamIdFromLink } from '../lib/espn_team_identity'
import { teamEmblemUrl } from '../lib/team_emblem_url'
import { espnMatchIdFromLink } from '../lib/espn_match_identity'
import { ingestGoalSummary } from '../services/goal_summary_ingestion'
import { retrieveEspnGoalSummary } from '../services/goal_summary_scraper'
import { goalSummaryStore } from '../services/goal_summary_store'

const url = (type: 'calendario' | 'resultados', season?: number) => {
  const teamUrl = `https://www.espn.com.br/futebol/time/${type}/_/id/1936`
  return season ? `${teamUrl}/temporada/${season}` : `${teamUrl}/bra.internacional`
}

export const matchHandler = {
  scrapeFinishedMatches: async (browser: Browser, season?: number) => {
    const page = await browser.newPage()

    await page.goto(url('resultados', season), { waitUntil: 'networkidle0' })

    const { matches, skippedRows } = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.Table__TR.Table__TR--sm.Table__even'))
      
      const matches = []
      const skippedRows = []

      for (const row of rows) {
        const columns = row.querySelectorAll('td')
        const [date, home, score, emblems, away, league] = [
          columns[0]?.innerText.trim(),
          columns[1]?.innerText.trim(),
          columns[2]?.innerText.trim(),
          columns[2]?.querySelectorAll('img'),
          columns[3]?.innerText.trim(),
          columns[5]?.innerText.trim()
        ]

        if (!date || !home || !score || !away || !league) {
          skippedRows.push(row.textContent?.trim() ?? '')
          continue
        }

        const [homeScore, awayScore] = score.split('-').map(s => parseInt(s.trim(), 10))
        const homeEmblem = emblems?.[0]?.src
        const awayEmblem = emblems?.[1]?.src
        const homeLink = columns[1]?.querySelector('a')?.href
        const awayLink = columns[3]?.querySelector('a')?.href
        const matchLink = Array.from(row.querySelectorAll('a')).find((link) => /\/jogoId\/\d+/.test(link.href))?.href

        if (homeScore === undefined || awayScore === undefined || Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
          skippedRows.push(row.textContent?.trim() ?? '')
          continue
        }

        matches.push({
          date,
          home,
          homeScore,
          homeLink,
          homeEmblem,
          away,
          awayLink,
          awayScore,
          awayEmblem,
          league,
          matchLink,
        })
      }
      
      return { matches, skippedRows }
    })

    const promises = []
    for (const match of matches) {
      const parsedDate = parseDate(match.date, season)

      if (!parsedDate) {
        skippedRows.push(match.date)
        continue
      }

      const espnMatchId = espnMatchIdFromLink(match.matchLink)
      const result = await matchService.upsertMatch({
        date: parsedDate,
        homeTeam: { name: match.home, espnTeamId: espnTeamIdFromLink(match.homeLink), emblemUrl: teamEmblemUrl(match.homeEmblem) },
        homeScore: match.homeScore,
        awayTeam: { name: match.away, espnTeamId: espnTeamIdFromLink(match.awayLink), emblemUrl: teamEmblemUrl(match.awayEmblem) },
        awayScore: match.awayScore,
        championship: match.league,
        status: MatchStatus.FINISHED,
        espnMatchId,
      })

      if (espnMatchId) {
        promises.push(ingestGoalSummary(result, goalSummaryStore, () => retrieveEspnGoalSummary(browser, espnMatchId)))
      }
    }

    await Promise.all(promises)

    if (season && skippedRows.length) {
      throw new Error(`Skipped ${skippedRows.length} invalid row(s) while ingesting ESPN season ${season}: ${skippedRows.join(' | ')}`)
    }
  },
  discoverFinishedMatchSeasons: async (browser: Browser) => {
    const page = await browser.newPage()

    await page.goto(url('resultados'), { waitUntil: 'networkidle0' })

    const discovered = await page.evaluate(() => {
      const seasonFromOption = (option: HTMLOptionElement) => {
        const seasonInUrl = option.value.match(/\/temporada\/(19|20)\d{2}/)
        if (seasonInUrl) return parseInt(seasonInUrl[0].replace('/temporada/', ''), 10)

        return /^(19|20)\d{2}$/.test(option.value) ? parseInt(option.value, 10) : undefined
      }

      const select = Array.from(document.querySelectorAll('select')).find((candidate) =>
        Array.from(candidate.options).some((option) => seasonFromOption(option) !== undefined)
      )
      if (!select) return undefined

      const seasons = Array.from(select.options).map(seasonFromOption).filter((season): season is number => season !== undefined)
      const activeSeason = Array.from(select.options).find((option) => option.selected)
      const active = activeSeason ? seasonFromOption(activeSeason) : undefined

      return active === undefined || seasons.length === 0 ? undefined : { activeSeason: active, seasons }
    })

    if (!discovered) throw new Error('Could not reliably discover ESPN season options and active season')
    return discovered
  },
  scrapeUpcomingMatches: async (browser: Browser) => {
    const page = await browser.newPage()

    await page.goto(url('calendario'), { waitUntil: 'networkidle0' })

    const matches = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.Table__TR.Table__TR--sm.Table__even'))
      
      const response = []

      for (const row of rows) {
        const columns = row.querySelectorAll('td')
        const [date, home, emblems, away, time, league] = [
          columns[0]?.innerText.trim(),
          columns[1]?.innerText.trim(),
          columns[2]?.querySelectorAll('img'),
          columns[3]?.innerText.trim(),
          columns[4]?.innerText.trim(),
          columns[5]?.innerText.trim()
        ]

        if (!date || !home || !away || !league || !time) continue
        
        const homeEmblem = emblems?.[0]?.src
        const awayEmblem = emblems?.[1]?.src
        const homeLink = columns[1]?.querySelector('a')?.href
        const awayLink = columns[3]?.querySelector('a')?.href

        response.push({
          date,
          home,
          homeLink,
          homeEmblem,
          away,
          awayLink,
          awayEmblem,
          time,
          league
        })
      }
      
      return response
    })

    const promises = []
    for (const match of matches) {
      const parsedDate = parseDate(match.date)

      if (!parsedDate) continue

      const promise = matchService.upsertMatch({
        date: parsedDate,
        homeTeam: { name: match.home, espnTeamId: espnTeamIdFromLink(match.homeLink), emblemUrl: teamEmblemUrl(match.homeEmblem) },
        homeScore: 0,
        awayTeam: { name: match.away, espnTeamId: espnTeamIdFromLink(match.awayLink), emblemUrl: teamEmblemUrl(match.awayEmblem) },
        awayScore: 0,
        championship: match.league,
        status: MatchStatus.UPCOMING,
        time: match.time
      })

      promises.push(promise)
    }

    await Promise.all(promises)
  }
}

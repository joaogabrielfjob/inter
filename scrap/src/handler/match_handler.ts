import { Browser } from 'puppeteer'
import { MatchStatus } from '../enums/match_status'
import { parseDate } from '../lib/parse_date'
import { matchService } from '../services/match_service'
import { espnTeamIdFromLink } from '../lib/espn_team_identity'
import { teamEmblemUrl } from '../lib/team_emblem_url'

const url = (type: 'calendario' | 'resultados') => {
  return `https://www.espn.com.br/futebol/time/${type}/_/id/1936/bra.internacional`
}

export const matchHandler = {
  scrapeFinishedMatches: async (browser: Browser) => {
    const page = await browser.newPage()

    await page.goto(url('resultados'), { waitUntil: 'networkidle0' })

    const matches = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.Table__TR.Table__TR--sm.Table__even'))
      
      const response = []

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

        if (!date || !home || !score || !away || !league) continue

        const [homeScore, awayScore] = score.split('-').map(s => parseInt(s.trim(), 10))
        const homeEmblem = emblems?.[0]?.src
        const awayEmblem = emblems?.[1]?.src
        const homeLink = columns[1]?.querySelector('a')?.href
        const awayLink = columns[3]?.querySelector('a')?.href

        if (homeScore === undefined || awayScore === undefined) continue

        response.push({
          date,
          home,
          homeScore,
          homeLink,
          homeEmblem,
          away,
          awayLink,
          awayScore,
          awayEmblem,
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
        homeScore: match.homeScore,
        awayTeam: { name: match.away, espnTeamId: espnTeamIdFromLink(match.awayLink), emblemUrl: teamEmblemUrl(match.awayEmblem) },
        awayScore: match.awayScore,
        championship: match.league,
        status: MatchStatus.FINISHED
      })

      promises.push(promise)
    }

    await Promise.all(promises)
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

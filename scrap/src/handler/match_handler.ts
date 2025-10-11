import { Browser } from 'puppeteer'
import { parseDate } from '../lib/parse_date'
import { matchService } from '../services/match_service'
import { MatchStatus } from '../enums/match_status'

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

        if (!date || !home || !score || !emblems || !away || !league) continue

        const [homeScore, awayScore] = score.split('-').map(s => parseInt(s.trim(), 10))
        const homeEmblem = emblems[0]?.src.split('.png')[0]
        const awayEmblem = emblems[1]?.src.split('.png')[0]

        if (homeScore === undefined || !homeEmblem || awayScore === undefined || !awayEmblem) continue

        response.push({
          date,
          home,
          homeScore,
          homeEmblem,
          away,
          awayScore,
          awayEmblem,
          league
        })
      }
      
      return response
    })

    const promises = []
    for (const match of matches) {
      const parsedDate = parseDate(match.date, '')

      if (!parsedDate) continue

      const homeEmblem = match.homeEmblem + '.png&h=100&w=100'
      const awayEmblem = match.awayEmblem + '.png&h=100&w=100'

      const promise = matchService.upsertMatch({
        date: parsedDate,
        homeTeam: match.home,
        homeScore: match.homeScore,
        homeEmblem: homeEmblem,
        awayTeam: match.away,
        awayScore: match.awayScore,
        awayEmblem: awayEmblem,
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

        if (!date || !home || !emblems || !away || !league || !time) continue
        
        const homeEmblem = emblems[0]?.src.split('.png')[0]
        const awayEmblem = emblems[1]?.src.split('.png')[0]

        if (!homeEmblem || !awayEmblem) continue

        response.push({
          date,
          home,
          homeEmblem,
          away,
          awayEmblem,
          time,
          league
        })
      }
      
      return response
    })

    const promises = []
    for (const match of matches) {
      const parsedDate = parseDate(match.date, match.time)

      if (!parsedDate) continue

      const homeEmblem = match.homeEmblem + '.png&h=100&w=100'
      const awayEmblem = match.awayEmblem + '.png&h=100&w=100'

      const promise = matchService.upsertMatch({
        date: parsedDate,
        homeTeam: match.home,
        homeScore: 0,
        homeEmblem: homeEmblem,
        awayTeam: match.away,
        awayScore: 0,
        awayEmblem: awayEmblem,
        championship: match.league,
        status: MatchStatus.UPCOMING
      })

      promises.push(promise)
    }

    await Promise.all(promises)
  }
}
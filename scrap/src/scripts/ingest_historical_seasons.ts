import puppeteer from 'puppeteer'
import { matchHandler } from '../handler/match_handler'
import { runHistoricalSeasonIngestion } from '../services/historical_season_ingestion'

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
})

try {
  const result = await runHistoricalSeasonIngestion({
    discoverSeasons: () => matchHandler.discoverFinishedMatchSeasons(browser),
    ingestSeason: (season) => matchHandler.scrapeFinishedMatches(browser, season)
  })

  console.info(`Imported ESPN seasons: ${result.importedSeasons.join(', ') || 'none'}`)

  if (result.failedSeasons.length) {
    for (const failure of result.failures) {
      console.error(`Failed ESPN season ${failure.season}: ${failure.reason}`)
    }
    throw new Error(`Failed ESPN seasons: ${result.failedSeasons.join(', ')}`)
  }
} finally {
  await browser.close()
}

import puppeteer from 'puppeteer'
import { resolveHistoricalEspnMatchId } from '../services/espn_match_backfill_resolver'
import { runGoalSummaryBackfill } from '../services/goal_summary_backfill'
import { goalSummaryBackfillStore } from '../services/goal_summary_backfill_store'
import { retrieveEspnGoalSummary } from '../services/goal_summary_scraper'

console.info('Launching browser for Goal Summary Backfill...')
const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
})

try {
  console.info('Finding unavailable completed Matches...')
  const result = await runGoalSummaryBackfill({
    store: goalSummaryBackfillStore,
    resolveEspnMatchId: (match) => resolveHistoricalEspnMatchId(browser, match),
    retrieveGoalSummary: (espnMatchId) => retrieveEspnGoalSummary(browser, espnMatchId),
    onProgress: ({ current, total, matchId, stage }) => {
      console.info(`[${current}/${total}] Match ${matchId}: ${stage}`)
    },
  })
  console.info(`Goal Summary Backfill attempted ${result.attempted} Matches: ${result.verified} verified, ${result.unavailable} unavailable, ${result.resolved} ESPN Match IDs resolved.`)
  if (result.unavailableMatchIds.length) {
    console.warn(`Goal Summary Backfill can retry unavailable Match IDs: ${result.unavailableMatchIds.join(', ')}`)
  }
} finally {
  await browser.close()
}

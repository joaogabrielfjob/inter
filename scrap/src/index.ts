import puppeteer from 'puppeteer'
import { matchHandler } from './handler/match_handler'

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu'
  ]
})

Promise.all([
  matchHandler.scrapeFinishedMatches(browser),
  matchHandler.scrapeUpcomingMatches(browser)
])
  .then(() => console.info('Success'))
  .catch((err) => console.error('Error:', err))
  .finally(() => browser.close())
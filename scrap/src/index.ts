import puppeteer from 'puppeteer'
import { matchHandler } from './handler/match_handler'

const browser = await puppeteer.launch({ headless: true })

Promise.all([
  matchHandler.scrapeFinishedMatches(browser),
  matchHandler.scrapeUpcomingMatches(browser)
])
  .then(() => console.info('Success'))
  .catch((err) => console.error('Error:', err))
  .finally(() => browser.close())
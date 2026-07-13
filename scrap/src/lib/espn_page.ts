import type { Browser, Page } from 'puppeteer'

export const ESPN_TIME_ZONE = 'America/Sao_Paulo'

export async function newEspnPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage()
  await page.emulateTimezone(ESPN_TIME_ZONE)
  return page
}

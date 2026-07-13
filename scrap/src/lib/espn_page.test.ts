import { describe, expect, it } from 'bun:test'
import type { Page } from 'puppeteer'
import { ESPN_TIME_ZONE, newEspnPage } from './espn_page'

describe('newEspnPage', () => {
  it('pins ESPN rendering to São Paulo time independently of the host timezone', async () => {
    const calls: string[] = []
    const page = {
      emulateTimezone: async (timeZone: string) => { calls.push(timeZone) },
    } as Page
    const browser = {
      newPage: async () => page,
    }

    await expect(newEspnPage(browser as never)).resolves.toBe(page)
    expect(calls).toEqual([ESPN_TIME_ZONE])
  })
})

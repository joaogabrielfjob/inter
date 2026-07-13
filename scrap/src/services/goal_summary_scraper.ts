import type { Browser } from 'puppeteer'
import { normalizeEspnGoals, type Goal, type GoalTeam } from './goal_summary_ingestion'

const matchUrl = (espnMatchId: number) => `https://www.espn.com.br/futebol/partida/_/jogoId/${espnMatchId}`
const gamecastSelector = '.next-gen-gamecast'
const goalIconSelector = 'svg[data-icon="soccer-goal02"]'

export type EspnGoalEvent = { isGoal: boolean, text: string }
export type EspnGoalColumn = { scoreTeam: GoalTeam, events: readonly EspnGoalEvent[] }

export function parseEspnGoalColumns(columns: readonly EspnGoalColumn[]): Goal[] {
  return columns.flatMap((column) => goalTexts(column).flatMap((text) => {
    const goals = normalizeEspnGoals({ text, scoreTeam: column.scoreTeam })
    if (goals.length === 0) throw new Error(`Could not parse ESPN Goal text: ${text}`)
    return goals
  }))
}

function goalTexts(column: EspnGoalColumn) {
  return column.events.filter((event) => event.isGoal).map((event) => event.text)
}

export async function retrieveEspnGoalSummary(browser: Browser, espnMatchId: number): Promise<Goal[]> {
  const page = await browser.newPage()
  try {
    await page.goto(matchUrl(espnMatchId), { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await page.waitForSelector(gamecastSelector, { timeout: 10_000 })
    const result = await page.evaluate((goalIconSelector) => {
      // A scorer event places its text and goal icon side by side. ESPN also uses this
      // icon in its timeline and score displays, whose immediate parent has no scorer text.
      const scorerColumns = Array.from(document.querySelectorAll(goalIconSelector)).flatMap((icon) => {
        const event = icon.parentElement
        if (!event) return []
        const events = Array.from(event.querySelectorAll(':scope > div > div'))
          .map((element): EspnGoalEvent => ({
            isGoal: true,
            text: element.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          }))
          .filter((event) => Boolean(event.text))
        if (events.length === 0) return []

        const scoreTeam: GoalTeam = event.getBoundingClientRect().left < window.innerWidth / 2 ? 'HOME' : 'AWAY'
        return [{ scoreTeam, events }]
      })

      return scorerColumns
    }, goalIconSelector)

    return parseEspnGoalColumns(result)
  } finally {
    await page.close()
  }
}

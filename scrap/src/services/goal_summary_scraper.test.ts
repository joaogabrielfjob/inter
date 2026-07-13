import { describe, expect, it } from 'bun:test'
import { parseEspnGoalColumns } from './goal_summary_scraper'
import { ingestGoalSummary, verifyGoalSummary, type GoalSummaryStore } from './goal_summary_ingestion'

describe('parseEspnGoalColumns', () => {
  it('parses the current ESPN scoring-column text format', () => {
    expect(parseEspnGoalColumns([
      { scoreTeam: 'HOME', events: [{ isGoal: true, text: "Fernando - 18'" }, { isGoal: true, text: "Tiago Volpi - 45'+7' Pen" }] },
      { scoreTeam: 'AWAY', events: [{ isGoal: true, text: "Brian Aguirre - 79'" }] },
    ])).toEqual([
      { scorer: 'Fernando', minute: '18', team: 'HOME' },
      { scorer: 'Tiago Volpi', minute: '45+7', team: 'HOME', marker: 'P' },
      { scorer: 'Brian Aguirre', minute: '79', team: 'AWAY' },
    ])
  })

  it('rejects malformed ESPN Goal text instead of silently dropping it', () => {
    expect(() => parseEspnGoalColumns([{ scoreTeam: 'HOME', events: [{ isGoal: true, text: 'not a Goal' }] }]))
      .toThrow('Could not parse ESPN Goal text')
  })

  it.each([
    {
      name: 'Match 524 grouped scorer entry',
      score: { homeScore: 4, awayScore: 1 },
      columns: [
        { scoreTeam: 'HOME', events: [{ isGoal: true, text: "Vitor Roque - 4', 24', 43'" }, { isGoal: true, text: "Gustavo Gómez - 58'" }] },
        { scoreTeam: 'AWAY', events: [{ isGoal: true, text: "Bruno Henrique - 72'" }] },
      ],
      goals: [
        { scorer: 'Vitor Roque', minute: '4', team: 'HOME' },
        { scorer: 'Vitor Roque', minute: '24', team: 'HOME' },
        { scorer: 'Vitor Roque', minute: '43', team: 'HOME' },
        { scorer: 'Gustavo Gómez', minute: '58', team: 'HOME' },
        { scorer: 'Bruno Henrique', minute: '72', team: 'AWAY' },
      ],
    },
    {
      name: 'Match 9 card beside away Goal',
      score: { homeScore: 4, awayScore: 1 },
      columns: [
        { scoreTeam: 'HOME', events: [{ isGoal: true, text: "Johan Carbonero - 21', 71'" }, { isGoal: true, text: "Rafael Borré - 55'" }, { isGoal: true, text: "Alan Patrick - 80'" }] },
        { scoreTeam: 'AWAY', events: [{ isGoal: true, text: "Pablo Vegetti - 31'" }, { isGoal: false, text: "Carlos Cuesta - 90'+2'" }] },
      ],
      goals: [
        { scorer: 'Johan Carbonero', minute: '21', team: 'HOME' },
        { scorer: 'Johan Carbonero', minute: '71', team: 'HOME' },
        { scorer: 'Rafael Borré', minute: '55', team: 'HOME' },
        { scorer: 'Alan Patrick', minute: '80', team: 'HOME' },
        { scorer: 'Pablo Vegetti', minute: '31', team: 'AWAY' },
      ],
    },
    {
      name: 'Match 440 card beside home Goal',
      score: { homeScore: 3, awayScore: 1 },
      columns: [
        { scoreTeam: 'HOME', events: [{ isGoal: true, text: "Martin Braithwaite - 15'" }, { isGoal: true, text: "Cristian Oliveira - 42'" }, { isGoal: true, text: "Aravena - 70'" }, { isGoal: false, text: "Wálter Kannemann - 52'" }, { isGoal: false, text: "João Pedro - 65' substitution" }] },
        { scoreTeam: 'AWAY', events: [{ isGoal: true, text: "Alan Patrick - 61'" }] },
      ],
      goals: [
        { scorer: 'Martin Braithwaite', minute: '15', team: 'HOME' },
        { scorer: 'Cristian Oliveira', minute: '42', team: 'HOME' },
        { scorer: 'Aravena', minute: '70', team: 'HOME' },
        { scorer: 'Alan Patrick', minute: '61', team: 'AWAY' },
      ],
    },
  ])('parses and ingests $name', async ({ columns, goals, score }) => {
    const parsed = parseEspnGoalColumns(columns)
    expect(parsed).toEqual([...goals])
    const verified = verifyGoalSummary({ id: 1, ...score }, parsed)
    expect(verified).toBeDefined()

    const calls: unknown[] = []
    const store: GoalSummaryStore = {
      replaceVerified: async (matchId, storedGoals) => { calls.push({ matchId, goals: storedGoals }) },
      markUnavailableUnlessVerified: async () => { calls.push('unavailable') },
    }
    await expect(ingestGoalSummary({ id: 1, ...score }, store, async () => parsed)).resolves.toBe('VERIFIED')
    expect(calls).toEqual([{ matchId: 1, goals: verified }])
  })
})

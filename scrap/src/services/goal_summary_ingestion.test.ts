import { describe, expect, it } from 'bun:test'
import { ingestGoalSummary, normalizeEspnGoal, verifyGoalSummary, type GoalSummaryStore } from './goal_summary_ingestion'

const match = { id: 7, homeScore: 2, awayScore: 2 }

describe('verifyGoalSummary', () => {
  it('parses representative ESPN scorer text including penalty and own-goal labels', () => {
    expect(normalizeEspnGoal({ text: 'Alan Patrick 31\' (P)', scoreTeam: 'AWAY' })).toEqual({
      scorer: 'Alan Patrick', minute: '31', team: 'AWAY', marker: 'P'
    })
    expect(normalizeEspnGoal({ text: 'Adriano Martins 45+1\' (OG)', scoreTeam: 'HOME' })).toEqual({
      scorer: 'Adriano Martins', minute: '45+1', team: 'HOME', marker: 'C'
    })
    expect(normalizeEspnGoal({ text: "Tiago Volpi - 45'+7' Pen", scoreTeam: 'AWAY' })).toEqual({
      scorer: 'Tiago Volpi', minute: '45+7', team: 'AWAY', marker: 'P'
    })
  })

  it('keeps ESPN scorer names, stoppage time, markers, and chronological scoring-team order', () => {
    expect(verifyGoalSummary(match, [
      { scorer: 'Luis Suárez', minute: '90+3', team: 'HOME', marker: 'P' },
      { scorer: 'Gabriel Carvalho', minute: '12', team: 'HOME' },
      { scorer: 'Adriano Martins', minute: '45+1', team: 'AWAY', marker: 'C' },
      { scorer: 'Alan Patrick', minute: '31', team: 'AWAY' },
    ])).toEqual([
      { scorer: 'Gabriel Carvalho', minute: '12', team: 'HOME' },
      { scorer: 'Luis Suárez', minute: '90+3', team: 'HOME', marker: 'P' },
      { scorer: 'Alan Patrick', minute: '31', team: 'AWAY' },
      { scorer: 'Adriano Martins', minute: '45+1', team: 'AWAY', marker: 'C' },
    ])
  })

  it('accepts a scoreless match as a verified empty summary', () => {
    expect(verifyGoalSummary({ ...match, homeScore: 0, awayScore: 0 }, [])).toEqual([])
  })

  it('rejects a summary whose scoring-team counts do not match the result', () => {
    expect(verifyGoalSummary(match, [
      { scorer: 'Gabriel Carvalho', minute: '12', team: 'HOME' },
      { scorer: 'Alan Patrick', minute: '31', team: 'AWAY' },
    ])).toBeUndefined()
  })
})

describe('ingestGoalSummary', () => {
  it('replaces a verified summary rather than appending duplicate goals', async () => {
    const calls: unknown[] = []
    const store: GoalSummaryStore = {
      replaceVerified: async (matchId, goals) => { calls.push({ matchId, goals }) },
      markUnavailableUnlessVerified: async () => { calls.push('unavailable') },
    }

    await ingestGoalSummary({ ...match, homeScore: 1, awayScore: 0 }, store, async () => [
      { scorer: 'Rafael Borré', minute: '73', team: 'HOME' },
    ])
    await ingestGoalSummary({ ...match, homeScore: 1, awayScore: 0 }, store, async () => [
      { scorer: 'Rafael Borré', minute: '73', team: 'HOME' },
    ])

    expect(calls).toEqual([
      { matchId: 7, goals: [{ scorer: 'Rafael Borré', minute: '73', team: 'HOME' }] },
      { matchId: 7, goals: [{ scorer: 'Rafael Borré', minute: '73', team: 'HOME' }] },
    ])
  })

  it('keeps a known-good verified summary when retrieval fails', async () => {
    let markedUnavailable = false
    const store: GoalSummaryStore = {
      replaceVerified: async () => { throw new Error('must not replace') },
      markUnavailableUnlessVerified: async () => { markedUnavailable = true },
    }

    await ingestGoalSummary(match, store, async () => { throw new Error('ESPN unavailable') })

    expect(markedUnavailable).toBe(true)
  })
})

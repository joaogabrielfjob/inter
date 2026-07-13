import { describe, expect, it } from 'bun:test'
import { runGoalSummaryBackfill, type GoalSummaryBackfillStore, type RetryableCompletedMatch } from './goal_summary_backfill'

const unresolved = { id: 1, homeScore: 1, awayScore: 0, espnMatchId: undefined }
const identified = { id: 2, homeScore: 0, awayScore: 0, espnMatchId: 401234567 }

describe('runGoalSummaryBackfill', () => {
  it('resolves an explicit ESPN Match ID and ingests its verified Goal Summary', async () => {
    const calls: unknown[] = []
    const store = fakeStore([unresolved], calls)

    await expect(runGoalSummaryBackfill({
      store,
      resolveEspnMatchId: async () => 401234568,
      retrieveGoalSummary: async (espnMatchId) => {
        expect(espnMatchId).toBe(401234568)
        return [{ scorer: 'Rafael Borré', minute: '73', team: 'HOME' }]
      },
    })).resolves.toEqual({ attempted: 1, resolved: 1, verified: 1, unavailable: 0, unavailableMatchIds: [] })

    expect(calls).toEqual([
      { type: 'save-id', matchId: 1, espnMatchId: 401234568 },
      { type: 'verified', matchId: 1, goals: [{ scorer: 'Rafael Borré', minute: '73', team: 'HOME' }] },
    ])
  })

  it('marks an unresolved Match unavailable without changing its result', async () => {
    const calls: unknown[] = []
    const store = fakeStore([unresolved], calls)

    await expect(runGoalSummaryBackfill({
      store,
      resolveEspnMatchId: async () => undefined,
      retrieveGoalSummary: async () => [],
    })).resolves.toEqual({ attempted: 1, resolved: 0, verified: 0, unavailable: 1, unavailableMatchIds: [1] })

    expect(calls).toEqual([{ type: 'unavailable', matchId: 1 }])
  })

  it('retries unavailable Matches with retained IDs and leaves verified Matches out of the run', async () => {
    const calls: unknown[] = []
    const store = fakeStore([identified], calls)
    let resolveCalls = 0

    await expect(runGoalSummaryBackfill({
      store,
      resolveEspnMatchId: async () => { resolveCalls++; return undefined },
      retrieveGoalSummary: async () => [],
    })).resolves.toEqual({ attempted: 1, resolved: 0, verified: 1, unavailable: 0, unavailableMatchIds: [] })

    expect(resolveCalls).toBe(0)
    expect(calls).toEqual([{ type: 'verified', matchId: 2, goals: [] }])
  })

  it('records a Match as unavailable when ESPN result-row resolution fails', async () => {
    const calls: unknown[] = []
    const store = fakeStore([unresolved], calls)

    await expect(runGoalSummaryBackfill({
      store,
      resolveEspnMatchId: async () => { throw new Error('ESPN unavailable') },
      retrieveGoalSummary: async () => [],
    })).resolves.toEqual({ attempted: 1, resolved: 0, verified: 0, unavailable: 1, unavailableMatchIds: [1] })

    expect(calls).toEqual([{ type: 'unavailable', matchId: 1 }])
  })

  it('reports each Match stage while the backfill runs', async () => {
    const stages: string[] = []

    await runGoalSummaryBackfill({
      store: fakeStore([unresolved], []),
      resolveEspnMatchId: async () => 401234568,
      retrieveGoalSummary: async () => [{ scorer: 'Rafael Borré', minute: '73', team: 'HOME' }],
      onProgress: ({ stage }) => { stages.push(stage) },
    })

    expect(stages).toEqual(['RESOLVING_ID', 'RETRIEVING_GOALS', 'VERIFIED'])
  })

  it('reports an unavailable Match after its ESPN ID cannot be resolved', async () => {
    const stages: string[] = []

    await runGoalSummaryBackfill({
      store: fakeStore([unresolved], []),
      resolveEspnMatchId: async () => undefined,
      retrieveGoalSummary: async () => [],
      onProgress: ({ stage }) => { stages.push(stage) },
    })

    expect(stages).toEqual(['RESOLVING_ID', 'UNAVAILABLE'])
  })
})

function fakeStore(matches: RetryableCompletedMatch[], calls: unknown[]): GoalSummaryBackfillStore {
  return {
    findRetryableCompletedMatches: async () => matches,
    saveEspnMatchId: async (matchId, espnMatchId) => { calls.push({ type: 'save-id', matchId, espnMatchId }) },
    replaceVerified: async (matchId, goals) => { calls.push({ type: 'verified', matchId, goals }) },
    markUnavailableUnlessVerified: async (matchId) => { calls.push({ type: 'unavailable', matchId }) },
  }
}

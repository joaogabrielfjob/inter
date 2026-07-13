import { ingestGoalSummary, type CompletedMatch, type Goal, type GoalSummaryStore } from './goal_summary_ingestion'

export type RetryableCompletedMatch = CompletedMatch & {
  espnMatchId?: number
}

export type HistoricalRetryableCompletedMatch = RetryableCompletedMatch & {
  date: Date
  homeTeamName: string
  awayTeamName: string
}

export type GoalSummaryBackfillStore<Match extends RetryableCompletedMatch = RetryableCompletedMatch> = GoalSummaryStore & {
  findRetryableCompletedMatches: () => Promise<Match[]>
  saveEspnMatchId: (matchId: number, espnMatchId: number) => Promise<void>
}

export type GoalSummaryBackfill<Match extends RetryableCompletedMatch = RetryableCompletedMatch> = {
  store: GoalSummaryBackfillStore<Match>
  resolveEspnMatchId: (match: Match) => Promise<number | undefined>
  retrieveGoalSummary: (espnMatchId: number) => Promise<Goal[]>
  onProgress?: (progress: GoalSummaryBackfillProgress) => void
}

export type GoalSummaryBackfillProgress = {
  current: number
  total: number
  matchId: number
  stage: 'RESOLVING_ID' | 'RETRIEVING_GOALS' | 'VERIFIED' | 'UNAVAILABLE'
}

export async function runGoalSummaryBackfill<Match extends RetryableCompletedMatch>(backfill: GoalSummaryBackfill<Match>) {
  const matches = await backfill.store.findRetryableCompletedMatches()
  let resolved = 0
  let verified = 0
  let unavailable = 0
  const unavailableMatchIds: number[] = []
  const recordUnavailable = async (matchId: number) => {
    await backfill.store.markUnavailableUnlessVerified(matchId)
    unavailable++
    unavailableMatchIds.push(matchId)
  }

  const report = (match: Match, current: number, stage: GoalSummaryBackfillProgress['stage']) => {
    backfill.onProgress?.({ current, total: matches.length, matchId: match.id, stage })
  }

  for (const [index, match] of matches.entries()) {
    const current = index + 1
    let espnMatchId = match.espnMatchId
    if (!espnMatchId) {
      report(match, current, 'RESOLVING_ID')
      try {
        espnMatchId = await backfill.resolveEspnMatchId(match)
      } catch {
        await recordUnavailable(match.id)
        report(match, current, 'UNAVAILABLE')
        continue
      }
    }

    if (!espnMatchId) {
      await recordUnavailable(match.id)
      report(match, current, 'UNAVAILABLE')
      continue
    }

    if (!match.espnMatchId) {
      try {
        await backfill.store.saveEspnMatchId(match.id, espnMatchId)
      } catch {
        await recordUnavailable(match.id)
        report(match, current, 'UNAVAILABLE')
        continue
      }
      resolved++
    }

    report(match, current, 'RETRIEVING_GOALS')
    const status = await ingestGoalSummary(
      match,
      backfill.store,
      () => backfill.retrieveGoalSummary(espnMatchId),
    )
    if (status === 'VERIFIED') {
      verified++
      report(match, current, 'VERIFIED')
    }
    else {
      unavailable++
      unavailableMatchIds.push(match.id)
      report(match, current, 'UNAVAILABLE')
    }
  }

  return { attempted: matches.length, resolved, verified, unavailable, unavailableMatchIds }
}

import { MatchStatus } from '../enums/match_status'
import { prisma } from '../lib/prisma'
import type { GoalSummaryBackfillStore, HistoricalRetryableCompletedMatch } from './goal_summary_backfill'
import { goalSummaryStore } from './goal_summary_store'

export const goalSummaryBackfillStore: GoalSummaryBackfillStore<HistoricalRetryableCompletedMatch> = {
  ...goalSummaryStore,
  findRetryableCompletedMatches: async () => prisma.match.findMany({
    where: {
      status: MatchStatus.FINISHED,
      goalSummaryStatus: { not: 'VERIFIED' },
    },
    select: {
      id: true,
      homeScore: true,
      awayScore: true,
      espnMatchId: true,
      date: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  }).then((matches) => matches.map((match) => ({
    id: match.id,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    espnMatchId: match.espnMatchId ?? undefined,
    date: match.date,
    homeTeamName: match.homeTeam.name,
    awayTeamName: match.awayTeam.name,
  }))),
  saveEspnMatchId: async (matchId, espnMatchId) => {
    await prisma.match.update({ where: { id: matchId }, data: { espnMatchId } })
  },
}

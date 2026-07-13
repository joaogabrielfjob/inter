import { prisma } from '../lib/prisma'
import type { GoalSummaryStore } from './goal_summary_ingestion'

export const goalSummaryStore: GoalSummaryStore = {
  replaceVerified: async (matchId, goals) => {
    await prisma.match.update({
      where: { id: matchId },
      data: {
        goalSummaryStatus: 'VERIFIED',
        goals: {
          deleteMany: {},
          create: goals.map((goal) => ({
            scorer: goal.scorer,
            minute: goal.minute,
            teamSide: goal.team,
            marker: goal.marker,
          })),
        },
      },
    })
  },
  markUnavailableUnlessVerified: async (matchId) => {
    await prisma.match.updateMany({
      where: { id: matchId, goalSummaryStatus: { not: 'VERIFIED' } },
      data: { goalSummaryStatus: 'UNAVAILABLE' },
    })
  },
}

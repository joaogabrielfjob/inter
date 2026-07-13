export type GoalTeam = 'HOME' | 'AWAY'

export type Goal = {
  scorer: string
  minute: string
  team: GoalTeam
  marker?: 'P' | 'C'
}

export type CompletedMatch = {
  id: number
  homeScore: number
  awayScore: number
}

export type GoalSummaryStore = {
  replaceVerified: (matchId: number, goals: Goal[]) => Promise<void>
  markUnavailableUnlessVerified: (matchId: number) => Promise<void>
}

export type EspnGoalText = {
  text: string
  scoreTeam: GoalTeam
}

export function normalizeEspnGoal({ text, scoreTeam }: EspnGoalText): Goal | undefined {
  return normalizeEspnGoals({ text, scoreTeam })[0]
}

export function normalizeEspnGoals({ text, scoreTeam }: EspnGoalText): Goal[] {
  const firstMinute = /\d+(?:['′]?\+\d+)?['′]?/.exec(text)
  if (!firstMinute || firstMinute.index === 0) return []

  const scorer = text.slice(0, firstMinute.index).replace(/\s*-?\s*$/, '').trim()
  if (!scorer) return []

  // ESPN's performer columns are grouped by the Team whose score increased.
  // This deliberately keeps Own Goals with the beneficiary, not the scorer's Team.
  return Array.from(text.slice(firstMinute.index).matchAll(/(\d+)(?:['′]?\+(\d+))?['′]?\s*(\([^)]*\)|\b(?:p|pen|penalty|pênalti|og|own goal|gol contra)\b)?/gi))
    .map(([, regularMinute, addedMinute, label]) => {
      if (!regularMinute) return undefined
      const marker = goalMarker(label)
      const minute = `${regularMinute}${addedMinute ? `+${addedMinute}` : ''}`
      return { scorer, minute, team: scoreTeam, ...(marker ? { marker } : {}) }
    })
    .filter((goal): goal is Goal => Boolean(goal))
}

function goalMarker(label?: string): Goal['marker'] {
  const normalizedLabel = label?.toLowerCase() ?? ''
  if (/\b(?:p|pen|penalty|pênalti)\b/.test(normalizedLabel)) return 'P'
  if (/\b(?:og|own goal|gol contra)\b/.test(normalizedLabel)) return 'C'
  return undefined
}

export async function ingestGoalSummary(
  match: CompletedMatch,
  store: GoalSummaryStore,
  retrieve: () => Promise<Goal[]>,
) {
  try {
    const goals = verifyGoalSummary(match, await retrieve())
    if (!goals) {
      await store.markUnavailableUnlessVerified(match.id)
      return 'UNAVAILABLE' as const
    }

    await store.replaceVerified(match.id, goals)
    return 'VERIFIED' as const
  } catch {
    await store.markUnavailableUnlessVerified(match.id)
    return 'UNAVAILABLE' as const
  }
}

export function verifyGoalSummary(match: CompletedMatch, goals: Goal[]): Goal[] | undefined {
  const homeGoals = goals.filter((goal) => goal.team === 'HOME')
  const awayGoals = goals.filter((goal) => goal.team === 'AWAY')
  if (homeGoals.length !== match.homeScore || awayGoals.length !== match.awayScore) return undefined

  return [
    ...chronological(homeGoals),
    ...chronological(awayGoals),
  ]
}

function chronological(goals: Goal[]) {
  return goals
    .map((goal, index) => ({ goal, index }))
    .sort((left, right) => minuteValue(left.goal.minute) - minuteValue(right.goal.minute) || left.index - right.index)
    .map(({ goal }) => goal)
}

function minuteValue(minute: string) {
  const match = minute.match(/^(\d+)(?:\+(\d+))?/) 
  if (!match?.[1]) return Number.MAX_SAFE_INTEGER
  return Number.parseInt(match[1], 10) * 1000 + Number.parseInt(match[2] ?? '0', 10)
}

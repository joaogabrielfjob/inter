import { prisma } from '../lib/prisma'
import { teamService } from '../services/team_service'

type UnresolvedLegacyRecord = { matchId: number; side: 'home' | 'away'; reason: string }
const unresolved: UnresolvedLegacyRecord[] = []

type LegacyMatch = { id: number; home: string; away: string; home_emblem: string; away_emblem: string }
const matches = await prisma.$queryRaw<LegacyMatch[]>`
  SELECT id, home, away, home_emblem, away_emblem FROM match
  WHERE home_team_id IS NULL OR away_team_id IS NULL
`
for (const match of matches) {
  const [home, away] = await Promise.all([
    backfillSide(match.id, 'home', match.home, match.home_emblem),
    backfillSide(match.id, 'away', match.away, match.away_emblem),
  ])

  if (home && away) await prisma.$executeRaw`
    UPDATE match SET home_team_id = ${home.id}, away_team_id = ${away.id} WHERE id = ${match.id}
  `
}

if (unresolved.length) console.warn('Legacy Team Emblem backfill needs review:', JSON.stringify(unresolved))
console.info(`Backfilled ${matches.length} Matches; ${unresolved.length} legacy side(s) need review.`)

async function backfillSide(matchId: number, side: 'home' | 'away', name: string, emblemUrl: string) {
  if (!name.trim()) {
    unresolved.push({ matchId, side, reason: 'missing team name' })
    return undefined
  }
  const result = await teamService.resolve({ name, emblemUrl: emblemUrl || undefined })
  if (!emblemUrl) unresolved.push({ matchId, side, reason: 'missing legacy emblem URL' })
  if (result.emblemRetained === false) unresolved.push({ matchId, side, reason: 'legacy emblem download failed' })
  return result.team
}

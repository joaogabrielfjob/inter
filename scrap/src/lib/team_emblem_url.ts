const TEAM_EMBLEM_SIZE = '100'

export function teamEmblemUrl(sourceUrl?: string): string | undefined {
  if (!sourceUrl) return undefined

  const url = new URL(sourceUrl)
  url.searchParams.set('w', TEAM_EMBLEM_SIZE)
  url.searchParams.set('h', TEAM_EMBLEM_SIZE)
  return url.toString()
}

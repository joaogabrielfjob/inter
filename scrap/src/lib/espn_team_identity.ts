export function espnTeamIdFromLink(href?: string): number | undefined {
  const match = href?.match(/\/futebol\/time\/_\/id\/(\d+)(?:\/|$)/)
  const id = match?.[1] ? Number(match[1]) : NaN
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}

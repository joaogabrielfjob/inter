export function espnMatchIdFromLink(link?: string): number | undefined {
  if (!link) return undefined

  const match = link.match(/\/jogoId\/(\d+)/)
  if (!match?.[1]) return undefined

  const id = Number.parseInt(match[1], 10)
  return Number.isSafeInteger(id) ? id : undefined
}

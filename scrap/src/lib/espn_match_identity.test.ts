import { describe, expect, it } from 'bun:test'
import { espnMatchIdFromLink } from './espn_match_identity'

describe('espnMatchIdFromLink', () => {
  it('extracts ESPN match IDs from finished-result links', () => {
    expect(espnMatchIdFromLink('https://www.espn.com.br/futebol/partida/_/jogoId/777123/internacional-gremio')).toBe(777123)
  })

  it('rejects links that do not identify an ESPN match', () => {
    expect(espnMatchIdFromLink('https://www.espn.com.br/futebol/time/_/id/1936')).toBeUndefined()
  })
})

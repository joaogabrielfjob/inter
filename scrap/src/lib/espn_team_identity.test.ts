import { describe, expect, it } from 'bun:test'
import { espnTeamIdFromLink } from './espn_team_identity'

describe('espnTeamIdFromLink', () => {
  it('recognizes an ESPN Team ID only from an explicit team link', () => {
    expect(espnTeamIdFromLink('/futebol/time/_/id/1936/bra.internacional')).toBe(1936)
  })

  it('does not infer identity from malformed or missing links', () => {
    expect(espnTeamIdFromLink('/futebol/noticias/_/id/1936')).toBeUndefined()
    expect(espnTeamIdFromLink('/futebol/time/_/id/not-a-number')).toBeUndefined()
    expect(espnTeamIdFromLink()).toBeUndefined()
  })
})

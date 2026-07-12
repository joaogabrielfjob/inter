import { describe, expect, it } from 'bun:test'
import { teamEmblemUrl } from './team_emblem_url'

describe('teamEmblemUrl', () => {
  it('requests a 100px Team Emblem without discarding the ESPN source URL parameters', () => {
    expect(teamEmblemUrl('https://a.espncdn.com/combiner/i?img=%2Fi%2Fteamlogos%2Fsoccer%2F500%2F1936.png&w=40&h=40&scale=crop&cquality=80&location=origin')).toBe(
      'https://a.espncdn.com/combiner/i?img=%2Fi%2Fteamlogos%2Fsoccer%2F500%2F1936.png&w=100&h=100&scale=crop&cquality=80&location=origin',
    )
  })
})

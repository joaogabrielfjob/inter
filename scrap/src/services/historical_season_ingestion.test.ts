import { describe, expect, it } from 'bun:test'
import { runHistoricalSeasonIngestion } from './historical_season_ingestion'

describe('runHistoricalSeasonIngestion', () => {
  it('ingests every discovered historical season and excludes the active season', async () => {
    const ingestedSeasons: number[] = []

    const result = await runHistoricalSeasonIngestion({
      discoverSeasons: async () => ({ activeSeason: 2026, seasons: [2026, 2025, 2024] }),
      ingestSeason: async (season) => { ingestedSeasons.push(season) }
    })

    expect(ingestedSeasons.sort()).toEqual([2024, 2025])
    expect(result).toEqual({ importedSeasons: [2025, 2024], failedSeasons: [], failures: [] })
  })

  it('limits historical season ingestion to three concurrent seasons', async () => {
    let running = 0
    let maximumRunning = 0
    let release: () => void = () => undefined
    const gate = new Promise<void>((resolve) => { release = resolve })

    const run = runHistoricalSeasonIngestion({
      discoverSeasons: async () => ({ activeSeason: 2026, seasons: [2026, 2025, 2024, 2023, 2022] }),
      ingestSeason: async () => {
        running += 1
        maximumRunning = Math.max(maximumRunning, running)
        await gate
        running -= 1
      }
    })

    await Promise.resolve()
    expect(maximumRunning).toBe(3)

    release()
    await run
  })

  it('continues after a failed season and reports it', async () => {
    const ingestedSeasons: number[] = []

    const result = await runHistoricalSeasonIngestion({
      discoverSeasons: async () => ({ activeSeason: 2026, seasons: [2026, 2025, 2024, 2023] }),
      ingestSeason: async (season) => {
        if (season === 2024) throw new Error('ESPN unavailable')
        ingestedSeasons.push(season)
      }
    })

    expect(ingestedSeasons.sort()).toEqual([2023, 2025])
    expect(result).toEqual({
      importedSeasons: [2025, 2023],
      failedSeasons: [2024],
      failures: [{ season: 2024, reason: 'ESPN unavailable' }]
    })
  })

  it('ingests a duplicated ESPN season only once', async () => {
    const ingestedSeasons: number[] = []

    await runHistoricalSeasonIngestion({
      discoverSeasons: async () => ({ activeSeason: 2026, seasons: [2026, 2025, 2025, 2024] }),
      ingestSeason: async (season) => { ingestedSeasons.push(season) }
    })

    expect(ingestedSeasons.sort()).toEqual([2024, 2025])
  })

  it('stops before ingestion when the active season is not among ESPN season options', async () => {
    const ingestSeason = async () => { throw new Error('must not ingest') }

    await expect(runHistoricalSeasonIngestion({
      discoverSeasons: async () => ({ activeSeason: 2026, seasons: [2025, 2024] }),
      ingestSeason
    })).rejects.toThrow('Active ESPN season is not available in the discovered season options')
  })
})

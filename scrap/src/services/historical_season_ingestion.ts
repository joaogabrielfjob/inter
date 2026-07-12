export type HistoricalSeasonIngestion = {
  discoverSeasons: () => Promise<{ activeSeason: number, seasons: number[] }>
  ingestSeason: (season: number) => Promise<void>
}

export async function runHistoricalSeasonIngestion(ingestion: HistoricalSeasonIngestion) {
  const { activeSeason, seasons: discoveredSeasons } = await ingestion.discoverSeasons()
  const seasons = [...new Set(discoveredSeasons)]
  if (!seasons.includes(activeSeason)) {
    throw new Error('Active ESPN season is not available in the discovered season options')
  }

  const historicalSeasons = seasons.filter((season) => season !== activeSeason)
  const imported = new Array<boolean>(historicalSeasons.length).fill(false)
  const failed = new Array<boolean>(historicalSeasons.length).fill(false)
  const failureReasons = new Array<string | undefined>(historicalSeasons.length)
  let nextSeason = 0

  await Promise.all(Array.from({ length: Math.min(3, historicalSeasons.length) }, async () => {
    while (nextSeason < historicalSeasons.length) {
      const index = nextSeason++
      const season = historicalSeasons[index]!
      try {
        await ingestion.ingestSeason(season)
        imported[index] = true
      } catch (error) {
        failed[index] = true
        failureReasons[index] = error instanceof Error ? error.message : String(error)
      }
    }
  }))

  return {
    importedSeasons: historicalSeasons.filter((_, index) => imported[index]),
    failedSeasons: historicalSeasons.filter((_, index) => failed[index]),
    failures: historicalSeasons.flatMap((season, index) =>
      failureReasons[index] ? [{ season, reason: failureReasons[index] }] : []
    )
  }
}

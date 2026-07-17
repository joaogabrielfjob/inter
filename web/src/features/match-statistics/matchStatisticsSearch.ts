export type MatchStatisticsSearch = {
  year?: string;
  month?: string;
  league?: string;
  team?: string;
};

export function parseMatchStatisticsSearch(searchParams: URLSearchParams): MatchStatisticsSearch | null {
  const parameterNames = new Set(['ano', 'mes', 'campeonato', 'time']);
  for (const [key, value] of searchParams) {
    if (!parameterNames.has(key) || searchParams.getAll(key).length !== 1) return null;
    if (key === 'ano' && !/^\d{4}$/.test(value)) return null;
    if (key === 'mes' && !/^([1-9]|1[0-2])$/.test(value)) return null;
  }

  return {
    year: searchParams.get('ano') ?? undefined,
    month: searchParams.get('mes') ?? undefined,
    league: searchParams.get('campeonato') ?? undefined,
    team: searchParams.get('time') ?? undefined,
  };
}

export function toMatchStatisticsSearchParams(search: MatchStatisticsSearch): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (search.year) searchParams.set('ano', search.year);
  if (search.month) searchParams.set('mes', search.month);
  if (search.league) searchParams.set('campeonato', search.league);
  if (search.team) searchParams.set('time', search.team);
  return searchParams;
}

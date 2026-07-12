export type MatchResultsSearch = {
  year?: string;
  month?: string;
  league?: string;
  team?: string;
};

const searchParameterNames = new Set(['ano', 'mes', 'campeonato', 'time']);

export function toMatchResultsSearchParams(search: MatchResultsSearch): URLSearchParams {

  const searchParams = new URLSearchParams();
  if (search.year) searchParams.set('ano', search.year);
  if (search.month) searchParams.set('mes', search.month);
  if (search.league) searchParams.set('campeonato', search.league);
  if (search.team) searchParams.set('time', search.team);
  return searchParams;
}

export function parseMatchResultsSearch(searchParams: URLSearchParams): MatchResultsSearch | null {
  return readSearch(searchParams);
}

export function isMatchResultsSearch(search: MatchResultsSearch | null): search is MatchResultsSearch {
  return search !== null;
}

function readSearch(searchParams: URLSearchParams): MatchResultsSearch | null {
  for (const [key, value] of searchParams) {
    if (!searchParameterNames.has(key) || searchParams.getAll(key).length !== 1) return null;
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

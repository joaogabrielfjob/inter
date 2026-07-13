import { client } from '@/services/client';
import type { FetchFiltersResponse, FetchMatchesResponse } from '@/services/types';
import type { MatchResultsSearch } from './matchResultsSearch';
import { MatchStatus } from '@/enums/match_status';

export async function fetchMatchResults(search: MatchResultsSearch, cursor?: string) {
  const { data } = await client.get<FetchMatchesResponse>('/matches', {
    params: { status: MatchStatus.FINISHED, order: 'DESC', ...search, cursor },
  });
  return data;
}

export async function fetchMatchResultsFilters() {
  const { data } = await client.get<FetchFiltersResponse>('/matches/filters');
  return data.filters;
}

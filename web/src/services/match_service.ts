import { client } from './client';
import { FetchFiltersResponse, FetchMatchesParams, FetchMatchesResponse } from './types';

const fetchMatches = async (params: FetchMatchesParams) => {
  try {
    const { data } = await client.get<FetchMatchesResponse>('/matches', { params });

    return data.matches;
  } catch(exception) {
    console.error('Failed to fetch matches', exception);

    return [];
  }
}

const fetchFilters = async () => {
  try {
    const { data } = await client.get<FetchFiltersResponse>('/matches/filters');

    return data.filters;
  } catch(exception) {
    console.error('Failed to fetch filters', exception);

    return {
      teams: [],
      leagues: []
    }
  }
}

export { fetchMatches, fetchFilters }
import { client } from './client';
import { FetchMatchesParams, FetchMatchesResponse } from './types';

const fetchMatches = async (params: FetchMatchesParams) => {
  try {
    const { data } = await client.get<FetchMatchesResponse>('/matches', { params });

    return data.matches;
  } catch(exception) {
    console.error('Failed to fetch matches', exception);

    return [];
  }
}

export { fetchMatches }

import { client } from '@/services/client';
import type { FetchPerformanceSummaryResponse } from '@/services/types';
import type { MatchStatisticsSearch } from './matchStatisticsSearch';

export async function fetchPerformanceSummary(search: MatchStatisticsSearch) {
  const { data } = await client.get<FetchPerformanceSummaryResponse>('/matches/statistics', {
    params: search,
  });
  return data.summary;
}

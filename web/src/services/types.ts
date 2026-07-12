import { MatchStatus } from '@/enums/match_status';
import { Combo, Match } from '@/types';

export type FetchMatchesResponse = {
  status: string;
  matches: Match[];
}

export type FetchFiltersResponse = {
  status: string;
  filters: Filters;
}

export type Filters = {
  years: Combo[];
  months: Combo[];
  teams: Combo[];
  leagues: Combo[];
}

export type FetchMatchesParams = {
  status: MatchStatus;
  order: 'ASC' | 'DESC';
  
  year?: string;
  month?: string;
  league?: string;
  team?: string;
}

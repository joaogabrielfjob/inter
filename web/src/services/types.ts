import { MatchStatus } from '@/enums/match_status';
import { Combo, Match } from '@/types';

export type FetchMatchesResponse = {
  status: string;
  matches: Match[];
  nextCursor?: string;
}

export type FetchFiltersResponse = {
  status: string;
  filters: Filters;
}

export type PerformanceSummary = {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  winRate: number;
  cleanSheets: number;
}

export type FetchPerformanceSummaryResponse = {
  status: string;
  summary: PerformanceSummary;
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

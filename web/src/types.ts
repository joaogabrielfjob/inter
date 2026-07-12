export type Combo = {
  value: string;
  label: string;
}

export type Match = {
  id: number;
  home: string;
  homeScore: number;
  homeEmblem: string;
  away: string;
  awayScore: number;
  awayEmblem: string;
  matchDay: string;
  league: string;
  kickoffTime?: string;
}

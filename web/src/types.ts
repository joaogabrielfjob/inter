export type Combo = {
  value: string;
  label: string;
}

export type Match = {
  id: number;
  home: string;
  homeScore: number;
  homeEmblem?: string;
  away: string;
  awayScore: number;
  awayEmblem?: string;
  matchDay: string;
  league: string;
  kickoffTime?: string;
  goalSummary: GoalSummary;
}

export type GoalSummary = {
  status: 'VERIFIED' | 'UNAVAILABLE';
  goals: Goal[];
}

export type Goal = {
  scorer: string;
  minute: string;
  team: 'HOME' | 'AWAY';
  marker?: 'P' | 'C';
}

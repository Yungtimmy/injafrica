export interface IUser {
  _id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string;
  points: number;
  walletAddress?: string;
  walletSubmittedAt?: Date;
  createdAt: Date;
}

export interface IMatch {
  _id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  stage: string;
  matchDate: Date;
  venue: string;
  city: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore: number | null;
  awayScore: number | null;
  qualifier?: 'home' | 'away' | null;
}

export interface IPrediction {
  _id: string;
  userId: string;
  discordId: string;
  matchId: string;
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier?: 'home' | 'away' | null;
  pointsEarned: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaderboardEntry {
  discordId: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
}

export interface ISettings {
  key: string;
  value: unknown;
}

export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type Stage = 'Group Stage' | 'Round of 32' | 'Round of 16' | 'Quarter-finals' | 'Semi-finals' | 'Third Place' | 'Final';

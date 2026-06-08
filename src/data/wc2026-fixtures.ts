export interface FixtureData {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  stage: string;
  matchDate: Date;
  venue: string;
  city: string;
  status: 'scheduled';
  homeScore: null;
  awayScore: null;
}

export const wc2026Fixtures: FixtureData[] = [
  // Group A
  {
    matchId: 'A1', homeTeam: 'United States', awayTeam: 'Serbia', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-11T19:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A2', homeTeam: 'Uruguay', awayTeam: 'Panama', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-11T16:00:00-05:00'), venue: 'SoFi Stadium', city: 'Los Angeles',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A3', homeTeam: 'United States', awayTeam: 'Panama', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T19:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group B
  {
    matchId: 'B1', homeTeam: 'Mexico', awayTeam: 'Jamaica', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T16:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B2', homeTeam: 'Belgium', awayTeam: 'Honduras', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T13:00:00-05:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B3', homeTeam: 'Mexico', awayTeam: 'Honduras', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T16:00:00-06:00'), venue: 'Estadio Guadalajara', city: 'Guadalajara',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group C
  {
    matchId: 'C1', homeTeam: 'Argentina', awayTeam: 'Chile', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T20:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C2', homeTeam: 'Poland', awayTeam: 'Ecuador', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T17:00:00-05:00'), venue: 'Bank of America Stadium', city: 'Charlotte',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C3', homeTeam: 'Argentina', awayTeam: 'Ecuador', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T20:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group D
  {
    matchId: 'D1', homeTeam: 'France', awayTeam: 'Saudi Arabia', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T14:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D2', homeTeam: 'Australia', awayTeam: 'Tunisia', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T11:00:00-04:00'), venue: 'Lincoln Financial Field', city: 'Philadelphia',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D3', homeTeam: 'France', awayTeam: 'Tunisia', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T14:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group E
  {
    matchId: 'E1', homeTeam: 'Spain', awayTeam: 'South Korea', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T21:00:00-05:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E2', homeTeam: 'Germany', awayTeam: 'Senegal', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T18:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E3', homeTeam: 'Spain', awayTeam: 'Senegal', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T21:00:00-05:00'), venue: 'SoFi Stadium', city: 'Los Angeles',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group F
  {
    matchId: 'F1', homeTeam: 'Brazil', awayTeam: 'Mexico', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T20:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F2', homeTeam: 'Japan', awayTeam: 'Costa Rica', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T17:00:00-05:00'), venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F3', homeTeam: 'Brazil', awayTeam: 'Costa Rica', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T20:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group G
  {
    matchId: 'G1', homeTeam: 'England', awayTeam: 'Cameroon', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T14:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G2', homeTeam: 'Netherlands', awayTeam: 'Ivory Coast', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T11:00:00-05:00'), venue: 'Lincoln Financial Field', city: 'Philadelphia',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G3', homeTeam: 'England', awayTeam: 'Ivory Coast', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T14:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group H
  {
    matchId: 'H1', homeTeam: 'Portugal', awayTeam: 'Algeria', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T14:00:00-05:00'), venue: 'SoFi Stadium', city: 'Los Angeles',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H2', homeTeam: 'Croatia', awayTeam: 'Morocco', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T11:00:00-05:00'), venue: 'Bank of America Stadium', city: 'Charlotte',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H3', homeTeam: 'Portugal', awayTeam: 'Morocco', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T14:00:00-05:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group I
  {
    matchId: 'I1', homeTeam: 'Italy', awayTeam: 'Ecuador', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T20:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I2', homeTeam: 'Canada', awayTeam: 'Nigeria', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T17:00:00-04:00'), venue: 'BC Place', city: 'Vancouver',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I3', homeTeam: 'Italy', awayTeam: 'Nigeria', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T20:00:00-04:00'), venue: 'Lincoln Financial Field', city: 'Philadelphia',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group J
  {
    matchId: 'J1', homeTeam: 'Colombia', awayTeam: 'Bolivia', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T14:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J2', homeTeam: 'Switzerland', awayTeam: 'Cameroon', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T11:00:00-05:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J3', homeTeam: 'Colombia', awayTeam: 'Cameroon', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T14:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group K
  {
    matchId: 'K1', homeTeam: 'Denmark', awayTeam: 'Venezuela', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T14:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K2', homeTeam: 'Iran', awayTeam: 'Ghana', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T11:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K3', homeTeam: 'Denmark', awayTeam: 'Ghana', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T14:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // Group L
  {
    matchId: 'L1', homeTeam: 'Turkey', awayTeam: 'Egypt', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T14:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L2', homeTeam: 'Ukraine', awayTeam: 'Qatar', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T11:00:00-06:00'), venue: 'Estadio Guadalajara', city: 'Guadalajara',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L3', homeTeam: 'Turkey', awayTeam: 'Qatar', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-22T14:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
];

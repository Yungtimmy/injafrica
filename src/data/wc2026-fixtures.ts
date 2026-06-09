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
  // ── GROUP A: Mexico, South Africa, South Korea, Czech Republic ──
  {
    matchId: 'A1', homeTeam: 'Mexico', awayTeam: 'South Africa', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-11T15:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A2', homeTeam: 'South Korea', awayTeam: 'Czech Republic', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-11T20:00:00-06:00'), venue: 'Estadio Akron', city: 'Guadalajara',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A3', homeTeam: 'Mexico', awayTeam: 'Czech Republic', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T15:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A4', homeTeam: 'South Africa', awayTeam: 'South Korea', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T20:00:00-06:00'), venue: 'Estadio Akron', city: 'Guadalajara',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A5', homeTeam: 'Mexico', awayTeam: 'South Korea', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T20:00:00-06:00'), venue: 'Estadio BBVA', city: 'Monterrey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'A6', homeTeam: 'South Africa', awayTeam: 'Czech Republic', group: 'A', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T20:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP B: Canada, Bosnia & Herzegovina, Qatar, Switzerland ──
  {
    matchId: 'B1', homeTeam: 'Canada', awayTeam: 'Bosnia & Herzegovina', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T15:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B2', homeTeam: 'Qatar', awayTeam: 'Switzerland', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T15:00:00-07:00'), venue: "Levi's Stadium", city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B3', homeTeam: 'Canada', awayTeam: 'Switzerland', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T15:00:00-04:00'), venue: 'BC Place', city: 'Vancouver',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B4', homeTeam: 'Bosnia & Herzegovina', awayTeam: 'Qatar', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T18:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B5', homeTeam: 'Canada', awayTeam: 'Qatar', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T18:00:00-04:00'), venue: 'BC Place', city: 'Vancouver',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'B6', homeTeam: 'Bosnia & Herzegovina', awayTeam: 'Switzerland', group: 'B', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T18:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP C: Brazil, Morocco, Haiti, Scotland ──
  {
    matchId: 'C1', homeTeam: 'Brazil', awayTeam: 'Morocco', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T18:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C2', homeTeam: 'Haiti', awayTeam: 'Scotland', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T21:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C3', homeTeam: 'Brazil', awayTeam: 'Scotland', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T18:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C4', homeTeam: 'Morocco', awayTeam: 'Haiti', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T15:00:00-05:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C5', homeTeam: 'Brazil', awayTeam: 'Haiti', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T18:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'C6', homeTeam: 'Morocco', awayTeam: 'Scotland', group: 'C', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T18:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP D: United States, Paraguay, Australia, Turkey ──
  {
    matchId: 'D1', homeTeam: 'United States', awayTeam: 'Paraguay', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-12T21:00:00-07:00'), venue: 'SoFi Stadium', city: 'Los Angeles',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D2', homeTeam: 'Australia', awayTeam: 'Turkey', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-13T12:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D3', homeTeam: 'United States', awayTeam: 'Turkey', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T21:00:00-07:00'), venue: 'SoFi Stadium', city: 'Los Angeles',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D4', homeTeam: 'Paraguay', awayTeam: 'Australia', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T15:00:00-07:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D5', homeTeam: 'United States', awayTeam: 'Australia', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T21:00:00-07:00'), venue: 'SoFi Stadium', city: 'Los Angeles',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'D6', homeTeam: 'Paraguay', awayTeam: 'Turkey', group: 'D', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T21:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP E: Germany, Ivory Coast, Ecuador, Curaçao ──
  {
    matchId: 'E1', homeTeam: 'Germany', awayTeam: 'Ivory Coast', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T18:00:00-04:00'), venue: 'Lincoln Financial Field', city: 'Philadelphia',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E2', homeTeam: 'Ecuador', awayTeam: 'Curaçao', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T15:00:00-04:00'), venue: 'Bank of America Stadium', city: 'Charlotte',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E3', homeTeam: 'Germany', awayTeam: 'Curaçao', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T18:00:00-04:00'), venue: 'Lincoln Financial Field', city: 'Philadelphia',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E4', homeTeam: 'Ivory Coast', awayTeam: 'Ecuador', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T15:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E5', homeTeam: 'Germany', awayTeam: 'Ecuador', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-22T18:00:00-04:00'), venue: 'Lincoln Financial Field', city: 'Philadelphia',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'E6', homeTeam: 'Ivory Coast', awayTeam: 'Curaçao', group: 'E', stage: 'Group Stage',
    matchDate: new Date('2026-06-22T18:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP F: Netherlands, Japan, Sweden, Tunisia ──
  {
    matchId: 'F1', homeTeam: 'Netherlands', awayTeam: 'Japan', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T21:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F2', homeTeam: 'Sweden', awayTeam: 'Tunisia', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-14T18:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F3', homeTeam: 'Netherlands', awayTeam: 'Tunisia', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T21:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F4', homeTeam: 'Japan', awayTeam: 'Sweden', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-18T18:00:00-07:00'), venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F5', homeTeam: 'Netherlands', awayTeam: 'Sweden', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-22T21:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'F6', homeTeam: 'Japan', awayTeam: 'Tunisia', group: 'F', stage: 'Group Stage',
    matchDate: new Date('2026-06-22T21:00:00-07:00'), venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP G: Belgium, Egypt, Iran, New Zealand ──
  {
    matchId: 'G1', homeTeam: 'Belgium', awayTeam: 'Egypt', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T18:00:00-07:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G2', homeTeam: 'Iran', awayTeam: 'New Zealand', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T15:00:00-07:00'), venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G3', homeTeam: 'Belgium', awayTeam: 'New Zealand', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T18:00:00-07:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G4', homeTeam: 'Egypt', awayTeam: 'Iran', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T15:00:00-04:00'), venue: 'Bank of America Stadium', city: 'Charlotte',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G5', homeTeam: 'Belgium', awayTeam: 'Iran', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-23T18:00:00-07:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'G6', homeTeam: 'Egypt', awayTeam: 'New Zealand', group: 'G', stage: 'Group Stage',
    matchDate: new Date('2026-06-23T18:00:00-04:00'), venue: 'Bank of America Stadium', city: 'Charlotte',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay ──
  {
    matchId: 'H1', homeTeam: 'Spain', awayTeam: 'Cape Verde', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T13:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H2', homeTeam: 'Saudi Arabia', awayTeam: 'Uruguay', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-15T18:00:00-05:00'), venue: 'Hard Rock Stadium', city: 'Miami',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H3', homeTeam: 'Spain', awayTeam: 'Uruguay', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T13:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H4', homeTeam: 'Cape Verde', awayTeam: 'Saudi Arabia', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-19T18:00:00-05:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H5', homeTeam: 'Spain', awayTeam: 'Saudi Arabia', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-23T21:00:00-05:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'H6', homeTeam: 'Cape Verde', awayTeam: 'Uruguay', group: 'H', stage: 'Group Stage',
    matchDate: new Date('2026-06-23T21:00:00-05:00'), venue: 'Mercedes-Benz Stadium', city: 'Atlanta',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP I: France, Senegal, Iraq, Norway ──
  {
    matchId: 'I1', homeTeam: 'France', awayTeam: 'Senegal', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T15:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I2', homeTeam: 'Iraq', awayTeam: 'Norway', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T18:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I3', homeTeam: 'France', awayTeam: 'Norway', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T15:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I4', homeTeam: 'Senegal', awayTeam: 'Iraq', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T18:00:00-05:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I5', homeTeam: 'France', awayTeam: 'Iraq', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-24T21:00:00-04:00'), venue: 'Gillette Stadium', city: 'Boston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'I6', homeTeam: 'Senegal', awayTeam: 'Norway', group: 'I', stage: 'Group Stage',
    matchDate: new Date('2026-06-24T21:00:00-05:00'), venue: 'MetLife Stadium', city: 'New York/New Jersey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP J: Argentina, Algeria, Austria, Jordan ──
  {
    matchId: 'J1', homeTeam: 'Argentina', awayTeam: 'Algeria', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T21:00:00-06:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J2', homeTeam: 'Austria', awayTeam: 'Jordan', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-16T21:00:00-07:00'), venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J3', homeTeam: 'Argentina', awayTeam: 'Jordan', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T21:00:00-06:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J4', homeTeam: 'Algeria', awayTeam: 'Austria', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-20T18:00:00-07:00'), venue: 'Lumen Field', city: 'Seattle',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J5', homeTeam: 'Argentina', awayTeam: 'Austria', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-24T21:00:00-06:00'), venue: 'Arrowhead Stadium', city: 'Kansas City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'J6', homeTeam: 'Algeria', awayTeam: 'Jordan', group: 'J', stage: 'Group Stage',
    matchDate: new Date('2026-06-24T21:00:00-07:00'), venue: 'Levi\'s Stadium', city: 'San Francisco Bay Area',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP K: Portugal, DR Congo, Uzbekistan, Colombia ──
  {
    matchId: 'K1', homeTeam: 'Portugal', awayTeam: 'DR Congo', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T13:00:00-06:00'), venue: 'NRG Stadium', city: 'Houston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K2', homeTeam: 'Uzbekistan', awayTeam: 'Colombia', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T20:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K3', homeTeam: 'Portugal', awayTeam: 'Colombia', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T13:00:00-06:00'), venue: 'NRG Stadium', city: 'Houston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K4', homeTeam: 'DR Congo', awayTeam: 'Uzbekistan', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T20:00:00-06:00'), venue: 'Estadio BBVA', city: 'Monterrey',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K5', homeTeam: 'Portugal', awayTeam: 'Uzbekistan', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-25T21:00:00-06:00'), venue: 'NRG Stadium', city: 'Houston',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'K6', homeTeam: 'DR Congo', awayTeam: 'Colombia', group: 'K', stage: 'Group Stage',
    matchDate: new Date('2026-06-25T21:00:00-06:00'), venue: 'Estadio Azteca', city: 'Mexico City',
    status: 'scheduled', homeScore: null, awayScore: null,
  },

  // ── GROUP L: England, Croatia, Ghana, Panama ──
  {
    matchId: 'L1', homeTeam: 'England', awayTeam: 'Croatia', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T16:00:00-06:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L2', homeTeam: 'Ghana', awayTeam: 'Panama', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-17T19:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L3', homeTeam: 'England', awayTeam: 'Panama', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T16:00:00-06:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L4', homeTeam: 'Croatia', awayTeam: 'Ghana', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-21T19:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L5', homeTeam: 'England', awayTeam: 'Ghana', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-25T21:00:00-06:00'), venue: 'AT&T Stadium', city: 'Dallas',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
  {
    matchId: 'L6', homeTeam: 'Croatia', awayTeam: 'Panama', group: 'L', stage: 'Group Stage',
    matchDate: new Date('2026-06-25T21:00:00-04:00'), venue: 'BMO Field', city: 'Toronto',
    status: 'scheduled', homeScore: null, awayScore: null,
  },
];

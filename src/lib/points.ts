export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  // Exact score
  if (predictedHome === actualHome && predictedAway === actualAway) return 5;

  // Determine outcomes
  const actualOutcome =
    actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw';
  const predictedOutcome =
    predictedHome > predictedAway ? 'home' : predictedAway > predictedHome ? 'away' : 'draw';

  if (predictedOutcome !== actualOutcome) return 0;

  // Correct draw (not exact score)
  if (actualOutcome === 'draw') return 3;

  // Correct winner
  return 1;
}

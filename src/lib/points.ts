export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  const actualOutcome =
    actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw';
  const predictedOutcome =
    predictedHome > predictedAway ? 'home' : predictedAway > predictedHome ? 'away' : 'draw';

  if (predictedOutcome !== actualOutcome) return 0;

  // Exact score always awards 5, regardless of draw or win
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 5;
  }

  return actualOutcome === 'draw' ? 3 : 1;
}

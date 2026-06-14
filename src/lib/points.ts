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

  const correctResult = predictedOutcome === actualOutcome;
  const correctScore = predictedHome === actualHome && predictedAway === actualAway;

  if (!correctResult) return 0;

  const resultBonus = actualOutcome === 'draw' ? 3 : 1;
  const scoreBonus = correctScore ? 5 : 0;

  return resultBonus + scoreBonus;
}

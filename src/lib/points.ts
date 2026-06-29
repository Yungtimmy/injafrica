export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  predictedQualifier?: string,
  actualQualifier?: string
): number {
  const actualOutcome =
    actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw';
  const predictedOutcome =
    predictedHome > predictedAway ? 'home' : predictedAway > predictedHome ? 'away' : 'draw';

  const correctResult = predictedOutcome === actualOutcome;

  const correctScore = predictedHome === actualHome && predictedAway === actualAway;
  const correctQualifier =
    predictedQualifier !== undefined &&
    actualQualifier !== undefined &&
    predictedQualifier === actualQualifier;

  if (!correctResult && correctQualifier) return 2;
  if (!correctResult) return 0;

  const isDraw = actualOutcome === 'draw';

  if (correctScore && correctQualifier) return isDraw ? 10 : 8;
  if (correctQualifier) return isDraw ? 5 : 3;
  if (correctScore) return isDraw ? 8 : 6;
  return isDraw ? 3 : 1;
}

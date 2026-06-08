import { IMatch, IPrediction } from '@/types';
import PredictionForm from './PredictionForm';
import { format } from 'date-fns';

interface MatchCardProps {
  match: IMatch;
  prediction?: IPrediction | null;
  showPredictionForm?: boolean;
  discordId?: string;
}

export default function MatchCard({
  match,
  prediction,
  showPredictionForm = false,
  discordId: _discordId,
}: MatchCardProps) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  const matchDate = new Date(match.matchDate);
  const isPast = matchDate < new Date();

  const canPredict = showPredictionForm && !isFinished && !isLive && !isPast;

  return (
    <div
      className={`card p-4 transition-all hover:border-primary/30 ${
        isLive ? 'border-red-500/50 pulse-glow' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <span className="uppercase tracking-wider font-semibold">
          {match.stage === 'Group Stage' ? `Group ${match.group}` : match.stage}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-red-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          )}
          {isFinished && <span className="text-gray-500">FT</span>}
          {!isFinished && !isLive && (
            <span>{format(matchDate, 'MMM d, HH:mm')}</span>
          )}
        </div>
      </div>

      {/* Teams and score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 text-right">
          <span className="font-semibold text-sm sm:text-base">{match.homeTeam}</span>
        </div>

        <div className="flex items-center gap-2 min-w-[80px] justify-center">
          {isFinished || isLive ? (
            <div className="flex items-center gap-1.5 bg-dark rounded-lg px-3 py-1">
              <span className="text-lg font-black text-white">{match.homeScore ?? '–'}</span>
              <span className="text-gray-600">:</span>
              <span className="text-lg font-black text-white">{match.awayScore ?? '–'}</span>
            </div>
          ) : (
            <div className="text-gray-600 text-sm font-medium">vs</div>
          )}
        </div>

        <div className="flex-1 text-left">
          <span className="font-semibold text-sm sm:text-base">{match.awayTeam}</span>
        </div>
      </div>

      {/* Venue */}
      <div className="mt-2 text-xs text-gray-600 text-center">
        📍 {match.city}
      </div>

      {/* Prediction display or form */}
      {prediction && (
        <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-between">
          <span className="text-xs text-gray-500">Your prediction:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-300">
              {prediction.predictedHome}–{prediction.predictedAway}
            </span>
            {prediction.pointsEarned !== null && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  prediction.pointsEarned === 5
                    ? 'bg-gold/20 text-gold'
                    : prediction.pointsEarned > 0
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                +{prediction.pointsEarned} pts
              </span>
            )}
          </div>
        </div>
      )}

      {canPredict && (
        <div className="mt-3 pt-3 border-t border-dark-border">
          <div className="text-xs text-gray-500 mb-1.5">Your prediction:</div>
          <PredictionForm
            matchId={match._id}
            existingPrediction={prediction}
          />
        </div>
      )}

      {!canPredict && !prediction && !isFinished && !isLive && isPast && (
        <div className="mt-3 pt-3 border-t border-dark-border text-xs text-gray-600 text-center">
          Prediction window closed
        </div>
      )}
    </div>
  );
}

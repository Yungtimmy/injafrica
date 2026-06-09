import { IMatch, IPrediction } from '@/types';
import PredictionForm from './PredictionForm';
import { format } from 'date-fns';

interface MatchCardProps {
  match: IMatch;
  prediction?: IPrediction | null;
  showPredictionForm?: boolean;
  discordId?: string;
}

export default function MatchCard({ match, prediction, showPredictionForm = false }: MatchCardProps) {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const matchDate = new Date(match.matchDate);
  const isPast = matchDate < new Date();
  const canPredict = showPredictionForm && !isFinished && !isLive && !isPast;

  const pointsColor =
    prediction?.pointsEarned === 5 ? 'text-sb-yellow' :
    prediction?.pointsEarned && prediction.pointsEarned > 0 ? 'text-green-400' :
    prediction?.pointsEarned === 0 ? 'text-red-400' : 'text-sb-muted';

  return (
    <div className={`sb-card mb-px ${isLive ? 'border-l-2 border-l-sb-live' : ''}`}>
      {/* Stage / time strip */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sb-border bg-sb-card-2">
        <span className="text-[10px] font-bold uppercase text-sb-muted tracking-wider">
          {match.stage === 'Group Stage' ? `Group ${match.group}` : match.stage} · {match.city}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sb-live pulse-live" />
              <span className="text-[10px] font-black text-sb-live uppercase">Live</span>
            </span>
          )}
          {isFinished && <span className="text-[10px] text-sb-muted font-semibold uppercase">FT</span>}
          {!isFinished && !isLive && (
            <span className="text-[10px] text-sb-muted">
              {format(matchDate, 'dd MMM · HH:mm')}
            </span>
          )}
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex items-center px-3 py-3 gap-2">
        {/* Home */}
        <div className="flex-1 text-right">
          <span className="font-bold text-sm text-white leading-tight">{match.homeTeam}</span>
        </div>

        {/* Score / VS */}
        <div className="flex items-center gap-1 min-w-[72px] justify-center">
          {isFinished || isLive ? (
            <div className="flex items-center gap-1">
              <span className={`text-xl font-black w-7 text-center ${isLive ? 'text-sb-live' : 'text-white'}`}>
                {match.homeScore ?? 0}
              </span>
              <span className="text-sb-muted font-bold">:</span>
              <span className={`text-xl font-black w-7 text-center ${isLive ? 'text-sb-live' : 'text-white'}`}>
                {match.awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="bg-sb-green/20 border border-sb-green/40 text-sb-green text-xs font-black px-3 py-1 rounded-sm">
              VS
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <span className="font-bold text-sm text-white leading-tight">{match.awayTeam}</span>
        </div>
      </div>

      {/* Prediction row */}
      {(prediction || canPredict || (!canPredict && !prediction && !isFinished && !isLive && isPast)) && (
        <div className="border-t border-sb-border px-3 py-2 bg-sb-card-2/50">
          {prediction && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-sb-muted">
                <span>Your pick:</span>
                <span className="text-white font-bold">
                  {prediction.predictedHome} – {prediction.predictedAway}
                </span>
              </div>
              {prediction.pointsEarned !== null ? (
                <span className={`text-xs font-black ${pointsColor}`}>
                  +{prediction.pointsEarned} PTS
                </span>
              ) : (
                <span className="text-[10px] text-sb-muted uppercase">Pending</span>
              )}
            </div>
          )}

          {canPredict && (
            <PredictionForm matchId={match._id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} existingPrediction={prediction} />
          )}

          {!canPredict && !prediction && isPast && !isFinished && !isLive && (
            <span className="text-[10px] text-sb-muted uppercase">Prediction closed</span>
          )}
        </div>
      )}
    </div>
  );
}

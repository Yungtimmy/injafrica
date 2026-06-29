'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface PredictionWithMatch {
  _id: string;
  predictedHome: number;
  predictedAway: number;
  pointsEarned: number | null;
  matchId: {
    _id: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    status: string;
    homeScore: number | null;
    awayScore: number | null;
    group: string;
    stage: string;
  };
}

interface PlayerData {
  user: {
    discordId: string;
    username: string;
    avatar: string;
    points: number;
  };
  rank: number;
  predictions: PredictionWithMatch[];
}

export default function PlayerProfilePage() {
  const { status } = useSession();
  const params = useParams<{ discordId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/';
  }, [status]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const rawId = params.discordId;
    const discordId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!discordId) {
      setLoading(false);
      setError('Invalid player ID');
      return;
    }

    fetch(`/api/players/${discordId}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (res.ok) {
          setData(await res.json());
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.details ? `${err.error}: ${err.details}` : (err.error || `Request failed with status ${res.status}`));
        }
      })
      .catch((e) => {
        setError('Network error loading player profile');
        console.error(e);
      })
      .finally(() => setLoading(false));
  }, [status, params.discordId]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sb-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-10 text-center">
        <p className="text-sb-muted text-sm mb-4">Player not found.</p>
        <Link href="/leaderboard" className="sb-btn text-xs px-4 inline-block">Back to Leaderboard</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-10 text-center">
        <p className="text-red-400 text-sm mb-2">Error: {error}</p>
        <Link href="/leaderboard" className="sb-btn text-xs px-4 inline-block">Back to Leaderboard</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-10 text-center">
        <p className="text-sb-muted text-sm mb-4">Failed to load player data.</p>
        <Link href="/leaderboard" className="sb-btn text-xs px-4 inline-block">Back to Leaderboard</Link>
      </div>
    );
  }
  const { user, rank, predictions } = data;

  const total = predictions.length;
  const exactScores = predictions.filter((p) => p.pointsEarned === 5).length;
  const correctOutcomes = predictions.filter((p) => p.pointsEarned !== null && p.pointsEarned > 0 && p.pointsEarned < 5).length;
  const wrong = predictions.filter((p) => p.pointsEarned === 0).length;

  return (
    <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">
      <button onClick={() => router.back()} className="text-sb-muted text-xs hover:text-white">&larr; Back</button>

      {/* Profile card */}
      <div className="sb-card p-4 flex items-center gap-4">
        <Image
          src={user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
          alt={user.username}
          width={56}
          height={56}
          className="rounded-full border-2 border-sb-yellow/60 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-lg leading-tight">{user.username}</div>
          <div className="text-sb-muted text-xs">Discord ID · {user.discordId}</div>
          <div className="mt-1 inline-flex items-center gap-1.5 bg-sb-yellow/10 border border-sb-yellow/30 text-sb-yellow text-xs font-bold px-2 py-0.5 rounded-sm">
            #{rank} on Leaderboard
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black text-sb-yellow">{user.points ?? 0}</div>
          <div className="text-[10px] text-sb-muted uppercase">Total Pts</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { val: total, label: 'Scored Predictions', color: 'text-white' },
          { val: exactScores, label: 'Exact Scores', color: 'text-sb-yellow' },
          { val: correctOutcomes, label: 'Correct Wins', color: 'text-green-400' },
          { val: wrong, label: 'Wrong', color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="sb-card p-3 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-[10px] text-sb-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Predictions history */}
      <div className="sb-card overflow-hidden">
        <div className="sb-section-header">Prediction History</div>
        {predictions.length === 0 ? (
          <div className="p-8 text-center text-sb-muted text-sm">No scored predictions yet</div>
        ) : (
          predictions.map((pred) => {
            const match = pred.matchId;
            const pts = pred.pointsEarned;
            const ptColor = pts === 5 ? 'text-sb-yellow' : pts && pts > 0 ? 'text-green-400' : 'text-red-400';

            let dateDisplay = '';
            if (match?.matchDate) {
              const d = new Date(match.matchDate);
              if (!isNaN(d.getTime())) {
                dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            }

            return (
              <div key={pred._id} className="flex flex-wrap items-center px-4 py-3 border-b border-sb-border hover:bg-sb-card-2 gap-x-3 gap-y-1">
                <div className="flex-1 min-w-0 basis-full sm:basis-auto">
                  <div className="text-sm font-semibold text-white truncate">
                    {match?.homeTeam} vs {match?.awayTeam}
                  </div>
                  <div className="text-[10px] text-sb-muted">
                    {match?.stage}{match?.group ? ` · Group ${match.group}` : ''} ·{' '}
                    {dateDisplay}
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-[10px] text-sb-muted">Your Pick</div>
                  <div className="font-bold text-white text-sm">{pred.predictedHome}–{pred.predictedAway}</div>
                </div>
                {match?.status === 'finished' && (
                  <div className="text-center shrink-0">
                    <div className="text-[10px] text-sb-muted">Result</div>
                    <div className="font-bold text-white text-sm">{match.homeScore}–{match.awayScore}</div>
                  </div>
                )}
                <div className="text-right shrink-0 min-w-[48px]">
                  {pts !== null ? (
                    <span className={`font-black text-base ${ptColor}`}>+{pts}</span>
                  ) : (
                    <span className="text-[10px] text-sb-muted uppercase">Pending</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { redirect } from 'next/navigation';

interface PredictionWithMatch {
  _id: string;
  predictedHome: number;
  predictedAway: number;
  pointsEarned: number | null;
  createdAt: string;
  updatedAt: string;
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [predictions, setPredictions] = useState<PredictionWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletSubmitting, setWalletSubmitting] = useState(false);
  const [walletMessage, setWalletMessage] = useState('');
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/';
    }
  }, [status]);

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);

  async function fetchData() {
    setLoading(true);
    try {
      const [predRes, lbRes] = await Promise.all([
        fetch('/api/predictions/profile'),
        fetch('/api/leaderboard'),
      ]);

      if (predRes.ok) {
        const data = await predRes.json();
        setPredictions(data.predictions || []);
        setTournamentEnded(data.tournamentEnded || false);
      }

      if (lbRes.ok) {
        const lbData = await lbRes.json();
        const myEntry = lbData.find(
          (e: { discordId: string; rank: number }) => e.discordId === session?.user.discordId
        );
        if (myEntry) setUserRank(myEntry.rank);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleWalletSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!walletAddress.trim()) return;
    setWalletSubmitting(true);
    setWalletMessage('');
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setWalletMessage('✅ Wallet address saved successfully!');
      } else {
        setWalletMessage(`❌ ${data.error || 'Failed to save wallet'}`);
      }
    } catch {
      setWalletMessage('❌ Network error');
    } finally {
      setWalletSubmitting(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!session) return null;

  const totalPredictions = predictions.length;
  const finishedPredictions = predictions.filter((p) => p.pointsEarned !== null);
  const exactScores = finishedPredictions.filter((p) => p.pointsEarned === 5).length;
  const correctOutcomes = finishedPredictions.filter(
    (p) => p.pointsEarned !== null && p.pointsEarned > 0 && p.pointsEarned < 5
  ).length;

  const canSubmitWallet = tournamentEnded && userRank !== null && userRank <= 3;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Image
          src={session.user?.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
          alt={session.user?.username ?? 'User'}
          width={80}
          height={80}
          className="rounded-full border-2 border-primary"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-black">{session.user?.username}</h1>
          <p className="text-gray-400 text-sm">
            #{session.user?.discriminator !== '0' ? session.user?.discriminator : '0000'}
          </p>
          {userRank && (
            <div className="mt-2 inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
              Rank #{userRank}
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-4xl font-black text-gold">{session.user?.points ?? 0}</div>
          <div className="text-xs text-gray-400">Total Points</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-primary">{totalPredictions}</div>
          <div className="text-xs text-gray-400">Predictions</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-green-400">{finishedPredictions.length}</div>
          <div className="text-xs text-gray-400">Scored</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-gold">{exactScores}</div>
          <div className="text-xs text-gray-400">Exact Scores</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-black text-blue-400">{correctOutcomes}</div>
          <div className="text-xs text-gray-400">Correct Outcomes</div>
        </div>
      </div>

      {/* Wallet submission (top 3 only after tournament ends) */}
      {canSubmitWallet && (
        <div className="card p-6 mb-6 border-gold/30">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            🏆 <span className="gradient-text">Claim Your Prize</span>
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Congratulations! You&apos;re in the top 3. Submit your Injective wallet address to receive your prize.
          </p>
          <form onSubmit={handleWalletSubmit} className="flex gap-3">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="inj1..."
              className="flex-1 bg-dark border border-dark-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={walletSubmitting}
              className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
            >
              {walletSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </form>
          {walletMessage && (
            <p className="mt-2 text-sm">{walletMessage}</p>
          )}
        </div>
      )}

      {/* Predictions history */}
      <div>
        <h2 className="text-xl font-bold mb-4">Predictions History</h2>
        {predictions.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">
            No predictions yet
          </div>
        ) : (
          <div className="space-y-2">
            {predictions.map((pred) => {
              const match = pred.matchId;
              const isFinished = match?.status === 'finished';
              return (
                <div key={pred._id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {match?.homeTeam} vs {match?.awayTeam}
                    </div>
                    <div className="text-xs text-gray-500">
                      {match?.stage} · Group {match?.group} ·{' '}
                      {match?.matchDate
                        ? new Date(match.matchDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : ''}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Your Pick</div>
                    <div className="font-bold text-white">
                      {pred.predictedHome}–{pred.predictedAway}
                    </div>
                  </div>
                  {isFinished && (
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-0.5">Result</div>
                      <div className="font-bold text-white">
                        {match.homeScore}–{match.awayScore}
                      </div>
                    </div>
                  )}
                  <div className="text-center min-w-[60px]">
                    {pred.pointsEarned !== null ? (
                      <span
                        className={`text-lg font-black ${
                          pred.pointsEarned === 5
                            ? 'text-gold'
                            : pred.pointsEarned > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        +{pred.pointsEarned}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
  const [savedWallet, setSavedWallet] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [tournamentEnded, setTournamentEnded] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/';
  }, [status]);

  useEffect(() => {
    if (!session) return;
    fetchData();
    if (session.user?.walletAddress) {
      setSavedWallet(session.user.walletAddress);
      setWalletAddress(session.user.walletAddress);
    }
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
        const me = lbData.find((e: { discordId: string; rank: number }) => e.discordId === session?.user?.discordId);
        if (me) setUserRank(me.rank);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleWalletSubmit(e: React.FormEvent) {
    e.preventDefault();
    const addr = walletAddress.trim();
    if (!addr) return;
    setWalletSubmitting(true);
    setWalletMessage('');
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: addr }),
      });
      const data = await res.json();
      if (res.ok) {
        setSavedWallet(addr);
        setWalletMessage('Wallet address saved!');
      } else {
        setWalletMessage(data.error || 'Failed to save');
      }
    } catch { setWalletMessage('Network error'); }
    finally { setWalletSubmitting(false); }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sb-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const total = predictions.length;
  const scored = predictions.filter((p) => p.pointsEarned !== null);
  const exactScores = scored.filter((p) => p.pointsEarned === 5).length;
  const correctOutcomes = scored.filter((p) => p.pointsEarned !== null && p.pointsEarned > 0 && p.pointsEarned < 5).length;
  const wrong = scored.filter((p) => p.pointsEarned === 0).length;

  return (
    <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">

      {/* Profile card */}
      <div className="sb-card p-4 flex items-center gap-4">
        <Image
          src={session.user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
          alt={session.user?.username ?? 'User'}
          width={56}
          height={56}
          className="rounded-full border-2 border-sb-yellow/60 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-lg leading-tight">{session.user?.username}</div>
          <div className="text-sb-muted text-xs">Discord ID · {session.user?.discordId}</div>
          {userRank && (
            <div className="mt-1 inline-flex items-center gap-1.5 bg-sb-yellow/10 border border-sb-yellow/30 text-sb-yellow text-xs font-bold px-2 py-0.5 rounded-sm">
              #{userRank} on Leaderboard
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-black text-sb-yellow">{session.user?.points ?? 0}</div>
          <div className="text-[10px] text-sb-muted uppercase">Total Pts</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { val: total, label: 'Predictions', color: 'text-white' },
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

      {/* Wallet section */}
      <div className="sb-card overflow-hidden">
        <div className="sb-section-header">Injective Wallet Address</div>
        <div className="p-4">
          {savedWallet && (
            <div className="mb-3 flex items-center gap-2 bg-sb-bg border border-sb-border rounded-sm px-3 py-2">
              <span className="text-green-400 text-xs">●</span>
              <span className="text-green-400 font-mono text-xs break-all">{savedWallet}</span>
            </div>
          )}
          <p className="text-sb-muted text-xs mb-3">
            {savedWallet
              ? 'Update your linked wallet address below.'
              : 'Enter your Injective wallet address to link it to your account. Top 3 players receive prizes at tournament end.'}
          </p>
          <form onSubmit={handleWalletSubmit} className="flex gap-2">
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="inj1..."
              className="flex-1 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white font-mono focus:outline-none placeholder:text-sb-muted"
            />
            <button
              type="submit"
              disabled={walletSubmitting || !walletAddress.trim()}
              className="sb-btn text-xs px-4 disabled:opacity-40"
            >
              {walletSubmitting ? 'Saving...' : savedWallet ? 'Update' : 'Save'}
            </button>
          </form>
          {walletMessage && (
            <p className="mt-2 text-xs text-sb-muted">{walletMessage}</p>
          )}
        </div>
      </div>

      {/* Prize banner for top 3 after tournament */}
      {tournamentEnded && userRank !== null && userRank <= 3 && (
        <div className="sb-card p-4 border-l-4 border-l-sb-yellow bg-sb-yellow/5">
          <p className="text-sb-yellow font-bold text-sm">
            You finished #{userRank} — make sure your wallet above is correct to claim your prize!
          </p>
        </div>
      )}

      {/* Predictions history */}
      <div className="sb-card overflow-hidden">
        <div className="sb-section-header">Predictions History</div>
        {predictions.length === 0 ? (
          <div className="p-8 text-center text-sb-muted text-sm">No predictions yet</div>
        ) : (
          predictions.map((pred) => {
            const match = pred.matchId;
            const pts = pred.pointsEarned;
            const ptColor = pts === 5 ? 'text-sb-yellow' : pts && pts > 0 ? 'text-green-400' : pts === 0 ? 'text-red-400' : 'text-sb-muted';
            return (
              <div key={pred._id} className="flex items-center px-4 py-3 border-b border-sb-border hover:bg-sb-card-2 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {match?.homeTeam} vs {match?.awayTeam}
                  </div>
                  <div className="text-[10px] text-sb-muted">
                    {match?.stage} · Group {match?.group} ·{' '}
                    {match?.matchDate ? new Date(match.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
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

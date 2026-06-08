'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Match {
  _id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  stage: string;
  matchDate: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const [togglingTournament, setTogglingTournament] = useState(false);
  const [scoreInputs, setScoreInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [scoreMessages, setScoreMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/';
    }
  }, [status]);

  useEffect(() => {
    if (!session) return;

    const adminIds = (process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS || '').split(',');
    const isAdminUser = adminIds.includes(session.user?.discordId ?? '');
    setIsAdmin(isAdminUser);

    if (isAdminUser) {
      fetchMatches();
      fetchTournamentStatus();
    } else {
      setLoading(false);
    }
  }, [session]);

  async function fetchMatches() {
    const res = await fetch('/api/matches');
    if (res.ok) {
      const data = await res.json();
      setMatches(data);
    }
    setLoading(false);
  }

  async function fetchTournamentStatus() {
    const res = await fetch('/api/admin/tournament-status');
    if (res.ok) {
      const data = await res.json();
      setTournamentEnded(data.tournamentEnded);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg('');
    const res = await fetch('/api/admin/seed', { method: 'POST' });
    const data = await res.json();
    setSeedMsg(res.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
    setSeeding(false);
    if (res.ok) fetchMatches();
  }

  async function handleSetScore(matchId: string) {
    const input = scoreInputs[matchId];
    if (!input) return;
    const home = parseInt(input.home);
    const away = parseInt(input.away);
    if (isNaN(home) || isNaN(away)) {
      setScoreMessages((m) => ({ ...m, [matchId]: '❌ Invalid scores' }));
      return;
    }
    const res = await fetch('/api/admin/set-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeScore: home, awayScore: away }),
    });
    const data = await res.json();
    setScoreMessages((m) => ({
      ...m,
      [matchId]: res.ok ? `✅ Score set. ${data.predictionsUpdated} predictions scored.` : `❌ ${data.error}`,
    }));
    if (res.ok) fetchMatches();
  }

  async function handleToggleTournament() {
    setTogglingTournament(true);
    const res = await fetch('/api/admin/set-score', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentEnded: !tournamentEnded }),
    });
    if (res.ok) {
      setTournamentEnded(!tournamentEnded);
    }
    setTogglingTournament(false);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-black">⚙️ Admin Panel</h1>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : '🌱 Seed Fixtures'}
          </button>
          <button
            onClick={handleToggleTournament}
            disabled={togglingTournament}
            className={`text-sm px-4 py-2 rounded-xl font-semibold transition-colors ${
              tournamentEnded
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {tournamentEnded ? '🟢 Tournament Active' : '🔴 End Tournament'}
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="card p-3 mb-4 text-sm">{seedMsg}</div>
      )}

      <div className="card p-4 mb-4 text-sm text-gray-400">
        Tournament Status: <span className={tournamentEnded ? 'text-red-400' : 'text-green-400'}>
          {tournamentEnded ? 'Ended' : 'Active'}
        </span>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match._id} className="card p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="font-semibold">
                  {match.homeTeam} vs {match.awayTeam}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {match.stage} · Group {match.group} · {match.matchId} ·{' '}
                  {new Date(match.matchDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    match.status === 'finished'
                      ? 'bg-gray-700 text-gray-300'
                      : match.status === 'live'
                      ? 'bg-red-600 text-white'
                      : 'bg-green-900 text-green-300'
                  }`}
                >
                  {match.status}
                </span>
                {match.status === 'finished' && (
                  <span className="text-sm font-bold text-gold">
                    {match.homeScore}–{match.awayScore}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="H"
                  value={scoreInputs[match._id]?.home || ''}
                  onChange={(e) =>
                    setScoreInputs((s) => ({
                      ...s,
                      [match._id]: { ...s[match._id], home: e.target.value },
                    }))
                  }
                  className="w-14 bg-dark border border-dark-border rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-primary"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="number"
                  min="0"
                  placeholder="A"
                  value={scoreInputs[match._id]?.away || ''}
                  onChange={(e) =>
                    setScoreInputs((s) => ({
                      ...s,
                      [match._id]: { ...s[match._id], away: e.target.value },
                    }))
                  }
                  className="w-14 bg-dark border border-dark-border rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleSetScore(match._id)}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  Set
                </button>
              </div>
            </div>
            {scoreMessages[match._id] && (
              <div className="mt-2 text-xs text-gray-400">{scoreMessages[match._id]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

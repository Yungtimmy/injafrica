'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  stage: string;
  matchDate: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

const KNOCKOUT_STAGES = [
  'Round of 32',
  'Round of 16',
  'Quarter-finals',
  'Semi-finals',
  'Third Place',
  'Final',
];

const VENUES = [
  'MetLife Stadium, New Jersey',
  'AT&T Stadium, Dallas',
  'SoFi Stadium, Los Angeles',
  'Levi\'s Stadium, San Francisco',
  'Arrowhead Stadium, Kansas City',
  'Empower Field, Denver',
  'NRG Stadium, Houston',
  'Estadio Azteca, Mexico City',
  'Estadio BBVA, Monterrey',
  'Estadio Akron, Guadalajara',
  'BC Place, Vancouver',
  'BMO Field, Toronto',
];

const emptyForm = {
  homeTeam: '',
  awayTeam: '',
  stage: 'Round of 16',
  group: '',
  matchDate: '',
  venue: '',
  city: '',
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Seed / tournament
  const [seedMsg, setSeedMsg] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [tournamentEnded, setTournamentEnded] = useState(false);
  const [togglingTournament, setTogglingTournament] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Score inputs
  const [scoreInputs, setScoreInputs] = useState<Record<string, { home: string; away: string }>>({});
  const [scoreMessages, setScoreMessages] = useState<Record<string, string>>({});

  // Create match form
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter
  const [stageFilter, setStageFilter] = useState('All');

  // Wallets
  const [wallets, setWallets] = useState<{ discordId: string; username: string; points: number; walletAddress: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'wallets' | 'users' | 'finalPredictions'>('matches');
  const [users, setUsers] = useState([]);
  const [finalPredictions, setFinalPredictions] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/';
  }, [status]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then(({ isAdmin: adminResult }) => {
        setIsAdmin(adminResult);
        if (adminResult) {
          fetchMatches();
          fetchTournamentStatus();
          fetchWallets();
          fetchUsers();
          fetchFinalPredictions();
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [session]);

  async function fetchMatches() {
    const res = await fetch('/api/matches');
    if (res.ok) setMatches(await res.json());
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
    if (!confirm('This will wipe and reseed all Group Stage fixtures. Knockout matches you added manually will NOT be affected. Continue?')) return;
    setSeeding(true);
    setSeedMsg('');
    const res = await fetch('/api/admin/seed', { method: 'POST' });
    const data = await res.json();
    setSeedMsg(res.ok ? data.message : data.error);
    setSeeding(false);
    if (res.ok) fetchMatches();
  }

  async function handleResetPoints() {
    if (!confirm('This will DELETE all predictions and reset every user\'s points to 0. This cannot be undone. Continue?')) return;
    setResetting(true);
    setSeedMsg('');
    const res = await fetch('/api/admin/reset-points', { method: 'POST' });
    const data = await res.json();
    setSeedMsg(res.ok ? data.message : data.error);
    setResetting(false);
    if (res.ok) fetchWallets();
  }

  async function handleToggleTournament() {
    setTogglingTournament(true);
    const res = await fetch('/api/admin/set-score', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournamentEnded: !tournamentEnded }),
    });
    if (res.ok) setTournamentEnded(!tournamentEnded);
    setTogglingTournament(false);
  }

  async function handleSetScore(matchId: string) {
    const input = scoreInputs[matchId];
    if (!input) return;
    const home = parseInt(input.home);
    const away = parseInt(input.away);
    if (isNaN(home) || isNaN(away)) {
      setScoreMessages((m) => ({ ...m, [matchId]: 'Invalid scores' }));
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
      [matchId]: res.ok ? `Done. ${data.predictionsUpdated} predictions scored.` : (data.error || 'Error'),
    }));
    if (res.ok) fetchMatches();
  }

  async function fetchUsers() {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  }

  async function fetchFinalPredictions() {
    const res = await fetch('/api/admin/final-predictions');
    if (res.ok) setFinalPredictions(await res.json());
  }

  async function fetchWallets() {
    const res = await fetch('/api/admin/wallets');
    if (res.ok) setWallets(await res.json());
  }

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg('');
    const res = await fetch('/api/admin/create-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setCreateMsg('Match created successfully.');
      setForm(emptyForm);
      fetchMatches();
    } else {
      setCreateMsg(data.error || 'Failed to create match');
    }
    setCreating(false);
  }

  const allStages = ['All', 'Group Stage', ...KNOCKOUT_STAGES];
  const filteredMatches = stageFilter === 'All'
    ? matches
    : matches.filter((m) => m.stage === stageFilter);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sb-muted text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl font-black text-red-400 mb-3">403</div>
          <p className="text-sb-muted text-sm">Access denied.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 py-4 space-y-4">

      {/* Header */}
      <div className="sb-card px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="font-black text-white text-lg">Admin Panel</div>
          <div className="text-xs text-sb-muted">
            Tournament:{' '}
            <span className={tournamentEnded ? 'text-red-400' : 'text-green-400'}>
              {tournamentEnded ? 'Ended' : 'Active'}
            </span>
            {' · '}{matches.length} matches total
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="sb-btn-outline text-xs px-3 py-2 disabled:opacity-40"
          >
            {seeding ? 'Seeding...' : 'Seed Group Stage'}
          </button>
          <button
            onClick={handleToggleTournament}
            disabled={togglingTournament}
            className={`text-xs px-3 py-2 rounded-sm font-bold transition-colors ${
              tournamentEnded
                ? 'bg-green-700 hover:bg-green-600 text-white'
                : 'bg-red-700 hover:bg-red-600 text-white'
            }`}
          >
            {togglingTournament ? '...' : tournamentEnded ? 'Reactivate Tournament' : 'End Tournament'}
          </button>
          <button
            onClick={handleResetPoints}
            disabled={resetting}
            className="text-xs px-3 py-2 rounded-sm font-bold bg-orange-700 hover:bg-orange-600 text-white transition-colors disabled:opacity-40"
          >
            {resetting ? 'Resetting...' : 'Reset All Points'}
          </button>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setCreateMsg(''); }}
            className="sb-btn text-xs px-3 py-2"
          >
            {showCreateForm ? 'Cancel' : '+ Add Knockout Match'}
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="sb-card px-4 py-2 text-xs text-sb-muted">{seedMsg}</div>
      )}

      {/* Create Match Form */}
      {showCreateForm && (
        <div className="sb-card overflow-hidden">
          <div className="sb-section-header">Create Knockout Match</div>
          <form onSubmit={handleCreateMatch} className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Home Team *</label>
                <input
                  type="text"
                  value={form.homeTeam}
                  onChange={(e) => setForm((f) => ({ ...f, homeTeam: e.target.value }))}
                  placeholder="e.g. Brazil"
                  required
                  className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none placeholder:text-sb-muted"
                />
              </div>
              <div>
                <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Away Team *</label>
                <input
                  type="text"
                  value={form.awayTeam}
                  onChange={(e) => setForm((f) => ({ ...f, awayTeam: e.target.value }))}
                  placeholder="e.g. Argentina"
                  required
                  className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none placeholder:text-sb-muted"
                />
              </div>
              <div>
                <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Stage *</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                  className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none"
                >
                  {KNOCKOUT_STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Match Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.matchDate}
                  onChange={(e) => setForm((f) => ({ ...f, matchDate: e.target.value }))}
                  required
                  className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Venue</label>
                <select
                  value={form.venue}
                  onChange={(e) => {
                    const v = e.target.value;
                    const city = v.split(',')[1]?.trim() || '';
                    setForm((f) => ({ ...f, venue: v, city }));
                  }}
                  className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="">Select venue...</option>
                  {VENUES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Auto-filled from venue"
                  className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none placeholder:text-sb-muted"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={creating}
                className="sb-btn text-xs px-5 py-2 disabled:opacity-40"
              >
                {creating ? 'Creating...' : 'Create Match'}
              </button>
              {createMsg && (
                <span className="text-xs text-sb-muted">{createMsg}</span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Main tab switcher */}
      <div className="flex gap-1">
        {(['matches', 'wallets', 'users', 'finalPredictions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-bold px-4 py-2 rounded-sm transition-colors capitalize ${
              activeTab === tab
                ? 'bg-sb-yellow text-black'
                : 'bg-sb-card border border-sb-border text-sb-muted hover:text-white'
            }`}
          >
            {tab === 'wallets' ? `Wallets (${wallets.length})` : tab === 'users' ? `Users (${users.length})` : tab === 'finalPredictions' ? `Final Predictions (${finalPredictions.length})` : 'Matches'}
          </button>
        ))}
      </div>

      {/* Wallets tab */}
      {activeTab === 'wallets' && (
        <div className="sb-card overflow-hidden">
          <div className="sb-section-header">
            Linked Wallets
            <span className="ml-auto text-sb-muted text-[10px] font-normal normal-case">{wallets.length} users</span>
          </div>
          {wallets.length === 0 ? (
            <div className="p-8 text-center text-sb-muted text-sm">No wallets linked yet</div>
          ) : (
            wallets.map((u, i) => (
              <div key={u.discordId} className="px-4 py-3 border-b border-sb-border last:border-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={`text-xs font-black w-6 shrink-0 ${i === 0 ? 'text-sb-yellow' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-500' : 'text-sb-muted'}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white">{u.username}</span>
                    <span className="text-[10px] text-sb-muted ml-2">{u.discordId}</span>
                  </div>
                  <div className="text-sb-yellow font-black text-sm shrink-0">{u.points} pts</div>
                </div>
                <div className="ml-9 flex items-center gap-2">
                  <span className="text-[10px] text-sb-muted uppercase shrink-0">Wallet:</span>
                  <span className="text-green-400 font-mono text-xs break-all">{u.walletAddress}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(u.walletAddress)}
                    className="shrink-0 text-[10px] text-sb-muted hover:text-white border border-sb-border rounded-sm px-1.5 py-0.5 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stage filter tabs — matches only */}

      {activeTab === 'users' && (
        <div className="sb-card overflow-hidden">
          <div className="sb-section-header">Registered Users<span className="ml-auto text-sb-muted text-[10px] font-normal normal-case">{users.length} total</span></div>
          {users.length === 0 ? <div className="p-8 text-center text-sb-muted text-sm">No users yet</div> : (users as any[]).map((u, i) => (
            <div key={u.discordId} className="flex items-center gap-3 px-4 py-3 border-b border-sb-border last:border-0">
              <div className="text-xs font-black w-6 shrink-0 text-sb-muted">#{i+1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">{u.username}</div>
                <div className="text-[10px] text-sb-muted">{u.discordId} · Joined {new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sb-yellow font-black text-sm">{u.points} pts</div>
                {u.walletAddress ? <div className="text-[10px] text-green-400">Wallet linked</div> : <div className="text-[10px] text-sb-muted">No wallet</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'finalPredictions' && (
        <div className="sb-card overflow-hidden">
          <div className="sb-section-header">Final Predictions<span className="ml-auto text-sb-muted text-[10px] font-normal normal-case">{finalPredictions.length} entries</span></div>
          {finalPredictions.length === 0 ? <div className="p-8 text-center text-sb-muted text-sm">No final predictions yet</div> : (finalPredictions as any[]).map((fp) => (
            <div key={fp.discordId} className="flex items-center gap-3 px-4 py-3 border-b border-sb-border last:border-0">
              <div className="flex-1 min-w-0"><span className="text-sm font-bold text-white">{fp.username}</span><span className="text-[10px] text-sb-muted ml-2">{fp.discordId}</span></div>
              <div className="text-sm text-white shrink-0"><span className="font-bold">{fp.team1}</span><span className="text-sb-yellow font-black mx-2">{fp.scoreTeam1}-{fp.scoreTeam2}</span><span className="font-bold">{fp.team2}</span></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'matches' && <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {allStages.map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-sm transition-colors ${
              stageFilter === s
                ? 'bg-sb-yellow text-black'
                : 'bg-sb-card border border-sb-border text-sb-muted hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>}

      {/* Matches list — matches only */}
      {activeTab === 'matches' && <div className="sb-card overflow-hidden">
        <div className="sb-section-header">
          {stageFilter === 'All' ? 'All Matches' : stageFilter}
          <span className="ml-auto text-sb-muted text-[10px] font-normal normal-case">{filteredMatches.length} matches</span>
        </div>
        {filteredMatches.length === 0 ? (
          <div className="p-8 text-center text-sb-muted text-sm">No matches in this stage yet</div>
        ) : (
          filteredMatches.map((match) => (
            <div key={match._id} className="border-b border-sb-border last:border-0 px-4 py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* Match info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm">
                    {match.homeTeam} <span className="text-sb-muted font-normal">vs</span> {match.awayTeam}
                  </div>
                  <div className="text-[10px] text-sb-muted mt-0.5">
                    {match.stage}{match.group ? ` · Group ${match.group}` : ''} ·{' '}
                    {new Date(match.matchDate).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Status badge */}
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm shrink-0 ${
                  match.status === 'finished' ? 'bg-sb-border text-sb-muted' :
                  match.status === 'live' ? 'bg-sb-live/20 text-sb-live' :
                  'bg-green-900/40 text-green-400'
                }`}>
                  {match.status === 'finished'
                    ? `FT ${match.homeScore}–${match.awayScore}`
                    : match.status}
                </span>

                {/* Score inputs */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number" min="0" placeholder="H"
                    value={scoreInputs[match._id]?.home || ''}
                    onChange={(e) => setScoreInputs((s) => ({ ...s, [match._id]: { ...s[match._id], home: e.target.value } }))}
                    className="w-12 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-1 py-1.5 text-center text-sm text-white focus:outline-none"
                  />
                  <span className="text-sb-muted text-xs font-bold">–</span>
                  <input
                    type="number" min="0" placeholder="A"
                    value={scoreInputs[match._id]?.away || ''}
                    onChange={(e) => setScoreInputs((s) => ({ ...s, [match._id]: { ...s[match._id], away: e.target.value } }))}
                    className="w-12 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-1 py-1.5 text-center text-sm text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleSetScore(match._id)}
                    className="sb-btn text-[11px] px-3 py-1.5"
                  >
                    Set
                  </button>
                </div>
              </div>
              {scoreMessages[match._id] && (
                <div className="mt-1.5 text-[11px] text-sb-muted">{scoreMessages[match._id]}</div>
              )}
            </div>
          ))
        )}
      </div>}
    </div>
  );
}

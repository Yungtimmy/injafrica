'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const ALL_TEAMS = [
  'Mexico', 'South Africa', 'South Korea', 'Czech Republic',
  'Canada', 'Bosnia & Herzegovina', 'Qatar', 'Switzerland',
  'Brazil', 'Morocco', 'Haiti', 'Scotland',
  'United States', 'Paraguay', 'Australia', 'Turkey',
  'Germany', 'Ivory Coast', 'Ecuador', 'Curaçao',
  'Netherlands', 'Japan', 'Sweden', 'Tunisia',
  'Belgium', 'Egypt', 'Iran', 'New Zealand',
  'Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay',
  'France', 'Senegal', 'Iraq', 'Norway',
  'Argentina', 'Algeria', 'Austria', 'Jordan',
  'Portugal', 'DR Congo', 'Uzbekistan', 'Colombia',
  'England', 'Croatia', 'Ghana', 'Panama',
].sort();

export default function FinalPredictionPage() {
  const { data: session, status } = useSession();
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [scoreTeam1, setScoreTeam1] = useState('');
  const [scoreTeam2, setScoreTeam2] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState<{ team1: string; team2: string; scoreTeam1: number; scoreTeam2: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') window.location.href = '/';
  }, [status]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/final-prediction')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setSaved(data);
          setTeam1(data.team1);
          setTeam2(data.team2);
          setScoreTeam1(String(data.scoreTeam1));
          setScoreTeam2(String(data.scoreTeam2));
        }
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!team1 || !team2) { setMessage('Select both finalists'); return; }
    if (team1 === team2) { setMessage('Select two different teams'); return; }
    if (scoreTeam1 === '' || scoreTeam2 === '') { setMessage('Enter the predicted score'); return; }
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/final-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team1, team2, scoreTeam1: parseInt(scoreTeam1), scoreTeam2: parseInt(scoreTeam2) }),
      });
      const data = await res.json();
      if (res.ok) { setSaved(data); setMessage('Prediction saved!'); }
      else { setMessage(data.error || 'Failed to save'); }
    } catch { setMessage('Network error'); }
    finally { setSubmitting(false); }
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-sb-muted text-sm">Loading...</div></div>;
  }
  if (!session) return null;

  const team1Options = ALL_TEAMS.filter((t) => t !== team2);
  const team2Options = ALL_TEAMS.filter((t) => t !== team1);

  return (
    <div className="max-w-lg mx-auto px-3 py-8 space-y-6">
      <div className="text-center space-y-1">
        <div className="text-[10px] text-sb-muted uppercase tracking-widest">World Cup 2026</div>
        <h1 className="text-2xl font-black text-white">Final Prediction</h1>
        <p className="text-sb-muted text-xs">Pick the two teams you think will reach the final and predict the score.</p>
      </div>
      {saved && (
        <div className="sb-card px-4 py-3 border-l-4 border-l-sb-yellow">
          <div className="text-[10px] text-sb-muted uppercase mb-1">Your current prediction</div>
          <div className="text-white font-bold text-sm">{saved.team1} <span className="text-sb-yellow">{saved.scoreTeam1}–{saved.scoreTeam2}</span> {saved.team2}</div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="sb-card overflow-hidden">
        <div className="sb-section-header">Select Finalists</div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Team 1</label>
              <select value={team1} onChange={(e) => setTeam1(e.target.value)} required className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">Select...</option>
                {team1Options.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-sb-muted uppercase tracking-wide mb-1">Team 2</label>
              <select value={team2} onChange={(e) => setTeam2(e.target.value)} required className="w-full bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none">
                <option value="">Select...</option>
                {team2Options.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {team1 && team2 && (
            <div>
              <div className="sb-section-header -mx-4 px-4 mb-3">Predicted Final Score</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-sb-muted mb-1 truncate max-w-[100px]">{team1}</div>
                  <input type="number" min="0" max="20" value={scoreTeam1} onChange={(e) => setScoreTeam1(e.target.value)} required className="w-16 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-2 py-2 text-center text-xl font-black text-white focus:outline-none" />
                </div>
                <div className="text-sb-muted font-black text-xl pb-1">–</div>
                <div className="text-center">
                  <div className="text-xs text-sb-muted mb-1 truncate max-w-[100px]">{team2}</div>
                  <input type="number" min="0" max="20" value={scoreTeam2} onChange={(e) => setScoreTeam2(e.target.value)} required className="w-16 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-2 py-2 text-center text-xl font-black text-white focus:outline-none" />
                </div>
              </div>
            </div>
          )}
          <button type="submit" disabled={submitting} className="sb-btn w-full py-2.5 text-sm font-bold disabled:opacity-40">
            {submitting ? 'Saving...' : saved ? 'Update Prediction' : 'Submit Prediction'}
          </button>
          {message && <p className={`text-xs text-center ${message === 'Prediction saved!' ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
        </div>
      </form>
      <div className="text-center space-y-1 pt-2">
        <p className="text-sb-muted text-xs">Hosted by <a href="https://x.com/PeterCryptoG" target="_blank" rel="noopener noreferrer" className="text-sb-yellow hover:underline font-semibold">Peter</a></p>
        <p className="text-sb-muted text-xs">Built by <a href="https://x.com/Tebasv2" target="_blank" rel="noopener noreferrer" className="text-sb-yellow hover:underline font-semibold">Tebas</a></p>
      </div>
    </div>
  );
}

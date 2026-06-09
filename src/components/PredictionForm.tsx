'use client';

import { useState } from 'react';
import { IPrediction } from '@/types';

interface PredictionFormProps {
  matchId: string;
  homeTeam?: string;
  awayTeam?: string;
  existingPrediction?: IPrediction | null;
  onSuccess?: (prediction: IPrediction) => void;
}

type Outcome = 'home' | 'draw' | 'away' | null;

function deriveOutcome(home: number, away: number): Outcome {
  if (home > away) return 'home';
  if (home === away) return 'draw';
  return 'away';
}

function defaultScoreForOutcome(o: Outcome): [string, string] {
  if (o === 'home') return ['1', '0'];
  if (o === 'draw') return ['1', '1'];
  if (o === 'away') return ['0', '1'];
  return ['', ''];
}

export default function PredictionForm({
  matchId,
  homeTeam = 'Home',
  awayTeam = 'Away',
  existingPrediction,
  onSuccess,
}: PredictionFormProps) {
  const initHome = existingPrediction?.predictedHome?.toString() ?? '';
  const initAway = existingPrediction?.predictedAway?.toString() ?? '';
  const initOutcome: Outcome =
    initHome !== '' && initAway !== ''
      ? deriveOutcome(Number(initHome), Number(initAway))
      : null;

  const [outcome, setOutcome] = useState<Outcome>(initOutcome);
  const [homeScore, setHomeScore] = useState(initHome);
  const [awayScore, setAwayScore] = useState(initAway);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(!!existingPrediction);

  function selectOutcome(o: Outcome) {
    setOutcome(o);
    setSaved(false);
    setMessage('');
    // Only pre-fill if scores are empty or don't match current outcome
    const currentOutcome =
      homeScore !== '' && awayScore !== ''
        ? deriveOutcome(Number(homeScore), Number(awayScore))
        : null;
    if (currentOutcome !== o) {
      const [h, a] = defaultScoreForOutcome(o);
      setHomeScore(h);
      setAwayScore(a);
    }
  }

  function handleScoreChange(side: 'home' | 'away', val: string) {
    const h = side === 'home' ? val : homeScore;
    const a = side === 'away' ? val : awayScore;
    if (side === 'home') setHomeScore(val);
    else setAwayScore(val);
    if (h !== '' && a !== '') {
      setOutcome(deriveOutcome(Number(h), Number(a)));
    }
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setMessage('Enter a valid score');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, predictedHome: home, predictedAway: away }),
      });
      const data = await res.json();
      if (res.ok) { setSaved(true); if (onSuccess) onSuccess(data); }
      else setMessage(data.error || 'Failed to save');
    } catch { setMessage('Network error'); }
    finally { setSubmitting(false); }
  }

  const OUTCOMES: { key: Outcome; label: string; sub: string }[] = [
    { key: 'home', label: '1', sub: homeTeam },
    { key: 'draw', label: 'X', sub: 'Draw' },
    { key: 'away', label: '2', sub: awayTeam },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Outcome selector */}
      <div className="grid grid-cols-3 gap-1">
        {OUTCOMES.map(({ key, label, sub }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectOutcome(key)}
            className={`py-2 px-1 rounded-sm border text-center transition-all ${
              outcome === key
                ? 'bg-sb-yellow border-sb-yellow text-black'
                : 'bg-sb-bg border-sb-border text-white hover:border-sb-yellow/50'
            }`}
          >
            <div className="font-black text-base leading-none">{label}</div>
            <div className={`text-[10px] mt-0.5 truncate font-medium ${outcome === key ? 'text-black/70' : 'text-sb-muted'}`}>
              {sub}
            </div>
          </button>
        ))}
      </div>

      {/* Correct score */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[10px] text-sb-muted uppercase tracking-wide shrink-0">Correct Score:</span>
        <div className="flex items-center gap-1">
          <input
            type="number" min="0" max="20"
            value={homeScore}
            onChange={(e) => handleScoreChange('home', e.target.value)}
            placeholder="0"
            className="w-10 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-1 py-1 text-center text-sm font-bold text-white focus:outline-none"
          />
          <span className="text-sb-muted font-black text-xs">–</span>
          <input
            type="number" min="0" max="20"
            value={awayScore}
            onChange={(e) => handleScoreChange('away', e.target.value)}
            placeholder="0"
            className="w-10 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-1 py-1 text-center text-sm font-bold text-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={submitting || !outcome}
          className={`ml-auto text-[11px] px-3 py-1.5 font-black uppercase tracking-wide rounded-sm transition-colors disabled:opacity-40 ${
            saved ? 'bg-green-700 text-white' : 'bg-sb-yellow hover:bg-sb-yellow-dark text-black'
          }`}
        >
          {submitting ? '...' : saved ? '✓ Saved' : 'Place'}
        </button>
      </div>

      {message && <p className="text-[10px] text-red-400">{message}</p>}
    </form>
  );
}

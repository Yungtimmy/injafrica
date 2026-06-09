'use client';

import { useState } from 'react';
import { IPrediction } from '@/types';

interface PredictionFormProps {
  matchId: string;
  existingPrediction?: IPrediction | null;
  onSuccess?: (prediction: IPrediction) => void;
}

export default function PredictionForm({ matchId, existingPrediction, onSuccess }: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.predictedHome?.toString() ?? '');
  const [awayScore, setAwayScore] = useState(existingPrediction?.predictedAway?.toString() ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(!!existingPrediction);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setMessage('Enter valid scores');
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
      else setMessage(data.error || 'Failed');
    } catch { setMessage('Network error'); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <input
          type="number" min="0" max="20"
          value={homeScore}
          onChange={(e) => { setHomeScore(e.target.value); setSaved(false); }}
          placeholder="0"
          className="w-11 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-1 py-1.5 text-center text-sm font-bold text-white focus:outline-none"
          required
        />
        <span className="text-sb-muted font-black text-xs">–</span>
        <input
          type="number" min="0" max="20"
          value={awayScore}
          onChange={(e) => { setAwayScore(e.target.value); setSaved(false); }}
          placeholder="0"
          className="w-11 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-1 py-1.5 text-center text-sm font-bold text-white focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className={`text-[11px] px-3 py-1.5 font-black uppercase tracking-wide rounded-sm transition-colors disabled:opacity-50 ${
          saved ? 'bg-green-700 text-white' : 'bg-sb-yellow hover:bg-sb-yellow-dark text-black'
        }`}
      >
        {submitting ? '...' : saved ? '✓ Saved' : 'Predict'}
      </button>
      {message && <span className="text-[10px] text-red-400">{message}</span>}
    </form>
  );
}

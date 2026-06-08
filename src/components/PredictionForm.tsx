'use client';

import { useState } from 'react';
import { IPrediction } from '@/types';

interface PredictionFormProps {
  matchId: string;
  existingPrediction?: IPrediction | null;
  onSuccess?: (prediction: IPrediction) => void;
}

export default function PredictionForm({
  matchId,
  existingPrediction,
  onSuccess,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState<string>(
    existingPrediction?.predictedHome?.toString() ?? ''
  );
  const [awayScore, setAwayScore] = useState<string>(
    existingPrediction?.predictedAway?.toString() ?? ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(!!existingPrediction);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setMessage('Please enter valid scores (0 or more)');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          predictedHome: home,
          predictedAway: away,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('');
        setSaved(true);
        if (onSuccess) onSuccess(data);
      } else {
        setMessage(data.error || 'Failed to save prediction');
        setSaved(false);
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          max="20"
          value={homeScore}
          onChange={(e) => { setHomeScore(e.target.value); setSaved(false); }}
          placeholder="0"
          className="w-12 bg-dark border border-dark-border focus:border-primary rounded-lg px-2 py-1.5 text-center text-sm font-bold focus:outline-none transition-colors"
          required
        />
        <span className="text-gray-500 font-bold">–</span>
        <input
          type="number"
          min="0"
          max="20"
          value={awayScore}
          onChange={(e) => { setAwayScore(e.target.value); setSaved(false); }}
          placeholder="0"
          className="w-12 bg-dark border border-dark-border focus:border-primary rounded-lg px-2 py-1.5 text-center text-sm font-bold focus:outline-none transition-colors"
          required
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
          saved
            ? 'bg-green-700 text-white'
            : 'bg-primary hover:bg-primary-dark text-white'
        } disabled:opacity-50`}
      >
        {submitting ? '...' : saved ? '✓ Saved' : 'Predict'}
      </button>
      {message && <span className="text-xs text-red-400">{message}</span>}
    </form>
  );
}

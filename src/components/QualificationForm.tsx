'use client';

import { useState } from 'react';
import { IPrediction } from '@/types';

interface QualificationFormProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  existingPrediction?: IPrediction | null;
  onSuccess?: (prediction: any) => void;
}

export default function QualificationForm({
  matchId,
  homeTeam,
  awayTeam,
  existingPrediction,
  onSuccess,
}: QualificationFormProps) {
  const initQual = existingPrediction?.predictedQualifier ?? null;
  const [selected, setSelected] = useState<'home' | 'away' | null>(initQual);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(!!initQual);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, predictedQualifier: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        if (onSuccess) onSuccess(data);
      } else {
        setMessage(data.error || 'Failed to save');
      }
    } catch {
      setMessage('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => {
            setSelected('home');
            setSaved(false);
            setMessage('');
          }}
          className={`py-2 px-2 rounded-sm border text-center text-sm font-medium transition-all truncate ${
            selected === 'home'
              ? 'bg-sb-yellow border-sb-yellow text-black'
              : 'bg-sb-bg border-sb-border text-white hover:border-sb-yellow/50'
          }`}
        >
          {homeTeam}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelected('away');
            setSaved(false);
            setMessage('');
          }}
          className={`py-2 px-2 rounded-sm border text-center text-sm font-medium transition-all truncate ${
            selected === 'away'
              ? 'bg-sb-yellow border-sb-yellow text-black'
              : 'bg-sb-bg border-sb-border text-white hover:border-sb-yellow/50'
          }`}
        >
          {awayTeam}
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting || !selected}
        className={`w-full text-[11px] px-3 py-1.5 font-black uppercase tracking-wide rounded-sm transition-colors disabled:opacity-40 ${
          saved ? 'bg-green-700 text-white' : 'bg-sb-yellow hover:bg-sb-yellow-dark text-black'
        }`}
      >
        {submitting ? '...' : saved ? '✓ Saved' : 'Submit Qualifier'}
      </button>

      {message && <p className="text-[10px] text-red-400">{message}</p>}
      {saved && selected && (
        <p className="text-[10px] text-sb-muted text-center">
          You picked: {selected === 'home' ? homeTeam : awayTeam}
        </p>
      )}
    </form>
  );
}

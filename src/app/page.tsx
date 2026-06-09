import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuthButton from '@/components/AuthButton';

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-sb-bg">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-sb-green-dark via-sb-green to-sb-green-dark border-b border-sb-green/40 px-4 py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sb-yellow/10 border border-sb-yellow/30 text-sb-yellow text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-sb-yellow pulse-live" />
            FIFA World Cup 2026 · 48 Teams
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            PREDICT. SCORE. <span className="text-sb-yellow">WIN.</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base mb-8 max-w-md mx-auto">
            Make score predictions for every World Cup 2026 match, earn points, and compete for prizes on the Injective leaderboard.
          </p>
          <div className="flex justify-center">
            <AuthButton />
          </div>
          <p className="mt-3 text-white/30 text-xs">Free to play · Discord login required</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Points system */}
        <div className="sb-section-header mb-0 rounded-sm rounded-b-none">
          How Points Work
        </div>
        <div className="sb-card rounded-t-none mb-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-sb-border">
          <div className="p-5 text-center">
            <div className="text-4xl font-black text-sb-yellow mb-1">5</div>
            <div className="text-white font-bold text-sm mb-1">Exact Score</div>
            <div className="text-sb-muted text-xs">Predict the precise final score</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-4xl font-black text-green-400 mb-1">3</div>
            <div className="text-white font-bold text-sm mb-1">Correct Draw</div>
            <div className="text-sb-muted text-xs">Predict a draw (wrong score)</div>
          </div>
          <div className="p-5 text-center">
            <div className="text-4xl font-black text-white mb-1">1</div>
            <div className="text-white font-bold text-sm mb-1">Correct Winner</div>
            <div className="text-sb-muted text-xs">Pick the right winning team</div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { title: '104 Matches', desc: 'Predict every group stage and knockout match from June to July 2026' },
            { title: 'Live Rankings', desc: 'Leaderboard updates instantly as match results come in' },
            { title: 'Top 3 Prizes', desc: 'Tournament winners submit their Injective wallet to claim rewards' },
          ].map((f) => (
            <div key={f.title} className="sb-card p-4">
              <div className="text-white font-bold text-sm mb-1">{f.title}</div>
              <div className="text-sb-muted text-xs leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

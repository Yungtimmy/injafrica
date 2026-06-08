import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AuthButton from '@/components/AuthButton';

export default async function LandingPage() {
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pitch-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/95 to-pitch/40" />

      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Trophy icon */}
        <div className="mb-6 text-7xl animate-bounce">🏆</div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
          <span className="gradient-text">World Cup 2026</span>
          <br />
          <span className="text-white">Predictor</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl">
          Predict match scores, earn points, and climb the leaderboard
          with the <span className="text-primary font-semibold">Injective</span> community.
        </p>

        <div className="flex items-center gap-2 mb-10 text-sm text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
          <span>48 Teams · 104 Matches · June–July 2026</span>
        </div>

        {/* Points system */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-lg w-full">
          <div className="card p-4 text-center">
            <div className="text-3xl font-black text-gold mb-1">5</div>
            <div className="text-xs text-gray-400">Exact Score</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-black text-primary mb-1">3</div>
            <div className="text-xs text-gray-400">Correct Draw</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-black text-green-400 mb-1">1</div>
            <div className="text-xs text-gray-400">Correct Winner</div>
          </div>
        </div>

        {/* Login button */}
        <AuthButton />

        <p className="mt-4 text-xs text-gray-600">
          Members of the Injective Discord server only
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
          <div className="card p-6 text-left">
            <div className="text-2xl mb-3">⚽</div>
            <h3 className="font-bold mb-2">Predict Matches</h3>
            <p className="text-sm text-gray-400">Submit score predictions before kickoff for all 104 World Cup matches</p>
          </div>
          <div className="card p-6 text-left">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Track Points</h3>
            <p className="text-sm text-gray-400">Earn up to 5 points per match and watch your ranking climb in real-time</p>
          </div>
          <div className="card p-6 text-left">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">Win Rewards</h3>
            <p className="text-sm text-gray-400">Top 3 predictors at the end of the tournament win exclusive prizes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

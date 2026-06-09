import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import Prediction from '@/models/Prediction';
import User from '@/models/User';
import MatchCard from '@/components/MatchCard';
import { IMatch, IPrediction } from '@/types';

async function getDashboardData(discordId: string) {
  await dbConnect();

  const now = new Date();

  // Upcoming matches (next 10)
  const upcomingMatches = await Match.find({
    status: 'scheduled',
    matchDate: { $gte: now },
  })
    .sort({ matchDate: 1 })
    .limit(10)
    .lean();

  // Live matches
  const liveMatches = await Match.find({ status: 'live' }).lean();

  // Get user's predictions for these matches
  const allMatchIds = [...liveMatches, ...upcomingMatches].map((m) => m._id);
  const predictions = await Prediction.find({
    discordId,
    matchId: { $in: allMatchIds },
  }).lean();

  const predMap: Record<string, IPrediction> = {};
  for (const p of predictions) {
    predMap[p.matchId.toString()] = p as unknown as IPrediction;
  }

  // Recent predictions (last 5 finished)
  const recentPredictions = await Prediction.find({
    discordId,
    pointsEarned: { $ne: null },
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('matchId')
    .lean();

  // User rank
  const userRank = await User.countDocuments({ points: { $gt: 0 } }) > 0
    ? await User.countDocuments({
        points: { $gt: (await User.findOne({ discordId }).lean() as { points?: number })?.points ?? 0 },
      }) + 1
    : null;

  return {
    upcomingMatches: upcomingMatches as unknown as IMatch[],
    liveMatches: liveMatches as unknown as IMatch[],
    predMap,
    recentPredictions,
    userRank,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user?.discordId) redirect('/');

  const { upcomingMatches, liveMatches, predMap, recentPredictions, userRank } =
    await getDashboardData(session.user.discordId);

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      {/* User stats bar */}
      <div className="sb-card mb-4 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src={session.user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
            alt={session.user?.username ?? 'User'}
            width={36}
            height={36}
            className="rounded-full border-2 border-sb-yellow/50 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-bold text-white text-sm truncate">{session.user?.username}</div>
            <div className="text-sb-muted text-xs">WC2026 Predictor</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <div className="text-xl font-black text-sb-yellow">{session.user?.points ?? 0}</div>
            <div className="text-[10px] text-sb-muted uppercase">Points</div>
          </div>
          {userRank && (
            <div className="text-center">
              <div className="text-xl font-black text-white">#{userRank}</div>
              <div className="text-[10px] text-sb-muted uppercase">Rank</div>
            </div>
          )}
          <Link href="/leaderboard" className="sb-btn text-xs px-3 py-2">
            Leaderboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main: matches */}
        <div className="lg:col-span-2 space-y-4">
          {/* Live */}
          {liveMatches.length > 0 && (
            <div>
              <div className="sb-section-header rounded-sm mb-px">
                <span className="w-2 h-2 rounded-full bg-sb-live pulse-live" />
                Live Matches
              </div>
              {liveMatches.map((match) => (
                <MatchCard
                  key={match._id.toString()}
                  match={match}
                  prediction={predMap[match._id.toString()]}
                  showPredictionForm={false}
                />
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div>
            <div className="sb-section-header rounded-sm mb-px flex items-center justify-between">
              <span>Upcoming Matches</span>
              <Link href="/matches" className="text-sb-yellow text-[10px] font-bold uppercase tracking-wider hover:underline">
                View All
              </Link>
            </div>
            {upcomingMatches.length === 0 ? (
              <div className="sb-card p-8 text-center text-sb-muted text-sm">No upcoming matches scheduled</div>
            ) : (
              upcomingMatches.map((match) => (
                <MatchCard
                  key={match._id.toString()}
                  match={match}
                  prediction={predMap[match._id.toString()]}
                  showPredictionForm={true}
                  discordId={session.user?.discordId}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick nav */}
          <div className="sb-card overflow-hidden">
            <div className="sb-section-header">Quick Nav</div>
            {[
              { href: '/matches', label: 'All Matches' },
              { href: '/leaderboard', label: 'Leaderboard' },
              { href: '/profile', label: 'My Profile & Wallet' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 px-4 py-3 border-b border-sb-border text-sm text-white hover:bg-sb-card-2 transition-colors">
                <span className="font-medium">{l.label}</span>
                <span className="ml-auto text-sb-muted">›</span>
              </Link>
            ))}
          </div>

          {/* Recent predictions */}
          <div className="sb-card overflow-hidden">
            <div className="sb-section-header">Recent Results</div>
            {recentPredictions.length === 0 ? (
              <div className="p-6 text-center text-sb-muted text-xs">No scored predictions yet</div>
            ) : (
              recentPredictions.map((pred) => {
                const match = pred.matchId as unknown as IMatch;
                const pts = pred.pointsEarned;
                return (
                  <div key={pred._id.toString()} className="flex items-center justify-between px-4 py-2.5 border-b border-sb-border hover:bg-sb-card-2">
                    <div>
                      <div className="text-xs text-white font-medium">
                        {match?.homeTeam} {pred.predictedHome}–{pred.predictedAway} {match?.awayTeam}
                      </div>
                      <div className="text-[10px] text-sb-muted">Your pick</div>
                    </div>
                    <span className={`text-sm font-black ${pts === 5 ? 'text-sb-yellow' : pts && pts > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pts !== null ? `+${pts}` : '—'}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Points guide */}
          <div className="sb-card overflow-hidden">
            <div className="sb-section-header">Points Guide</div>
            {[
              { pts: 5, label: 'Exact Score', color: 'text-sb-yellow' },
              { pts: 3, label: 'Correct Draw', color: 'text-green-400' },
              { pts: 1, label: 'Correct Winner', color: 'text-white' },
            ].map((g) => (
              <div key={g.pts} className="flex items-center justify-between px-4 py-2.5 border-b border-sb-border last:border-0">
                <span className="text-xs text-sb-muted">{g.label}</span>
                <span className={`font-black text-sm ${g.color}`}>+{g.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

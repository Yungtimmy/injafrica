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
  if (!session) redirect('/');

  const { upcomingMatches, liveMatches, predMap, recentPredictions, userRank } =
    await getDashboardData(session.user.discordId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome header */}
      <div className="card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={session.user.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
            alt={session.user.username}
            width={56}
            height={56}
            className="rounded-full border-2 border-primary"
          />
          <div>
            <h1 className="text-xl font-bold">
              Welcome, <span className="text-primary">{session.user.username}</span>!
            </h1>
            <p className="text-sm text-gray-400">Ready to predict some matches?</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-black text-gold">{session.user.points}</div>
            <div className="text-xs text-gray-400">Total Points</div>
          </div>
          {userRank && (
            <div className="text-center">
              <div className="text-3xl font-black text-primary">#{userRank}</div>
              <div className="text-xs text-gray-400">Rank</div>
            </div>
          )}
        </div>
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((match) => (
              <MatchCard
                key={match._id.toString()}
                match={match}
                prediction={predMap[match._id.toString()]}
                showPredictionForm={false}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming matches */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Upcoming Matches</h2>
            <Link href="/matches" className="text-sm text-primary hover:text-primary-light transition-colors">
              View all →
            </Link>
          </div>
          {upcomingMatches.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              No upcoming matches scheduled
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <MatchCard
                  key={match._id.toString()}
                  match={match}
                  prediction={predMap[match._id.toString()]}
                  showPredictionForm={true}
                  discordId={session.user.discordId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent results */}
        <div>
          <h2 className="text-lg font-bold mb-4">Recent Predictions</h2>
          {recentPredictions.length === 0 ? (
            <div className="card p-6 text-center text-gray-500 text-sm">
              No predictions yet.<br />Start predicting to earn points!
            </div>
          ) : (
            <div className="space-y-3">
              {recentPredictions.map((pred) => {
                const match = pred.matchId as unknown as IMatch;
                return (
                  <div key={pred._id.toString()} className="card p-4">
                    <div className="text-xs text-gray-500 mb-1">
                      {match?.homeTeam} vs {match?.awayTeam}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        Your pick: {pred.predictedHome}–{pred.predictedAway}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          pred.pointsEarned === 5
                            ? 'text-gold'
                            : pred.pointsEarned && pred.pointsEarned > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {pred.pointsEarned !== null ? `+${pred.pointsEarned} pts` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick stats */}
          <div className="mt-6 card p-4">
            <h3 className="font-semibold mb-3 text-sm text-gray-400">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/leaderboard" className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors py-1">
                🏆 Leaderboard
              </Link>
              <Link href="/matches" className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors py-1">
                ⚽ All Matches
              </Link>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors py-1">
                👤 My Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

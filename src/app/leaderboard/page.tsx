import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import LeaderboardTable from '@/components/LeaderboardTable';
import { ILeaderboardEntry } from '@/types';

async function getLeaderboard(): Promise<ILeaderboardEntry[]> {
  await dbConnect();
  const users = await User.find({ points: { $gt: 0 } })
    .sort({ points: -1 })
    .limit(100)
    .lean();

  return users.map((u, i) => ({
    discordId: u.discordId,
    username: u.username,
    avatar: u.avatar,
    points: u.points,
    rank: i + 1,
  }));
}

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session || !session.user?.discordId) redirect('/');
  if (!session.user.guildVerified) redirect('/not-authorized');

  const entries = await getLeaderboard();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2">
          🏆 <span className="gradient-text">Leaderboard</span>
        </h1>
        <p className="text-gray-400">Top predictors in the Injective community</p>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd place */}
          <div className="card p-4 text-center flex flex-col items-center justify-end pt-8">
            <img
              src={entries[1].avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
              alt={entries[1].username}
              className="w-12 h-12 rounded-full border-2 border-gray-400 mb-2"
            />
            <div className="text-2xl font-black text-gray-300">🥈</div>
            <div className="font-semibold text-sm truncate w-full text-center">{entries[1].username}</div>
            <div className="text-gold font-bold">{entries[1].points} pts</div>
          </div>

          {/* 1st place */}
          <div className="card p-4 text-center flex flex-col items-center -mt-4 border-gold/30">
            <div className="text-4xl mb-1">👑</div>
            <img
              src={entries[0].avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
              alt={entries[0].username}
              className="w-16 h-16 rounded-full border-2 border-gold mb-2"
            />
            <div className="font-semibold truncate w-full text-center">{entries[0].username}</div>
            <div className="text-gold font-black text-lg">{entries[0].points} pts</div>
          </div>

          {/* 3rd place */}
          <div className="card p-4 text-center flex flex-col items-center justify-end pt-8">
            <img
              src={entries[2].avatar || `https://cdn.discordapp.com/embed/avatars/0.png`}
              alt={entries[2].username}
              className="w-12 h-12 rounded-full border-2 border-amber-600 mb-2"
            />
            <div className="text-2xl font-black text-amber-600">🥉</div>
            <div className="font-semibold text-sm truncate w-full text-center">{entries[2].username}</div>
            <div className="text-gold font-bold">{entries[2].points} pts</div>
          </div>
        </div>
      )}

      <LeaderboardTable entries={entries} currentDiscordId={session.user.discordId} />

      {entries.length === 0 && (
        <div className="card p-12 text-center text-gray-500">
          <div className="text-5xl mb-4">📊</div>
          <p>No rankings yet. Start predicting matches to earn points!</p>
        </div>
      )}
    </div>
  );
}

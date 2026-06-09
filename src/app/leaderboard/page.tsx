import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import LeaderboardTable from '@/components/LeaderboardTable';
import { ILeaderboardEntry } from '@/types';
import Image from 'next/image';

async function getLeaderboard(): Promise<ILeaderboardEntry[]> {
  await dbConnect();
  const users = await User.find({ points: { $gt: 0 } }).sort({ points: -1 }).limit(100).lean();
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

  const entries = await getLeaderboard();

  return (
    <div className="max-w-3xl mx-auto px-3 py-6">
      <div className="sb-section-header rounded-sm mb-4">🏆 Leaderboard · WC2026 Predictor</div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="sb-card mb-4 p-4">
          <div className="flex items-end justify-center gap-3">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-1 pb-0">
              <Image src={entries[1].avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={entries[1].username} width={44} height={44} className="rounded-full border-2 border-gray-400" />
              <span className="text-xs font-bold text-gray-300 truncate max-w-[70px] text-center">{entries[1].username}</span>
              <span className="text-sb-yellow font-black text-sm">{entries[1].points} pts</span>
              <div className="w-16 h-10 bg-gray-500/20 border border-gray-500/30 flex items-center justify-center rounded-sm">
                <span className="text-gray-300 font-black text-lg">2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-1 -mb-px">
              <span className="text-2xl">👑</span>
              <Image src={entries[0].avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={entries[0].username} width={56} height={56} className="rounded-full border-2 border-sb-yellow" />
              <span className="text-xs font-bold text-white truncate max-w-[80px] text-center">{entries[0].username}</span>
              <span className="text-sb-yellow font-black">{entries[0].points} pts</span>
              <div className="w-16 h-16 bg-sb-yellow/20 border border-sb-yellow/40 flex items-center justify-center rounded-sm">
                <span className="text-sb-yellow font-black text-2xl">1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-1 pb-0">
              <Image src={entries[2].avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt={entries[2].username} width={40} height={40} className="rounded-full border-2 border-amber-600" />
              <span className="text-xs font-bold text-amber-500 truncate max-w-[70px] text-center">{entries[2].username}</span>
              <span className="text-sb-yellow font-black text-sm">{entries[2].points} pts</span>
              <div className="w-16 h-8 bg-amber-600/20 border border-amber-600/30 flex items-center justify-center rounded-sm">
                <span className="text-amber-500 font-black text-lg">3</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <LeaderboardTable entries={entries} currentDiscordId={session.user?.discordId} />
    </div>
  );
}

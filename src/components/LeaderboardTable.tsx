import Image from 'next/image';
import { ILeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  entries: ILeaderboardEntry[];
  currentDiscordId?: string;
}

const MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export default function LeaderboardTable({
  entries,
  currentDiscordId,
}: LeaderboardTableProps) {
  if (entries.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3 w-12">Rank</th>
              <th className="text-left px-4 py-3">Player</th>
              <th className="text-right px-4 py-3">Points</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isCurrentUser = entry.discordId === currentDiscordId;
              return (
                <tr
                  key={entry.discordId}
                  className={`border-b border-dark-border/50 transition-colors ${
                    isCurrentUser
                      ? 'bg-primary/10 border-primary/20'
                      : 'hover:bg-white/2'
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    {MEDAL[entry.rank] ? (
                      <span className="text-lg">{MEDAL[entry.rank]}</span>
                    ) : (
                      <span className="text-gray-500 text-sm font-mono">
                        #{entry.rank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={entry.avatar || `https://cdn.discordapp.com/embed/avatars/${entry.rank % 6}.png`}
                        alt={entry.username}
                        width={32}
                        height={32}
                        className="rounded-full border border-dark-border flex-shrink-0"
                      />
                      <span className={`font-medium text-sm ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                        {entry.username}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-primary/70">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-black text-lg ${
                        entry.rank === 1
                          ? 'text-gold'
                          : entry.rank === 2
                          ? 'text-gray-300'
                          : entry.rank === 3
                          ? 'text-amber-600'
                          : 'text-white'
                      }`}
                    >
                      {entry.points}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">pts</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Image from 'next/image';
import { ILeaderboardEntry } from '@/types';

interface LeaderboardTableProps {
  entries: ILeaderboardEntry[];
  currentDiscordId?: string;
}

const RANK_STYLE: Record<number, string> = {
  1: 'text-sb-yellow',
  2: 'text-gray-300',
  3: 'text-amber-500',
};

export default function LeaderboardTable({ entries, currentDiscordId }: LeaderboardTableProps) {
  if (entries.length === 0) return (
    <div className="sb-card p-10 text-center text-sb-muted text-sm">No rankings yet — start predicting!</div>
  );

  return (
    <div className="sb-card overflow-hidden">
      <div className="sb-section-header">
        <span>🏆</span> Rankings
        <span className="ml-auto text-sb-muted text-[10px] font-normal normal-case tracking-normal">{entries.length} players</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-sb-border text-[10px] text-sb-muted uppercase tracking-widest">
            <th className="text-center px-3 py-2 w-10">#</th>
            <th className="text-left px-3 py-2">Player</th>
            <th className="text-right px-4 py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isMe = entry.discordId === currentDiscordId;
            return (
              <tr
                key={entry.discordId}
                className={`border-b border-sb-border/50 transition-colors ${
                  isMe ? 'bg-sb-yellow/5 border-l-2 border-l-sb-yellow' : 'hover:bg-sb-card-2'
                }`}
              >
                <td className="px-3 py-2.5 text-center">
                  {entry.rank <= 3 ? (
                    <span className={`text-base font-black ${RANK_STYLE[entry.rank]}`}>
                      {entry.rank === 1 ? '1ST' : entry.rank === 2 ? '2ND' : '3RD'}
                    </span>
                  ) : (
                    <span className="text-sb-muted text-xs font-mono">{entry.rank}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Image
                      src={entry.avatar || `https://cdn.discordapp.com/embed/avatars/${entry.rank % 6}.png`}
                      alt={entry.username}
                      width={26}
                      height={26}
                      className="rounded-full border border-sb-border shrink-0"
                    />
                    <span className={`text-sm font-semibold ${isMe ? 'text-sb-yellow' : 'text-white'}`}>
                      {entry.username}
                      {isMe && <span className="ml-1.5 text-[10px] text-sb-yellow/60 font-normal">(you)</span>}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`font-black text-base ${RANK_STYLE[entry.rank] ?? 'text-white'}`}>
                    {entry.points}
                  </span>
                  <span className="text-[10px] text-sb-muted ml-1">pts</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

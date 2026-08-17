import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Flame, Award, Zap, ShieldCheck } from 'lucide-react';

export const LeaderboardTable: React.FC = () => {
  const { activeRoom } = useApp();

  if (!activeRoom) return null;

  // Sort members by Points descending, then Streak descending
  const sortedMembers = [...activeRoom.members].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.streak - a.streak;
  });

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />;
      case 1:
        return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />;
      case 2:
        return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />;
      default:
        return <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="glass-panel bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <h3 className="font-bold text-base sm:text-lg text-white">Room Leaderboard</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{activeRoom.members.length} Members</span>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left border-collapse min-w-[540px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 sm:py-3 px-2 sm:px-3">Rank</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3">Member</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">Handle</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">Streak</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">Solved</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedMembers.map((member, idx) => (
              <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-2 sm:px-3">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7">{getRankBadge(idx)}</div>
                </td>

                <td className="py-3 px-2 sm:px-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <img src={member.avatar} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-[180px]">{member.name}</span>
                        {member.role === 'Admin' && (
                          <span className="bg-purple-500/20 text-purple-300 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold border border-purple-500/30 shrink-0">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">Joined {member.joinedAt}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-2 sm:px-3 text-center">
                  {member.username ? (
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-cyan-500/20">
                      <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                      @{member.username}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">Unlinked</span>
                  )}
                </td>

                <td className="py-3 px-2 sm:px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-orange-400 bg-orange-950/30 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-orange-500/30">
                    <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-400 text-orange-400 shrink-0" />
                    {member.streak}d
                  </span>
                </td>

                <td className="py-3 px-2 sm:px-3 text-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                    {member.solvedCount}
                  </span>
                </td>

                <td className="py-3 px-2 sm:px-3 text-right">
                  <span className="text-xs sm:text-sm font-extrabold text-amber-400">{member.points} pts</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

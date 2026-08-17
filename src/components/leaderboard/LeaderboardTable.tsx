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
        return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[#eab308]" />;
      case 1:
        return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />;
      case 2:
        return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />;
      default:
        return <span className="font-mono text-xs font-bold text-slate-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="bg-[#1c2024] rounded-2xl border border-[#3d4a3e] overflow-hidden flex flex-col shadow-lg relative z-10">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#3d4a3e] flex justify-between items-center bg-[#31353a]/50">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-[#eab308]" />
          <h2 className="text-lg sm:text-xl font-bold text-white m-0 leading-none font-sans">Room Leaderboard</h2>
        </div>
        <span className="text-xs sm:text-sm text-slate-400 font-mono">{activeRoom.members.length} Members</span>
      </div>

      {sortedMembers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center bg-[#1c2024]/50">
          No members have joined yet. Invite some friends to start competing!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-b border-[#3d4a3e] bg-[#101418]/50 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">RANK</th>
                <th className="py-3 px-4 sm:px-6">MEMBER</th>
                <th className="py-3 px-3 text-center">HANDLE</th>
                <th className="py-3 px-3 text-center">STREAK</th>
                <th className="py-3 px-3 text-center">SOLVED</th>
                <th className="py-3 px-4 sm:px-6 text-right">POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d4a3e]/60">
              {sortedMembers.map((member, idx) => (
                <tr key={member.id} className="hover:bg-[#31353a]/40 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center justify-center w-7 h-7">{getRankBadge(idx)}</div>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt="" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#3d4a3e] shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[130px] sm:max-w-[180px]">{member.name}</span>
                          {member.role === 'Admin' && (
                            <span className="bg-purple-500/20 text-purple-300 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold border border-purple-500/30 shrink-0">
                              HOST
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Joined {member.joinedAt}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {member.username ? (
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-mono text-cyan-400 bg-[#101418] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#3d4a3e]">
                        <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                        @{member.username}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Unlinked</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#ea580c] bg-[#ea580c]/10 px-2.5 py-1 rounded-full border border-[#ea580c]/30 font-mono">
                      <Flame className="w-3.5 h-3.5 fill-[#ea580c] text-[#ea580c] shrink-0" />
                      {member.streak}d
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="text-xs font-bold text-[#4ade80] flex items-center justify-center gap-1 font-mono">
                      <Zap className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                      {member.solvedCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <span className="text-xs sm:text-sm font-extrabold text-[#eab308] font-sans">{member.points} pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InviteModal } from '../room/InviteModal';
import { Trophy, Flame, Zap, ShieldCheck, UserPlus, Users, UserX } from 'lucide-react';
import { Button } from '../ui/Button';

export const LeaderboardTable: React.FC = () => {
  const { activeRoom, currentUser, removeMember, isHost } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  if (!activeRoom) return null;

  // Sort members by Points descending, then Streak descending
  const sortedMembers = [...activeRoom.members].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.streak - a.streak;
  });

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-base" title="1st Place">🥇</span>;
      case 1:
        return <span className="text-base" title="2nd Place">🥈</span>;
      case 2:
        return <span className="text-base" title="3rd Place">🥉</span>;
      default:
        return <span className="font-mono text-xs font-bold text-slate-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="bg-[#1c2024] rounded-2xl border border-[#3d4a3e] overflow-hidden flex flex-col shadow-lg relative z-10">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-[#3d4a3e] flex justify-between items-center bg-[#101418]/60">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-[#eab308]" />
          <h3 className="text-base sm:text-lg font-bold text-white font-sans m-0 leading-none">
            Room Leaderboard
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {activeRoom.members.length} {activeRoom.members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {sortedMembers.length === 0 ? (
        <div className="p-10 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 bg-[#1c2024]">
          <div className="w-12 h-12 rounded-xl bg-[#eab308]/10 text-[#eab308] flex items-center justify-center border border-[#eab308]/20">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">No members yet</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Invite teammates to start competing, tracking daily problems, and climbing the room leaderboard.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setIsInviteOpen(true)}
          >
            Invite Members
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-b border-[#3d4a3e] bg-[#101418]/40 text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5 w-16 text-center">RANK</th>
                <th className="py-3 px-3 sm:px-4">MEMBER</th>
                <th className="py-3 px-3 text-center">HANDLE</th>
                <th className="py-3 px-3 text-center">STREAK</th>
                <th className="py-3 px-3 text-center">SOLVED</th>
                <th className="py-3 px-4 sm:px-5 text-right">POINTS</th>
                {isHost && <th className="py-3 px-3 text-center w-12">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3d4a3e]/50 font-sans">
              {sortedMembers.map((member, idx) => {
                const isCurrent = member.id === currentUser.id;
                const memberIsHost = member.id === activeRoom.creatorId || member.role === 'Admin';

                return (
                  <tr
                    key={member.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-[#4ade80]/5 hover:bg-[#4ade80]/10' : 'hover:bg-[#262a2f]/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 sm:px-5 text-center">
                      <div className="flex items-center justify-center">{getRankBadge(idx)}</div>
                    </td>

                    {/* Member Details */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-[#3d4a3e] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[130px] sm:max-w-[180px]">
                              {member.name === 'LeetCode Engineer' || !member.name ? (isCurrent ? 'You' : 'Member') : member.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-[#4ade80] font-mono font-bold">(You)</span>
                            )}
                            {memberIsHost && (
                              <span className="bg-purple-500/20 text-purple-300 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold border border-purple-500/30 shrink-0 font-mono">
                                HOST
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Joined {member.joinedAt}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* LeetCode Handle */}
                    <td className="py-3 px-3 text-center">
                      {member.username ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-[#101418] px-2 py-0.5 rounded-md border border-[#3d4a3e]">
                          <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                          @{member.username}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Unlinked</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ea580c] bg-[#ea580c]/10 px-2.5 py-1 rounded-full border border-[#ea580c]/30 font-mono">
                        <Flame className="w-3.5 h-3.5 fill-[#ea580c] text-[#ea580c] shrink-0" />
                        {member.streak}d
                      </span>
                    </td>

                    {/* Problems Solved in Room */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-bold text-[#4ade80] flex items-center justify-center gap-1 font-mono" title={member.leetcodeTotalSolved ? `Room Solves (LeetCode Total: ${member.leetcodeTotalSolved})` : 'Room Solves'}>
                        <Zap className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                        {member.roomSolvedCount ?? member.solvedCount ?? 0}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 sm:px-5 text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-[#eab308] font-sans">
                        {member.points} pts
                      </span>
                    </td>

                    {/* Action Column for Host */}
                    {isHost && (
                      <td className="py-3 px-3 text-center">
                        {!isCurrent && (
                          <button
                            onClick={() => removeMember(activeRoom.id, member.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                            title={`Remove ${member.name} from room`}
                            aria-label={`Remove ${member.name}`}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal room={activeRoom} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
};

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
        return <span className="text-sm font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">#1</span>;
      case 1:
        return <span className="text-sm font-bold text-slate-300 bg-slate-300/10 px-2 py-0.5 rounded border border-slate-300/20 font-mono">#2</span>;
      case 2:
        return <span className="text-sm font-bold text-amber-700 bg-amber-700/10 px-2 py-0.5 rounded border border-amber-700/20 font-mono">#3</span>;
      default:
        return <span className="font-mono text-xs font-semibold text-slate-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden flex flex-col shadow-lg relative z-10">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-[#d29922]" />
          <h3 className="text-base sm:text-lg font-bold text-white font-sans m-0 leading-none">
            Room Leaderboard
          </h3>
        </div>
        <span className="text-xs font-sans text-slate-400">
          {activeRoom.members.length} {activeRoom.members.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {sortedMembers.length === 0 ? (
        <div className="p-10 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 bg-[#161b22]">
          <div className="w-12 h-12 rounded-xl bg-[#d29922]/10 text-[#d29922] flex items-center justify-center border border-[#d29922]/20">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white font-sans">No members yet</h4>
          <p className="text-xs text-slate-400 max-w-sm font-sans">
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
              <tr className="border-b border-[#30363d] bg-[#0d1117] text-xs font-medium text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-5 w-16 text-center">RANK</th>
                <th className="py-3 px-3 sm:px-4">MEMBER</th>
                <th className="py-3 px-3 text-center">HANDLE</th>
                <th className="py-3 px-3 text-center">STREAK</th>
                <th className="py-3 px-3 text-center">SOLVED</th>
                <th className="py-3 px-4 sm:px-5 text-right">POINTS</th>
                {isHost && <th className="py-3 px-3 text-center w-12">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60 font-sans">
              {sortedMembers.map((member, idx) => {
                const isCurrent = member.id === currentUser.id;
                const memberIsHost = member.id === activeRoom.creatorId || member.role === 'Admin';

                return (
                  <tr
                    key={member.id}
                    className={`transition-colors ${
                      isCurrent ? 'bg-[#2ea043]/5 hover:bg-[#2ea043]/10' : 'hover:bg-[#21262d]/40'
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
                          className="w-8 h-8 rounded-full object-cover border border-[#30363d] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-sans">
                            <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[130px] sm:max-w-[180px]">
                              {member.name === 'LeetCode Engineer' || !member.name ? (isCurrent ? 'You' : 'Member') : member.name}
                            </span>
                            {isCurrent && (
                              <span className="text-xs text-[#3fb950] font-semibold">(You)</span>
                            )}
                            {memberIsHost && (
                              <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.2 rounded font-bold border border-purple-500/30 shrink-0 font-mono">
                                HOST
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-sans">
                            Joined {member.joinedAt}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* LeetCode Handle */}
                    <td className="py-3 px-3 text-center">
                      {member.username ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 bg-[#0d1117] px-2 py-0.5 rounded-md border border-[#30363d]">
                          <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                          @{member.username}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Unlinked</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f0883e] bg-[#f0883e]/10 px-2.5 py-0.5 rounded-full border border-[#f0883e]/30 font-mono">
                        <Flame className="w-3.5 h-3.5 fill-[#f0883e] text-[#f0883e] shrink-0" />
                        {member.streak}d
                      </span>
                    </td>

                    {/* Problems Solved in Room */}
                    <td className="py-3 px-3 text-center">
                      <span className="text-xs font-bold text-[#3fb950] flex items-center justify-center gap-1 font-mono" title={member.leetcodeTotalSolved ? `Room Solves (LeetCode Total: ${member.leetcodeTotalSolved})` : 'Room Solves'}>
                        <Zap className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                        {member.roomSolvedCount ?? member.solvedCount ?? 0}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 sm:px-5 text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-[#d29922] font-sans">
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
                            <UserX className="w-3.5 h-3.5" />
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
      <InviteModal
        room={activeRoom}
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};

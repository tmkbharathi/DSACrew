import React, { useState } from 'react';
import { useApp, isUserHostOfRoom } from '../../context/AppContext';
import { InviteModal } from '../room/InviteModal';
import { Trophy, Flame, Zap, ShieldCheck, UserPlus, Users, UserX, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

export const LeaderboardTable: React.FC = () => {
  const { activeRoom, currentUser, removeMember, isHost, theme } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const isIllustrative = theme === 'illustrative';

  if (!activeRoom) return null;

  // Deduplicate members list to ensure no duplicate handles/IDs
  const memberMap = new Map<string, typeof activeRoom.members[0]>();
  activeRoom.members.forEach((m) => {
    const key = (m.username || m.name || m.id).toLowerCase();
    if (m.id === currentUser.id) {
      memberMap.set(key, { ...m, ...currentUser });
    } else if (!memberMap.has(key)) {
      memberMap.set(key, m);
    }
  });
  const uniqueMembers = Array.from(memberMap.values());

  // Sort members by Points descending, then Streak descending
  const sortedMembers = uniqueMembers.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.streak - a.streak;
  });

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${
            isIllustrative
              ? 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]'
              : 'text-amber-400 bg-amber-400/15 border-amber-400/30'
          }`}>
            #1
          </span>
        );
      case 1:
        return (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${
            isIllustrative
              ? 'bg-slate-100 text-slate-700 border-slate-200'
              : 'text-slate-200 bg-slate-400/15 border-slate-400/30'
          }`}>
            #2
          </span>
        );
      case 2:
        return (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${
            isIllustrative
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'text-amber-600 bg-amber-700/15 border-amber-700/30'
          }`}>
            #3
          </span>
        );
      default:
        return <span className={`font-mono text-xs font-semibold ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>#{index + 1}</span>;
    }
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden flex flex-col shadow-md relative z-10 ${
        isIllustrative
          ? 'bg-white border-[#ede4d4]'
          : 'bg-[#161b22] border-[#30363d]'
      }`}
    >
      {/* Table Header */}
      <div
        className={`p-4 sm:p-5 border-b flex justify-between items-center ${
          isIllustrative
            ? 'bg-[#fbf7ee] border-[#ede4d4]'
            : 'bg-[#0d1117] border-[#30363d]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-[#d97706]" />
          <h3 className={`text-base sm:text-lg font-bold font-sans m-0 leading-none ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
            Room Leaderboard
          </h3>
        </div>
        <span
          className={`text-xs font-sans font-medium px-2.5 py-1 rounded-xl border ${
            isIllustrative
              ? 'bg-white text-[#5c6b63] border-[#ede4d4]'
              : 'bg-[#161b22] text-slate-300 border-[#30363d]'
          }`}
        >
          {sortedMembers.length} {sortedMembers.length === 1 ? 'Member' : 'Members'}
        </span>
      </div>

      {sortedMembers.length === 0 ? (
        <div className={`p-10 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 ${isIllustrative ? 'bg-white' : 'bg-[#161b22]'}`}>
          <div className="w-12 h-12 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center border border-[#fde68a]">
            <Users className="w-6 h-6" />
          </div>
          <h4 className={`text-sm font-bold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>No members yet</h4>
          <p className={`text-xs max-w-sm font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
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
              <tr
                className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isIllustrative
                    ? 'bg-[#f7f3eb] text-[#5c6b63] border-[#ede4d4]'
                    : 'bg-[#161b22] text-slate-200 border-[#30363d]'
                }`}
              >
                <th className="py-3 px-4 sm:px-5 w-16 text-center">RANK</th>
                <th className="py-3 px-3 sm:px-4">MEMBER</th>
                <th className="py-3 px-3 text-center">HANDLE</th>
                <th className="py-3 px-3 text-center">STREAK</th>
                <th className="py-3 px-3 text-center">ROOM SOLVES</th>
                <th className="py-3 px-4 sm:px-5 text-right">POINTS</th>
                {isHost && <th className="py-3 px-3 text-center w-12">ACTION</th>}
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${isIllustrative ? 'divide-[#ede4d4]' : 'divide-[#30363d]/60'}`}>
              {sortedMembers.map((member, idx) => {
                const isCurrent = member.id === currentUser.id || (currentUser.username && member.username?.toLowerCase() === currentUser.username?.toLowerCase());
                const memberIsHost = isUserHostOfRoom(activeRoom, member);

                return (
                  <tr
                    key={member.id}
                    className={`transition-colors ${
                      isCurrent
                        ? isIllustrative
                          ? 'bg-[#f0fdf4] hover:bg-[#dcfce7]'
                          : 'bg-[#2ea043]/5 hover:bg-[#2ea043]/10'
                        : isIllustrative
                        ? 'hover:bg-[#fbf7ee]'
                        : 'hover:bg-[#21262d]/40'
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
                          className={`w-8 h-8 rounded-full object-cover border shrink-0 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-sans">
                            <span className={`text-xs sm:text-sm font-semibold truncate max-w-[130px] sm:max-w-[180px] ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                              {isCurrent ? `${currentUser.name} (You)` : member.name}
                            </span>
                            {memberIsHost && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border shrink-0 font-mono ${
                                isIllustrative ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              }`}>
                                HOST
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-sans ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                            Joined {member.joinedAt}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* LeetCode Handle with Direct Profile Link */}
                    <td className="py-3 px-3 text-center">
                      {member.username ? (
                        <a
                          href={`https://leetcode.com/${member.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-xl border transition-all shadow-sm group ${
                            isIllustrative
                              ? 'bg-[#fbf7ee] text-[#2d6a4f] hover:bg-white border-[#ede4d4] hover:text-[#1b4332]'
                              : 'text-cyan-400 hover:text-cyan-300 hover:underline bg-[#0d1117] hover:bg-[#21262d] border-[#30363d]'
                          }`}
                          title={`Open @${member.username} on LeetCode.com`}
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-cyan-400'}`} />
                          <span>@{member.username}</span>
                          <ExternalLink className={`w-3 h-3 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                        </a>
                      ) : (
                        <span className={`text-xs font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>Unlinked</span>
                      )}
                    </td>

                    {/* Streak */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                        isIllustrative
                          ? 'text-[#ea580c] bg-[#ffedd5] border-[#fed7aa]'
                          : 'text-[#f0883e] bg-[#f0883e]/10 border-[#f0883e]/30'
                      }`}>
                        <Flame className="w-3.5 h-3.5 fill-[#ea580c] text-[#ea580c] shrink-0" />
                        {member.streak}d
                      </span>
                    </td>

                    {/* Problems Solved in Room */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-xs font-bold flex items-center justify-center gap-1 font-mono ${
                          isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'
                        }`}>
                          <Zap className="w-3.5 h-3.5 shrink-0" />
                          {member.roomSolvedCount ?? 0} AC
                        </span>
                        {member.leetcodeTotalSolved ? (
                          <span className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                            {member.leetcodeTotalSolved} LC
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 sm:px-5 text-right">
                      <span className={`text-xs sm:text-sm font-extrabold font-sans ${
                        isIllustrative ? 'text-[#d97706]' : 'text-[#d29922]'
                      }`}>
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

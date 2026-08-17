import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InviteModal } from '../room/InviteModal';
import {
  LayoutDashboard,
  Flame,
  Trophy,
  History,
  MessageSquare,
  Users,
  UserPlus,
  Target,
  Trash2,
  AlertTriangle,
  UserX,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { activeRoom, currentUser, isAdmin, deleteRoom, removeMember } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDesktopMembersOpen, setIsDesktopMembersOpen] = useState(true);

  if (!activeRoom) return null;

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Workspace', fullLabel: 'Daily Workspace', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard', fullLabel: 'Leaderboard & Analytics', icon: Trophy },
    { id: 'history', label: 'History', fullLabel: 'Problem History', icon: History },
    { id: 'discussion', label: 'Discussions', fullLabel: 'Room Discussions', icon: MessageSquare },
  ];

  const handleDeleteRoom = () => {
    deleteRoom(activeRoom.id);
    setShowDeleteConfirm(false);
  };

  // Determine member's daily problem status
  const activeProblem = activeRoom.dailyProblems.find((p) => p.id === activeRoom.activeProblemId) || activeRoom.dailyProblems[0];

  const getMemberStatus = (memberId: string) => {
    if (!activeProblem) return { label: 'Not started', color: 'text-slate-500', dot: 'bg-slate-600' };
    const solved = activeProblem.submissions.some((s) => s.userId === memberId);
    if (solved) return { label: 'Solved', color: 'text-[#4ade80]', dot: 'bg-[#4ade80]' };
    if (memberId === currentUser.id) return { label: 'Working', color: 'text-amber-400', dot: 'bg-amber-400 animate-pulse' };
    return { label: 'Not started', color: 'text-slate-500', dot: 'bg-slate-600' };
  };

  const sidebarContent = (
    <div className="flex flex-col h-full gap-5 p-4 sm:p-5 overflow-y-auto">
      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5 px-2">
          WORKSPACE
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onMobileClose) onMobileClose();
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#4ade80]/15 text-[#4ade80] font-bold border border-[#4ade80]/30 shadow-sm'
                  : 'text-slate-300 hover:bg-[#262a2f] hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4ade80]' : 'text-slate-400'}`} />
              <span className="truncate">{item.fullLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Room Summary Context Card */}
      <div className="bg-[#101418] rounded-xl p-3.5 border border-[#3d4a3e] space-y-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">CURRENT ROOM</div>
            <h3 className="text-xs sm:text-sm font-bold text-white leading-tight truncate mt-0.5">{activeRoom.name}</h3>
          </div>
          <span className="text-[10px] font-mono bg-[#1c2024] px-2 py-0.5 rounded text-[#4ade80] border border-[#3d4a3e] shrink-0">
            {activeRoom.code}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#3d4a3e]/60 font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Target className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Daily Goal</span>
          </div>
          <span className="text-[#4ade80] font-bold">{activeRoom.targetDailyGoal} Prob / day</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex-1 bg-[#1c2024] hover:bg-[#262a2f] text-slate-200 border border-[#3d4a3e] rounded-lg py-1.5 flex justify-center items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <UserPlus className="w-3 h-3 text-[#4ade80]" />
            <span>Invite</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg border border-rose-500/20 transition-colors flex items-center justify-center shrink-0"
              title="Delete Active Room (Admin)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Collaborative Members Section */}
      <div className="flex flex-col flex-1 min-h-0 space-y-2 mt-1">
        <button
          onClick={() => setIsDesktopMembersOpen(!isDesktopMembersOpen)}
          className="flex items-center justify-between px-2 py-1 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>MEMBERS ({activeRoom.members.length})</span>
          </div>
          {isDesktopMembersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isDesktopMembersOpen && (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 bg-[#101418] p-2.5 rounded-xl border border-[#3d4a3e]">
            {activeRoom.members.map((member) => {
              const status = getMemberStatus(member.id);
              const isCurrent = member.id === currentUser.id;

              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                    isCurrent ? 'bg-[#1c2024] border border-[#3d4a3e]' : 'hover:bg-[#1c2024]/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#3d4a3e]" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-[#101418] ${status.dot}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                        <span className="truncate">
                          {member.name === 'LeetCode Engineer' || !member.name ? (isCurrent ? 'You' : 'Member') : member.name}
                        </span>
                        {isCurrent && <span className="text-[9px] text-[#4ade80] font-mono font-bold">(You)</span>}
                        {(member.id === activeRoom.creatorId || member.role === 'Admin') && (
                          <span className="bg-purple-500/20 text-purple-300 text-[8px] px-1 py-0.2 rounded font-bold border border-purple-500/30 font-mono">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] font-mono leading-tight ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Flame className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" />
                    <span className="text-[11px] font-bold text-[#ea580c] font-mono">{member.streak}d</span>

                    {(activeRoom.creatorId === currentUser.id || currentUser.role === 'Admin' || isAdmin) && member.id !== currentUser.id && (
                      <button
                        onClick={() => removeMember(activeRoom.id, member.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors ml-0.5"
                        title={`Remove ${member.name} from room`}
                        aria-label={`Remove ${member.name}`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Tabs Strip (< md) */}
      <div className="md:hidden w-full shrink-0 px-3 pt-3 pb-1 bg-[#101418] border-b border-[#3d4a3e]">
        <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-1 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 min-w-[75px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4ade80]' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Persistent Sidebar (>= md) */}
      <aside className="hidden md:flex w-64 bg-[#1c2024] border-r border-[#3d4a3e] flex-col overflow-hidden shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative w-4/5 max-w-xs bg-[#1c2024] border-r border-[#3d4a3e] h-full flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#3d4a3e]">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">WORKSPACE MENU</span>
              <button onClick={onMobileClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* Delete Room Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-white">Delete Active Room</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to delete <span className="text-rose-400 font-bold">"{activeRoom.name}"</span>? As Admin, this action will permanently remove the room for all members.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-[#31353a]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-5 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white rounded-lg shadow-lg shadow-rose-500/20"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal room={activeRoom} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
};

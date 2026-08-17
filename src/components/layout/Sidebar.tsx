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
import { Button } from '../ui/Button';

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
  const { activeRoom, currentUser, isHost, deleteRoom, removeMember } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDesktopMembersOpen, setIsDesktopMembersOpen] = useState(true);

  if (!activeRoom) return null;

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'history', label: 'Problem History', icon: History },
    { id: 'discussion', label: 'Discussions', icon: MessageSquare },
  ];

  const handleDeleteRoom = () => {
    deleteRoom(activeRoom.id);
    setShowDeleteConfirm(false);
  };

  const getMemberStatus = (memberId: string) => {
    const todayProblem = activeRoom.dailyProblems.find(
      (p) => p.date === new Date().toISOString().split('T')[0]
    );

    if (todayProblem) {
      const isSolved = todayProblem.submissions.some((s) => s.userId === memberId);
      if (isSolved) {
        return { label: 'Solved Today', color: 'text-[#3fb950] bg-[#2ea043]/15 border-[#2ea043]/30' };
      }
    }
    return { label: 'Not started', color: 'text-slate-400 bg-[#21262d] border-[#30363d]' };
  };

  const sidebarContent = (
    <div className="flex flex-col h-full p-3.5 space-y-4 font-sans text-xs bg-[#161b22]">
      {/* Active Room Metadata Card */}
      <div className="bg-[#0d1117] rounded-xl p-3.5 border border-[#30363d] space-y-2.5 shadow-sm">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              CURRENT ROOM
            </span>
            <h2 className="font-bold text-sm text-white truncate font-sans mt-0.5">
              {activeRoom.name}
            </h2>
          </div>
          <span className="bg-[#21262d] text-slate-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-[#30363d] shrink-0">
            {activeRoom.code}
          </span>
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-[#30363d]">
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-[#3fb950]" />
            Daily Goal
          </span>
          <span className="font-semibold text-slate-200">{activeRoom.targetDailyGoal || 1} Prob / day</span>
        </div>

        <div className="flex gap-1.5 pt-0.5">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex-1 bg-[#161b22] hover:bg-[#21262d] text-slate-200 border border-[#30363d] rounded-lg py-1.5 flex justify-center items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>Invite</span>
          </button>

          {isHost && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg border border-rose-500/20 transition-colors flex items-center justify-center shrink-0"
              title="Delete Active Room (Host)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#2ea043]/15 text-[#3fb950] font-semibold border border-[#2ea043]/30'
                  : 'text-slate-300 hover:bg-[#21262d] hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#3fb950]' : 'text-slate-400'}`} />
              <span className="flex-1 font-sans">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Collaborative Members Section */}
      <div className="flex flex-col flex-1 min-h-0 space-y-2 mt-1">
        <button
          onClick={() => setIsDesktopMembersOpen(!isDesktopMembersOpen)}
          className="flex items-center justify-between px-2 py-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#3fb950]" />
            <span className="font-semibold">MEMBERS ({activeRoom.members.length})</span>
          </div>
          {isDesktopMembersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        {isDesktopMembersOpen && (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {activeRoom.members.map((member) => {
              const status = getMemberStatus(member.id);
              const isCurrent = member.id === currentUser.id;
              const memberIsHost = member.id === activeRoom.creatorId || member.role === 'Admin';

              return (
                <div
                  key={member.id}
                  className={`p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-[#2ea043]/5 border-[#2ea043]/20 text-white'
                      : 'bg-[#0d1117] border-[#30363d] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={member.avatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border border-[#30363d] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-sans">
                        <span className="text-xs font-semibold text-white truncate max-w-[85px]">
                          {isCurrent ? 'You' : member.name}
                        </span>
                        {memberIsHost && (
                          <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded border border-purple-500/30 font-mono">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className={`text-[10px] px-1.5 py-0.2 rounded inline-block font-sans border ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Flame className="w-3 h-3 text-[#f0883e] fill-[#f0883e]" />
                    <span className="text-[11px] font-bold text-[#f0883e] font-mono">{member.streak}d</span>

                    {isHost && member.id !== currentUser.id && (
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
      {/* Desktop Persistent Sidebar (>= md) */}
      <aside className="hidden md:flex w-64 bg-[#161b22] border-r border-[#30363d] flex-col overflow-hidden shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative w-4/5 max-w-xs bg-[#161b22] border-r border-[#30363d] h-full flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
              <span className="text-xs font-semibold text-slate-300 font-sans">WORKSPACE MENU</span>
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
          <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg text-white font-sans">Delete Active Room</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you sure you want to delete <span className="text-rose-400 font-bold">"{activeRoom.name}"</span>? As Room Host, this action will permanently remove the room for all members.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteRoom}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-sm"
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

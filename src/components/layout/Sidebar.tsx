import React, { useState } from 'react';
import { useApp, isUserHostOfRoom } from '../../context/AppContext';
import { InviteModal } from '../room/InviteModal';
import {
  LayoutDashboard,
  Flame,
  Trophy,
  History,
  MessageSquare,
  UserPlus,
  Trash2,
  UserX,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  Info,
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
  const { activeRoom, currentUser, isHost, deleteRoom, removeMember, setToast, setIsLandingView, theme } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDesktopMembersOpen, setIsDesktopMembersOpen] = useState(true);

  const isIllustrative = theme === 'illustrative';

  if (!activeRoom) return null;

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'history', label: 'Problem History', icon: History },
    { id: 'discussion', label: 'Quick Join', icon: MessageSquare },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  const handleDeleteRoom = () => {
    deleteRoom(activeRoom.id);
    setShowDeleteConfirm(false);
  };

  // Deduplicate members list to guarantee zero duplicates
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

  const sidebarContent = (
    <div
      className={`flex flex-col h-full p-3.5 space-y-3.5 font-sans text-xs transition-colors duration-200 ${
        isIllustrative ? 'bg-[#faf5ea]/90 text-[#212d27]' : 'bg-[#161b22] text-white'
      }`}
    >
      {/* Active Room Metadata Card */}
      <div
        className={`rounded-2xl p-3.5 border space-y-2.5 shadow-sm transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4]'
            : 'bg-[#0d1117] border-[#30363d]'
        }`}
      >
        <div className="flex gap-2.5 items-center">
          {/* Room Camp/Study Graphic */}
          <div className="w-12 h-12 rounded-xl bg-[#d8f3dc] border border-[#b7e4c7] flex items-center justify-center text-xl shrink-0 shadow-inner">
            ⛺
          </div>

          <div className="min-w-0 flex-1">
            <span className={`text-[9px] font-mono uppercase tracking-wider block ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
              CURRENT ROOM
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 truncate">
              <h2
                className={`font-bold text-xs sm:text-sm font-sans truncate ${
                  isIllustrative ? 'text-[#212d27]' : 'text-white'
                }`}
              >
                {activeRoom.name}
              </h2>
              {isHost && (
                <span className="bg-purple-100 text-purple-800 text-[9px] px-1 py-0.2 rounded font-bold border border-purple-200 font-mono shrink-0">
                  HOST
                </span>
              )}
            </div>
            <div className={`text-[10px] flex items-center gap-2 mt-0.5 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
              <span>• {uniqueMembers.length} members</span>
              <span>• {activeRoom.targetDailyGoal || 1} / day</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => setIsLandingView(true)}
            className={`flex-1 py-1.5 px-2 rounded-xl border flex justify-center items-center gap-1 text-[11px] font-medium transition-colors ${
              isIllustrative
                ? 'bg-[#fbf7ee] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                : 'bg-[#161b22] hover:bg-[#21262d] text-slate-200 border-[#30363d]'
            }`}
            title="Switch or View Room Info"
          >
            <Info className="w-3 h-3 text-[#2d6a4f]" />
            <span>Room Info</span>
          </button>

          <button
            onClick={() => setIsInviteOpen(true)}
            className={`flex-1 py-1.5 px-2 rounded-xl flex justify-center items-center gap-1 text-[11px] font-semibold transition-colors shadow-sm ${
              isIllustrative
                ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>Invite</span>
          </button>

          {isHost && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-xl border border-rose-200 transition-colors flex items-center justify-center shrink-0"
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
                if (item.id === 'bookmarks') {
                  setToast({
                    title: 'Bookmarks',
                    message: 'Your saved favorite LeetCode problems will appear here.',
                    type: 'info',
                  });
                  return;
                }
                setActiveTab(item.id);
                if (onMobileClose) onMobileClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                isActive
                  ? isIllustrative
                    ? 'bg-[#d8f3dc] text-[#2d6a4f] font-bold shadow-sm'
                    : 'bg-[#2ea043]/15 text-[#3fb950] font-semibold border border-[#2ea043]/30'
                  : isIllustrative
                  ? 'text-[#5c6b63] hover:bg-[#f4ede0] hover:text-[#212d27]'
                  : 'text-slate-300 hover:bg-[#21262d] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? (isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]') : isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`} />
              <span className="flex-1 font-sans">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Collaborative Members Section */}
      <div className="flex flex-col flex-1 min-h-0 space-y-2 mt-1">
        <button
          onClick={() => setIsDesktopMembersOpen(!isDesktopMembersOpen)}
          className={`flex items-center justify-between px-2 py-1 text-xs font-medium transition-colors ${
            isIllustrative ? 'text-[#5c6b63] hover:text-[#212d27]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider">ONLINE MEMBERS ({uniqueMembers.length})</span>
          </div>
          {isDesktopMembersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {isDesktopMembersOpen && (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {uniqueMembers.map((member) => {
              const isCurrent = member.id === currentUser.id || (currentUser.username && member.username?.toLowerCase() === currentUser.username?.toLowerCase());
              const memberIsHost = isUserHostOfRoom(activeRoom, member);

              return (
                <div
                  key={member.id}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    isIllustrative
                      ? isCurrent
                        ? 'bg-white border-[#b7e4c7] text-[#212d27] shadow-sm'
                        : 'bg-white/70 border-[#ede4d4] text-[#212d27]'
                      : isCurrent
                      ? 'bg-[#2ea043]/5 border-[#2ea043]/20 text-white'
                      : 'bg-[#0d1117] border-[#30363d] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover border border-[#ede4d4] shrink-0"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-sans">
                        <span className="text-xs font-semibold truncate max-w-[90px]">
                          {isCurrent ? `${currentUser.name.split(' ')[0]} (You)` : member.name.split(' ')[0]}
                        </span>
                        {memberIsHost && (
                          <span className="text-[8px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-bold border border-purple-200 font-mono">
                            HOST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Flame className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" />
                    <span className="text-[11px] font-bold text-[#ea580c] font-mono">{member.streak}</span>

                    {isHost && !isCurrent && (
                      <button
                        onClick={() => removeMember(activeRoom.id, member.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors ml-0.5"
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

      {/* Bottom Mascot Card (Matching Mockup) */}
      <div
        className={`rounded-2xl p-3 border shadow-sm relative overflow-hidden flex items-center gap-2.5 ${
          isIllustrative
            ? 'bg-gradient-to-r from-[#eef8f1] to-[#f4fbf6] border-[#d8f3dc]'
            : 'bg-[#0d1117] border-[#30363d]'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-[#d8f3dc] border border-[#b7e4c7] flex items-center justify-center text-xl shrink-0">
          🐲
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#1b4332] leading-tight">
            Consistency today, Cracked tomorrow! 💚
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= md) */}
      <aside
        className={`hidden md:flex w-64 xl:w-72 2xl:w-80 flex-col overflow-hidden shrink-0 transition-colors duration-200 border-r ${
          isIllustrative ? 'bg-[#faf5ea]/90 border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onMobileClose} />
          <div
            className={`relative w-4/5 max-w-xs h-full flex flex-col z-10 shadow-2xl border-r ${
              isIllustrative ? 'bg-[#faf5ea] border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
            }`}
          >
            <div className={`flex items-center justify-between p-4 border-b ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}>
              <span className={`text-xs font-semibold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-300'}`}>
                WORKSPACE MENU
              </span>
              <button onClick={onMobileClose} className="p-1 text-slate-400 hover:text-black rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Modals & Confirmations */}
      {activeRoom && (
        <InviteModal
          room={activeRoom}
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`rounded-2xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl border ${
              isIllustrative ? 'bg-white border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className={`text-base font-bold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                Delete Room Permanently?
              </h3>
            </div>
            <p className={`text-xs font-sans leading-relaxed ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
              Are you sure you want to delete <strong className={isIllustrative ? 'text-[#212d27]' : 'text-white'}>"{activeRoom.name}"</strong>? All associated daily problem submissions and discussions will be permanently erased.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteRoom}>
                Delete Room
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

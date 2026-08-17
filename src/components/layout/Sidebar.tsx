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
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { activeRoom, currentUser, isAdmin, deleteRoom, removeMember } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);
  const [isDesktopMembersOpen, setIsDesktopMembersOpen] = useState(false);

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

  return (
    <>
      {/* Mobile Top Navigation Tab Bar (< md) */}
      <div className="md:hidden w-full space-y-3 shrink-0 p-3 bg-[#101418] border-b border-[#3d4a3e]">
        <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 min-w-[75px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#4ade80]' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Room Info Accordion Toggle */}
        <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-white truncate">{activeRoom.name}</span>
              <span className="text-[10px] font-mono text-[#4ade80] bg-[#101418] px-1.5 py-0.5 rounded border border-[#4ade80]/30 shrink-0">
                {activeRoom.code}
              </span>
            </div>
            <button
              onClick={() => setIsMobileDetailsOpen(!isMobileDetailsOpen)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 p-1 rounded-lg hover:bg-[#262a2f] shrink-0"
            >
              <span>{isMobileDetailsOpen ? 'Hide' : 'Members'} ({activeRoom.members.length})</span>
              {isMobileDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isMobileDetailsOpen && (
            <div className="mt-3 pt-3 border-t border-[#3d4a3e] space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed font-mono">{activeRoom.description}</p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="flex-1 bg-[#101418] hover:bg-[#262a2f] text-slate-200 text-xs py-2 rounded-lg font-semibold border border-[#3d4a3e] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#4ade80]" />
                  Invite Teammates
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-lg font-semibold border border-rose-500/30 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Members Preview */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {activeRoom.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#101418] border border-[#3d4a3e]/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{member.name}</div>
                        {member.username && (
                          <div className="text-[10px] text-cyan-400 font-mono truncate">@{member.username}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Flame className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" />
                      <span className="text-xs font-bold text-[#ea580c]">{member.streak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar (>= md) matching reference HTML/CSS */}
      <aside className="hidden md:flex w-72 bg-[#1c2024] border-r border-[#3d4a3e] flex-col gap-6 p-6 overflow-y-auto shrink-0">
        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-2">
          <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider font-semibold">NAVIGATION</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#4ade80]/10 text-[#4ade80] font-semibold border border-[#4ade80]/20'
                    : 'text-[#e0e2e8] hover:bg-[#31353a] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4ade80]' : 'text-slate-400'}`} />
                <span>{item.fullLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* Current Room Overview Card */}
        <div className="bg-[#31353a] rounded-xl p-4 border border-[#3d4a3e]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-white leading-tight pr-2 truncate">{activeRoom.name}</h3>
            <span className="text-[10px] font-mono bg-[#1c2024] px-2 py-1 rounded text-slate-300 whitespace-nowrap border border-[#3d4a3e]">
              {activeRoom.code}
            </span>
          </div>

          <p className="text-xs font-mono text-slate-300 mb-4 leading-relaxed line-clamp-2">
            {activeRoom.description}
          </p>

          <div className="bg-[#101418] rounded-lg p-3 flex justify-between items-center mb-4 border border-[#3d4a3e]/50">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Target className="w-4 h-4 text-[#4ade80]" />
              <span>Daily Target</span>
            </div>
            <span className="text-[#4ade80] font-semibold text-xs">{activeRoom.targetDailyGoal} Problem / day</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex-1 bg-[#101418] hover:bg-[#262a2f] text-[#e0e2e8] border border-[#3d4a3e] rounded-lg py-2 flex justify-center items-center gap-2 text-xs font-medium transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#4ade80]" />
              <span>Invite</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 p-2 rounded-lg border border-rose-500/20 transition-colors flex items-center justify-center"
                title="Delete Active Room (Admin Access)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Room Members Toggle & Drawer */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => setIsDesktopMembersOpen(!isDesktopMembersOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#31353a] rounded-lg border border-[#3d4a3e] hover:bg-[#262a2f] transition-colors"
          >
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4 text-[#4ade80]" />
              <span className="font-semibold text-xs">Room Members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-[#101418] px-2 py-0.5 rounded text-slate-300 font-mono">
                {activeRoom.members.length}
              </span>
              {isDesktopMembersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </div>
          </button>

          {isDesktopMembersOpen && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 bg-[#101418] p-2 rounded-lg border border-[#3d4a3e]">
              {activeRoom.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1c2024] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{member.name}</div>
                      {member.username && (
                        <div className="text-[10px] text-cyan-400 font-mono truncate">@{member.username}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Flame className="w-3 h-3 text-[#ea580c] fill-[#ea580c]" />
                    <span className="text-xs font-bold text-[#ea580c]">{member.streak}d</span>

                    {isAdmin && member.id !== currentUser.id && (
                      <button
                        onClick={() => removeMember(activeRoom.id, member.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors ml-1"
                        title={`Remove member ${member.name}`}
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-5 sm:p-6 z-10 shadow-2xl space-y-4 mx-3">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg text-white">Delete Active Room</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="text-rose-400 font-bold">"{activeRoom.name}"</span>? As Admin, this action will permanently remove the room for all members.
            </p>
            <div className="pt-2 flex justify-end gap-2">
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

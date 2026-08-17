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
  ShieldCheck,
  UserPlus,
  Target,
  Trash2,
  AlertTriangle,
  UserX,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { activeRoom, currentUser, isAdmin, deleteRoom, removeMember } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!activeRoom) return null;

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Daily Workspace', icon: LayoutDashboard },
    { id: 'leaderboard', label: 'Leaderboard & Analytics', icon: Trophy },
    { id: 'history', label: 'Problem History', icon: History },
    { id: 'discussion', label: 'Room Discussions', icon: MessageSquare },
  ];

  const handleDeleteRoom = () => {
    deleteRoom(activeRoom.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <aside className="w-full md:w-64 shrink-0 space-y-5">
        {/* Navigation Tabs */}
        <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1 tracking-wider">Navigation</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Current Room Overview Card */}
        <div className="glass-panel bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white truncate">{activeRoom.name}</h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {activeRoom.code}
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{activeRoom.description}</p>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Daily Target
            </span>
            <span className="font-bold text-cyan-400">{activeRoom.targetDailyGoal} Problem / day</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded-xl font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              Invite
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-xl font-semibold border border-rose-500/30 flex items-center justify-center gap-1 transition-colors"
                title="Delete Active Room (Admin Access)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Members List */}
        <div className="glass-panel bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Room Members</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">
              {activeRoom.members.length}
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activeRoom.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img src={member.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                    {member.solvedToday && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-white truncate">{member.name}</span>
                    </div>
                    {member.username && (
                      <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5 truncate">
                        <ShieldCheck className="w-2.5 h-2.5" />@{member.username}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span className="text-xs font-bold text-orange-400">{member.streak}</span>
                  </div>

                  {isAdmin && member.id !== currentUser.id && (
                    <button
                      onClick={() => removeMember(activeRoom.id, member.id)}
                      className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors"
                      title={`Remove member ${member.name}`}
                    >
                      <UserX className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl p-6 z-10 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-white">Delete Active Room</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="text-rose-400 font-bold">"{activeRoom.name}"</span>? As Admin, this action will permanently remove the room for all members.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoom}
                className="px-5 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/20"
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

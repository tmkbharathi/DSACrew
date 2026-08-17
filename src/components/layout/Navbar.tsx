import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfileModal } from '../profile/UserProfileModal';
import { CreateRoomModal } from '../room/CreateRoomModal';
import { JoinRoomModal } from '../room/JoinRoomModal';
import { InviteModal } from '../room/InviteModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { PostProblemModal } from '../problem/PostProblemModal';
import { AuthModal } from '../auth/AuthModal';
import {
  Code2,
  Bell,
  Volume2,
  VolumeX,
  Plus,
  LogIn,
  Share2,
  ChevronDown,
  RotateCcw,
  Layers,
  ShieldCheck,
  UserCheck,
  Trash2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    toggleAdminRole,
    isAdmin,
    rooms,
    activeRoomId,
    activeRoom,
    switchActiveRoom,
    deleteRoom,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    resetDemoData,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteConfirm = () => {
    if (roomToDelete) {
      deleteRoom(roomToDelete.id);
      setRoomToDelete(null);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 py-3.5 bg-[#101418]/80 backdrop-blur-md border-b border-[#3d4a3e]">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => {
                if ((window as any).__setLandingView) (window as any).__setLandingView(true);
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded border border-[#4ade80]/30 flex items-center justify-center bg-[#1c2024] shadow-sm">
                <Code2 className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white font-sans">
                    Leet<span className="text-[#4ade80]">Tracker</span>
                  </h1>
                </div>
              </div>
            </button>

            {/* Subdued Nav links from reference */}
            <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400">
              <button
                onClick={() => {
                  if ((window as any).__setLandingView) (window as any).__setLandingView(true);
                }}
                className="hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => {
                  if ((window as any).__setLandingView) (window as any).__setLandingView(true);
                }}
                className="hover:text-white transition-colors"
              >
                Help
              </button>
            </nav>
          </div>

          {/* Room Switcher Dropdown */}
          <div className="relative min-w-0">
            <button
              onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
              className="bg-[#1c2024] hover:bg-[#262a2f] border border-[#3d4a3e] px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold text-white transition-all shadow-sm max-w-full"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4ade80] shrink-0" />
              <span className="truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-[240px]">
                {activeRoom?.name || 'Select Room'}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
            </button>

            {isRoomDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto right-auto sm:right-0 w-[calc(100vw-2rem)] max-w-xs sm:w-72 bg-[#1c2024] border border-[#3d4a3e] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase px-2 py-1 flex items-center justify-between">
                  <span>Your Practice Rooms</span>
                  {isAdmin && <span className="text-[9px] text-purple-400 font-bold">Admin Delete</span>}
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between group rounded-lg hover:bg-[#262a2f] p-1">
                      <button
                        onClick={() => {
                          switchActiveRoom(room.id);
                          setIsRoomDropdownOpen(false);
                        }}
                        className={`flex-1 text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors min-w-0 ${
                          room.id === activeRoomId ? 'text-[#4ade80] font-bold bg-[#4ade80]/10' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{room.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1.5 shrink-0">{room.code}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomToDelete({ id: room.id, name: room.name });
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded-md hover:bg-rose-950/40 transition-colors shrink-0 ml-1"
                          title={`Delete Room "${room.name}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#3d4a3e] pt-1.5 mt-1 grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      setIsRoomDropdownOpen(false);
                      setIsCreateOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#4ade80] hover:bg-[#262a2f] px-2 py-1.5 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Create
                  </button>
                  <button
                    onClick={() => {
                      setIsRoomDropdownOpen(false);
                      setIsJoinOpen(true);
                    }}
                    className="text-[11px] font-semibold text-cyan-400 hover:bg-[#262a2f] px-2 py-1.5 rounded-lg flex items-center justify-center gap-1"
                  >
                    <LogIn className="w-3 h-3" /> Join Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* System Role Switcher Badge Button */}
            <button
              onClick={toggleAdminRole}
              className={`text-xs p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-[#1c2024] text-slate-400 border-[#3d4a3e] hover:text-white'
              }`}
              title="Click to toggle between Admin Mode and Member Mode"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden md:inline text-[11px]">Admin</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden md:inline text-[11px]">Member</span>
                </>
              )}
            </button>

            {/* Post Problem shortcut matching reference design */}
            <button
              onClick={() => setIsPostOpen(true)}
              className="bg-[#4ade80] text-[#005e2d] hover:bg-[#6dfe9c] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-colors shadow-sm"
              title="Post Daily Problem"
            >
              <Plus className="w-4 h-4 text-[#005e2d] stroke-[2.5]" />
              <span className="hidden xs:inline">Post</span>
            </button>

            {/* Invite Button */}
            {activeRoom && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="bg-[#1c2024] hover:bg-[#262a2f] text-slate-200 text-xs px-3 py-2 rounded-lg font-semibold border border-[#3d4a3e] flex items-center gap-1.5 transition-colors hidden md:flex"
              >
                <Share2 className="w-3.5 h-3.5 text-[#4ade80]" />
                <span>Invite</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c2024] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#4ade80] rounded-full animate-ping-once glow-emerald" />
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors hidden sm:block"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Reset Workspace */}
            <button
              onClick={resetDemoData}
              className="p-2 text-slate-400 hover:text-amber-400 rounded-xl hover:bg-slate-800 transition-colors hidden lg:block"
              title="Reset Workspace"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Profile Avatar Settings */}
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 shrink-0"
              title="Profile Settings"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-emerald-500/60"
              />
              <span className="text-xs font-semibold text-slate-200 hidden xl:inline truncate max-w-[100px]">{currentUser.name}</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Room Deletion Confirmation Modal */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setRoomToDelete(null)} />
          <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 z-10 shadow-2xl space-y-4 mx-3">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base sm:text-lg text-white">Delete Room Confirmation</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete room <span className="text-rose-400 font-bold">"{roomToDelete.name}"</span>? All daily problems, submissions, and member logs in this room will be removed.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setRoomToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white rounded-xl shadow-lg shadow-rose-500/20"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
      {activeRoom && <InviteModal room={activeRoom} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <PostProblemModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

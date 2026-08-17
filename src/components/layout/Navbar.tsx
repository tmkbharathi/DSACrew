import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PostProblemModal } from '../problem/PostProblemModal';
import { InviteModal } from '../room/InviteModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { UserProfileModal } from '../profile/UserProfileModal';
import { Tooltip } from '../ui/Tooltip';
import {
  Code2,
  Bell,
  Volume2,
  VolumeX,
  Plus,
  Share2,
  ChevronDown,
  RotateCcw,
  Layers,
  ShieldCheck,
  UserCheck,
  Trash2,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  Search,
  PlusCircle,
} from 'lucide-react';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const {
    activeRoom,
    rooms,
    activeRoomId,
    switchActiveRoom,
    notifications,
    currentUser,
    isAdmin,
    toggleAdminRole,
    soundEnabled,
    setSoundEnabled,
    resetToDefault,
    deleteRoom,
    signOut,
  } = useApp();

  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [roomSearch, setRoomSearch] = useState('');

  const roomDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(e.target as Node)) {
        setIsRoomDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleResetWorkspace = () => {
    resetToDefault();
    setShowResetConfirm(false);
  };

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
    r.code.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-3.5 sm:px-6 h-[64px] bg-[#101418]/90 backdrop-blur-md border-b border-[#3d4a3e]">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Workspace Switcher */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c2024]"
                aria-label="Toggle Navigation Menu"
              >
                <Layers className="w-5 h-5 text-[#4ade80]" />
              </button>
            )}

            {/* Brand Logo */}
            <button
              onClick={() => {
                if ((window as any).__setLandingView) (window as any).__setLandingView(true);
              }}
              className="flex items-center gap-2 text-left group shrink-0"
              title="Return to LeetTracker Home"
            >
              <div className="w-9 h-9 rounded-lg border border-[#4ade80]/30 flex items-center justify-center bg-[#1c2024] shadow-sm group-hover:border-[#4ade80]/60 transition-colors">
                <Code2 className="w-5 h-5 text-[#4ade80]" />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-sans">
                  Leet<span className="text-[#4ade80]">Tracker</span>
                </span>
              </div>
            </button>

            {/* Divider */}
            <div className="hidden sm:block h-5 w-[1px] bg-[#3d4a3e]" />

            {/* Room / Workspace Switcher Dropdown */}
            <div className="relative min-w-0" ref={roomDropdownRef}>
              <button
                onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                className="bg-[#1c2024] hover:bg-[#262a2f] border border-[#3d4a3e] px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-white transition-all shadow-sm max-w-full"
                aria-haspopup="true"
                aria-expanded={isRoomDropdownOpen}
              >
                <Layers className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[180px] md:max-w-[220px]">
                  {activeRoom?.name || 'Select Room'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isRoomDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-[calc(100vw-2rem)] max-w-xs sm:w-72 bg-[#1c2024] border border-[#3d4a3e] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  {/* Search / Filter input */}
                  {rooms.length > 3 && (
                    <div className="relative p-1">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        placeholder="Search rooms..."
                        className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-slate-400 uppercase px-2 py-1 flex items-center justify-between">
                    <span>Practice Rooms</span>
                    {isAdmin && <span className="text-[9px] text-purple-400 font-bold">Admin Controls</span>}
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                    {filteredRooms.map((room) => (
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

                        {isAdmin && rooms.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRoom(room.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                            title={`Delete ${room.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Actions Group */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* System Role Switcher Badge */}
            <Tooltip content={isAdmin ? 'Switch to Member Mode' : 'Switch to Admin Mode'}>
              <button
                onClick={toggleAdminRole}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                    : 'bg-[#1c2024] text-slate-400 border-[#3d4a3e] hover:text-white'
                }`}
                aria-label="Toggle Admin/Member Role"
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
            </Tooltip>

            {/* Post Problem Primary Action Button */}
            <button
              onClick={() => setIsPostOpen(true)}
              className="bg-[#4ade80] text-[#005e2d] hover:bg-[#6dfe9c] active:bg-[#3bc26f] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm"
              title="Add Problem for Practice"
            >
              <Plus className="w-4 h-4 text-[#005e2d] stroke-[2.5]" />
              <span className="hidden xs:inline">Post</span>
            </button>

            {/* Invite Button */}
            {activeRoom && (
              <Tooltip content="Share Room Invite Code">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="bg-[#1c2024] hover:bg-[#262a2f] text-slate-200 text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg font-semibold border border-[#3d4a3e] flex items-center gap-1.5 transition-colors hidden sm:flex"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span>Invite</span>
                </button>
              </Tooltip>
            )}

            {/* Notification Bell */}
            <Tooltip content="Notifications">
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c2024] transition-colors"
                aria-label="View Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#4ade80] rounded-full animate-ping-once" />
                )}
              </button>
            </Tooltip>

            {/* Sound Toggle */}
            <Tooltip content={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c2024] transition-colors hidden md:block"
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#4ade80]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </Tooltip>

            {/* Reset Workspace Confirmation Trigger */}
            <Tooltip content="Reset Workspace to Defaults">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-[#1c2024] transition-colors hidden lg:block"
                aria-label="Reset Workspace"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#1c2024] transition-colors border border-transparent hover:border-[#3d4a3e]"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#3d4a3e]"
                />
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1c2024] border border-[#3d4a3e] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-[#3d4a3e]/60">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] font-mono text-[#4ade80] truncate">@{currentUser.username}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#262a2f] rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#4ade80]" />
                    <span>View Profile & Stats</span>
                  </button>

                  <button
                    onClick={() => {
                      if ((window as any).__setLandingView) (window as any).__setLandingView(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#262a2f] rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Switch / Create Account</span>
                  </button>

                  <button
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors border-t border-[#3d4a3e]/40 mt-1 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <PostProblemModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />
      {activeRoom && <InviteModal room={activeRoom} isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-white">Reset Workspace Data?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              This will restore the original demo rooms, problems, and members. Any custom rooms or local submissions will be refreshed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-[#262a2f]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetWorkspace}
                className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

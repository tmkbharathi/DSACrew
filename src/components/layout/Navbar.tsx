import React, { useState, useRef, useEffect } from 'react';
import { useApp, isUserHostOfRoom } from '../../context/AppContext';
import {
  Bell,
  Volume2,
  VolumeX,
  Plus,
  Share2,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  LogOut,
  Layers,
  Menu,
} from 'lucide-react';
import { PostProblemModal } from '../problem/PostProblemModal';
import { InviteModal } from '../room/InviteModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { UserProfileModal } from '../profile/UserProfileModal';
import { Tooltip } from '../ui/Tooltip';
import { Button } from '../ui/Button';

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const {
    currentUser,
    activeRoom,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    resetToDefault,
    signOut,
    setIsLandingView,
  } = useApp();

  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle outside click for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isRoomHost = isUserHostOfRoom(activeRoom, currentUser);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#161b22] border-b border-[#30363d] px-3 sm:px-6 2xl:px-8 py-2.5 sm:py-3 transition-colors">
        <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1880px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Room Switcher Group */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile Menu Button */}
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] lg:hidden"
                aria-label="Open Mobile Drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Logo */}
            <div
              className="flex items-center gap-2 select-none shrink-0 cursor-pointer"
              onClick={() => setIsLandingView(true)}
              title="Return to Landing Page Overview"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-[#3fb950] font-mono font-bold text-sm shadow-sm">
                &lt;/&gt;
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-white hidden md:inline font-sans">
                Leet<span className="text-[#3fb950]">Tracker</span>
              </span>
            </div>

            {/* Active Room Indicator Pill */}
            {activeRoom && (
              <div
                onClick={() => setIsLandingView(true)}
                className="flex items-center gap-2 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded-lg px-2.5 sm:px-3 py-1.5 transition-colors cursor-pointer max-w-[160px] xs:max-w-[200px] sm:max-w-[280px]"
                title="Active Room • Click to switch in Rooms Hub"
              >
                <div className="w-2 h-2 rounded-full bg-[#3fb950] shrink-0 animate-pulse" />
                <span className="font-semibold text-xs sm:text-sm text-white truncate font-sans">
                  {activeRoom.name}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Actions Group */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Room Host / Member Role Badge */}
            <Tooltip content={isRoomHost ? 'You are the Host of this Room' : 'You are a Member of this Room'}>
              <div
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border flex items-center gap-1.5 select-none font-mono ${
                  isRoomHost
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-[#0d1117] text-slate-400 border-[#30363d]'
                }`}
              >
                {isRoomHost ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px]">HOST</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">MEMBER</span>
                  </>
                )}
              </div>
            </Tooltip>

            {/* Post Problem Action Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPostOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Post
            </Button>

            {/* Invite Button */}
            {activeRoom && (
              <Tooltip content="Share Room Invite Code">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInviteOpen(true)}
                  leftIcon={<Share2 className="w-3.5 h-3.5 text-[#3fb950]" />}
                  className="hidden sm:inline-flex"
                >
                  Invite
                </Button>
              </Tooltip>
            )}

            {/* Notifications Bell */}
            <Tooltip content="Room Notifications">
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f0883e] ring-2 ring-[#161b22]" />
                )}
              </button>
            </Tooltip>

            {/* Sound Toggle */}
            <Tooltip content={soundEnabled ? 'Disable Notification Sounds' : 'Enable Notification Sounds'}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors hidden sm:block"
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#3fb950]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </Tooltip>

            {/* User Profile Avatar / Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 p-0.5 rounded-full ring-2 ring-[#30363d] hover:ring-[#3fb950] transition-all"
                aria-label="User Profile Menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="p-3 border-b border-[#30363d] flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#30363d]"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1 font-sans">
                        {currentUser.name}
                        {isRoomHost && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">
                            HOST
                          </span>
                        )}
                      </div>
                      {currentUser.username && (
                        <div className="text-xs text-cyan-400 font-mono truncate">
                          @{currentUser.username}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs font-medium text-slate-300">
                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#21262d] text-left transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#3fb950]" />
                      <span>LeetCode Profile &amp; Stats</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsLandingView(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#21262d] text-left transition-colors"
                    >
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Switch Room / Overview</span>
                    </button>

                    <a
                      href={`https://leetcode.com/${currentUser.username || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#21262d] text-left transition-colors text-slate-300"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      <span>Open LeetCode.com</span>
                    </a>

                    <div className="border-t border-[#30363d] my-1" />

                    <button
                      onClick={() => {
                        setShowResetConfirm(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-rose-950/30 text-rose-400 text-left transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Demo Data</span>
                    </button>

                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#21262d] text-slate-400 hover:text-white text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <PostProblemModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />
      {activeRoom && (
        <InviteModal
          room={activeRoom}
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h4 className="font-bold text-base text-white font-sans">Reset Workspace Data?</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              This will restore all default practice rooms, reset problem submissions, and clear local state cache.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <button
                onClick={() => {
                  resetToDefault();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
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

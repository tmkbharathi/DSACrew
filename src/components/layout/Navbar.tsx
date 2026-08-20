import React, { useState, useRef, useEffect } from 'react';
import { useApp, isUserHostOfRoom } from '../../context/AppContext';
import {
  Bell,
  Volume2,
  VolumeX,
  Plus,
  Share2,
  Flame,
  RotateCcw,
  Sparkles,
  ExternalLink,
  LogOut,
  Layers,
  Menu,
  Sun,
  Moon,
  Palette,
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
    updateCurrentUser,
    resetToDefault,
    signOut,
    setIsLandingView,
    theme,
    setTheme,
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
  const isIllustrative = theme === 'illustrative';

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full px-3 sm:px-6 2xl:px-8 py-2.5 sm:py-3 transition-colors duration-200 ${
          isIllustrative
            ? 'bg-white border-b border-[#ede4d4] text-[#212d27]'
            : 'bg-[#161b22] border-b border-[#30363d] text-white'
        }`}
      >
        <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1880px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Room Switcher Group */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile Menu Button */}
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className={`p-1.5 rounded-lg lg:hidden transition-colors ${
                  isIllustrative
                    ? 'text-slate-600 hover:text-black hover:bg-[#f4ede0]'
                    : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                }`}
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
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-colors ${
                  isIllustrative
                    ? 'bg-[#f4ede0] border border-[#ede4d4] text-[#2d6a4f]'
                    : 'bg-[#0d1117] border border-[#30363d] text-[#3fb950]'
                }`}
              >
                &lt;/&gt;
              </div>
              <span
                className={`font-bold text-base sm:text-lg tracking-tight hidden md:inline font-sans ${
                  isIllustrative ? 'text-[#212d27]' : 'text-white'
                }`}
              >
                Leet<span className={isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}>Tracker</span>
              </span>
            </div>

            {/* Active Room Indicator — Member Avatars + Room Name + HOST badge (Matching Mockup) */}
            {activeRoom && (
              <div
                onClick={() => setIsLandingView(true)}
                className={`flex items-center gap-2 rounded-lg px-2 sm:px-2.5 py-1.5 transition-colors cursor-pointer border ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] hover:bg-[#f4ede0] border-[#ede4d4]'
                    : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d]'
                }`}
                title="Active Room • Click to switch in Rooms Hub"
              >
                {/* Member Avatar Stack */}
                <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                  {activeRoom.members.slice(0, 3).map((m, i) => (
                    <img
                      key={i}
                      src={m.avatar}
                      alt={m.name}
                      className="inline-block w-5 h-5 rounded-full ring-1 ring-white object-cover"
                    />
                  ))}
                </div>

                {/* Room Name */}
                <span
                  className={`font-semibold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[160px] font-sans ${
                    isIllustrative ? 'text-[#212d27]' : 'text-white'
                  }`}
                >
                  {activeRoom.name}
                </span>

                {/* HOST badge */}
                {isRoomHost && (
                  <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold border border-purple-200 font-mono shrink-0">
                    HOST
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions & Profile Group */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Streak Counter */}
            <Tooltip content={`${currentUser.streak}-day streak! Keep solving to level up.`}>
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-mono font-bold shadow-sm ${
                  isIllustrative
                    ? 'bg-[#ffedd5] text-[#ea580c] border-[#fed7aa]'
                    : 'bg-[#0d1117] text-[#f0883e] border-[#30363d]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ea580c] animate-bounce" />
                <span>{currentUser.streak}d</span>
                {currentUser.solvedToday && (
                  <span className="hidden sm:inline text-[10px] text-emerald-600 font-sans ml-0.5">
                    ✓
                  </span>
                )}
              </div>
            </Tooltip>

            {/* Post Problem Action Button */}
            <button
              onClick={() => setIsPostOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 ${
                isIllustrative
                  ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                  : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>

            {/* Invite Button */}
            {activeRoom && (
              <Tooltip content="Share Room Invite Code">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm border transition-colors ${
                    isIllustrative
                      ? 'bg-[#f4ede0] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                      : 'bg-[#21262d] hover:bg-[#30363d] text-slate-200 border-[#30363d]'
                  }`}
                >
                  <Share2 className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                  <span>Invite</span>
                </button>
              </Tooltip>
            )}

            {/* Theme Toggle Button */}
            <Tooltip content={isIllustrative ? 'Switch to Dark Theme' : 'Switch to Illustrative & Friendly Theme'}>
              <button
                onClick={() => setTheme(isIllustrative ? 'dark' : 'illustrative')}
                className={`p-2 rounded-lg transition-colors border ${
                  isIllustrative
                    ? 'bg-[#f4ede0] hover:bg-[#ede4d4] text-[#2d6a4f] border-[#ede4d4]'
                    : 'bg-[#0d1117] hover:bg-[#21262d] text-amber-400 border-[#30363d]'
                }`}
                aria-label="Toggle Theme"
              >
                {isIllustrative ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </Tooltip>

            {/* Notifications Bell */}
            <Tooltip content="Room Notifications">
              <button
                onClick={() => setIsNotifOpen(true)}
                className={`relative p-2 rounded-lg transition-colors border ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] hover:bg-[#f4ede0] border-[#ede4d4] text-slate-600'
                    : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] text-slate-400'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f0883e] ring-2 ring-white" />
                )}
              </button>
            </Tooltip>

            {/* Sound Toggle */}
            <Tooltip content={soundEnabled ? 'Disable Notification Sounds' : 'Enable Notification Sounds'}>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-colors hidden sm:block border ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] hover:bg-[#f4ede0] border-[#ede4d4] text-slate-600'
                    : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] text-slate-400'
                }`}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? (
                  <Volume2 className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </Tooltip>

            {/* User Profile Avatar / Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-1 p-0.5 rounded-full ring-2 transition-all ${
                  isIllustrative
                    ? 'ring-[#ede4d4] hover:ring-[#2d6a4f]'
                    : 'ring-[#30363d] hover:ring-[#3fb950]'
                }`}
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
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95 border ${
                    isIllustrative
                      ? 'bg-white border-[#ede4d4] text-[#212d27]'
                      : 'bg-[#161b22] border-[#30363d] text-slate-300'
                  }`}
                >
                  <div
                    className={`p-3 border-b flex items-center gap-3 ${
                      isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'
                    }`}
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#ede4d4]"
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold truncate flex items-center gap-1 font-sans ${
                          isIllustrative ? 'text-[#212d27]' : 'text-white'
                        }`}
                      >
                        {currentUser.name}
                        {isRoomHost && (
                          <span className="text-[9px] bg-purple-100 text-purple-800 px-1 rounded border border-purple-200">
                            HOST
                          </span>
                        )}
                      </div>
                      {currentUser.username && (
                        <div
                          className={`text-xs font-mono truncate ${
                            isIllustrative ? 'text-[#2d6a4f]' : 'text-cyan-400'
                          }`}
                        >
                          @{currentUser.username}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs font-medium">
                    <button
                      onClick={() => {
                        setIsProfileOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isIllustrative ? 'hover:bg-[#f4ede0]' : 'hover:bg-[#21262d]'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                      <span>LeetCode Profile &amp; Stats</span>
                    </button>

                    <button
                      onClick={() => {
                        const newTheme = isIllustrative ? 'dark' : 'illustrative';
                        setTheme(newTheme);
                        updateCurrentUser({
                          preferences: {
                            ...currentUser.preferences,
                            theme: newTheme,
                          },
                        });
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isIllustrative ? 'hover:bg-[#f4ede0]' : 'hover:bg-[#21262d]'
                      }`}
                    >
                      <Palette className="w-4 h-4 text-amber-500" />
                      <span>Theme: {isIllustrative ? 'Warm Theme' : 'Dark Mode'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const newSound = !soundEnabled;
                        setSoundEnabled(newSound);
                        updateCurrentUser({
                          preferences: {
                            ...currentUser.preferences,
                            soundEnabled: newSound,
                          },
                        });
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isIllustrative ? 'hover:bg-[#f4ede0]' : 'hover:bg-[#21262d]'
                      }`}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Audio: {soundEnabled ? 'Enabled' : 'Muted'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsLandingView(true);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isIllustrative ? 'hover:bg-[#f4ede0]' : 'hover:bg-[#21262d]'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-cyan-600" />
                      <span>Switch Room / Overview</span>
                    </button>

                    <a
                      href={`https://leetcode.com/${currentUser.username || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isIllustrative ? 'hover:bg-[#f4ede0]' : 'hover:bg-[#21262d]'
                      }`}
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

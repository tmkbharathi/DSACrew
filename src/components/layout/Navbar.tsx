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
  Eye,
  EyeOff,
} from 'lucide-react';
import { PostProblemModal } from '../problem/PostProblemModal';
import { InviteModal } from '../room/InviteModal';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { UserProfileModal } from '../profile/UserProfileModal';
import { SnakeGameModal } from '../fun/SnakeGameModal';
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
    spiderVisible,
    setSpiderVisible,
  } = useApp();

  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSnakeOpen, setIsSnakeOpen] = useState(false);
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
              <span
                className={`font-bold text-base sm:text-lg tracking-tight font-sans ${
                  isIllustrative ? 'text-[#212d27]' : 'text-white'
                }`}
              >
                Leet<span className={isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}>Tracker</span>
              </span>
            </div>
          </div>

          {/* Actions & Profile Group - 7 Compact Uniform Elements (Curvy / Rounded-full) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 1. Streak Counter */}
            <div
              className={`h-8 flex items-center gap-1.5 px-3 rounded-full border text-xs font-mono font-bold shadow-sm select-none ${
                isIllustrative
                  ? 'bg-[#ffedd5] text-[#ea580c] border-[#fed7aa]'
                  : 'bg-[#0d1117] text-[#f0883e] border-[#30363d]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#ea580c] animate-bounce shrink-0" />
              <span>{currentUser.streak}d</span>
              {currentUser.solvedToday && (
                <span className="hidden sm:inline text-[10px] text-emerald-600 font-sans ml-0.5">
                  ✓
                </span>
              )}
            </div>

            {/* 2. Post Problem Action Button */}
            <button
              onClick={() => setIsPostOpen(true)}
              className={`h-8 flex items-center gap-1 px-3.5 rounded-full font-semibold text-xs shadow-sm transition-all active:scale-95 ${
                isIllustrative
                  ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                  : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Post</span>
            </button>

            {/* 3. Invite Button */}
            {activeRoom && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className={`h-8 hidden sm:flex items-center gap-1.5 px-3.5 rounded-full font-semibold text-xs border transition-colors ${
                  isIllustrative
                    ? 'bg-[#f4ede0] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-slate-200 border-[#30363d]'
                }`}
              >
                <Share2 className={`w-3 h-3 shrink-0 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                <span>Invite</span>
              </button>
            )}

            {/* 4. Dual Sun / Moon Toggle Switch Pill (identical to Overview room page) */}
            <button
              onClick={() => setTheme(isIllustrative ? 'dark' : 'illustrative')}
              className={`relative flex items-center p-0.5 rounded-full border transition-all duration-300 shadow-inner select-none shrink-0 cursor-pointer ${
                isIllustrative
                  ? 'bg-[#ede4d4]/70 border-[#d8cbba]'
                  : 'bg-[#0d1117] border-[#30363d]'
              }`}
              title={`Switch to ${isIllustrative ? 'Dark Mode' : 'Warm Illustrative Mode'}`}
              aria-label="Toggle Theme"
            >
              {/* Sliding Pill Indicator */}
              <div
                className={`absolute top-0.5 bottom-0.5 w-6 rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${
                  isIllustrative
                    ? 'left-0.5 translate-x-0 bg-white text-[#2d6a4f]'
                    : 'left-0.5 translate-x-6 bg-[#238636] text-white'
                }`}
              />

              {/* Sun Icon (Illustrative / Light) */}
              <div
                className={`relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200 ${
                  isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </div>

              {/* Moon Icon (Dark Mode) */}
              <div
                className={`relative z-10 w-6 h-6 flex items-center justify-center transition-colors duration-200 ${
                  !isIllustrative ? 'text-white' : 'text-[#8d9a93] hover:text-[#212d27]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* 5. Notifications Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className={`h-8 w-8 flex items-center justify-center relative rounded-full transition-colors border shrink-0 ${
                isIllustrative
                  ? 'bg-[#fbf7ee] hover:bg-[#f4ede0] border-[#ede4d4] text-slate-600'
                  : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] text-slate-400'
              }`}
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#f0883e] ring-1 ring-white" />
              )}
            </button>

            {/* 6. Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`h-8 w-8 hidden sm:flex items-center justify-center rounded-full transition-colors border shrink-0 ${
                isIllustrative
                  ? 'bg-[#fbf7ee] hover:bg-[#f4ede0] border-[#ede4d4] text-slate-600'
                  : 'bg-[#0d1117] hover:bg-[#21262d] border-[#30363d] text-slate-400'
              }`}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <Volume2 className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* 7. User Profile Avatar / Menu */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`h-8 w-8 flex items-center justify-center rounded-full border transition-all overflow-hidden p-0.5 ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4] hover:border-[#2d6a4f]'
                    : 'bg-[#0d1117] border-[#30363d] hover:border-[#3fb950]'
                }`}
                aria-label="User Profile Menu"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
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
                        setSpiderVisible(!spiderVisible);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isIllustrative ? 'hover:bg-[#f4ede0]' : 'hover:bg-[#21262d]'
                      }`}
                    >
                      {spiderVisible ? (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-emerald-500" />
                      )}
                      <span>
                        {spiderVisible ? 'Hide Spider' : 'Show Spider'}
                      </span>
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
      <SnakeGameModal isOpen={isSnakeOpen} onClose={() => setIsSnakeOpen(false)} />

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

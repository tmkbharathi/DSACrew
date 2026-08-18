import React, { useState } from 'react';
import { useApp, isUserHostOfRoom, isUserInRoom } from '../../context/AppContext';
import { AuthModal } from '../auth/AuthModal';
import { CreateRoomModal } from '../room/CreateRoomModal';
import { JoinRoomModal } from '../room/JoinRoomModal';
import { fetchLeetCodeDaily, type LeetCodeDailyChallenge } from '../../services/leetcodeApi';
import {
  Code2,
  Users,
  Trophy,
  ArrowRight,
  ShieldCheck,
  LogIn,
  Plus,
  RefreshCw,
  HelpCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  Radio,
  Zap,
  Sparkles,
  LogOut,
  Flame,
  CheckCircle2,
  Target,
  Copy,
  KeyRound,
  Compass,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onEnterRoom?: (roomId?: string) => void;
  onEnterWorkspace?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterRoom, onEnterWorkspace }) => {
  const { currentUser, rooms, activeRoomId, switchActiveRoom, joinRoomByCode, login, logout, setToast } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultRegister, setAuthDefaultRegister] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [copiedRoomCode, setCopiedRoomCode] = useState<string | null>(null);

  // Direct login state on landing page
  const [loginHandleInput, setLoginHandleInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Quick Daily Preview
  const [quickDaily, setQuickDaily] = useState<LeetCodeDailyChallenge | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  const isLoggedIn = Boolean(
    currentUser.isLoggedIn && currentUser.username && currentUser.username.trim().length > 0
  );

  // Filter rooms that the user has joined or created
  const myRooms = rooms.filter((r) => isUserInRoom(r, currentUser));
  // Other rooms in the system not yet joined by this user
  const otherRooms = rooms.filter((r) => !myRooms.some((mr) => mr.id === r.id));

  const handleSelectRoom = (roomId: string) => {
    switchActiveRoom(roomId);
    if (onEnterRoom) {
      onEnterRoom(roomId);
    } else if (onEnterWorkspace) {
      onEnterWorkspace();
    }
  };

  const handleHeroLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginHandleInput.trim()) return;

    setLoginLoading(true);
    setLoginError('');

    const res = await login(loginHandleInput.trim(), loginPasswordInput);
    setLoginLoading(false);

    if (res.success) {
      // User is now logged in; they will see the Room Gateway / Hub
      setLoginHandleInput('');
      setLoginPasswordInput('');
    } else {
      setLoginError(res.message);
    }
  };

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    const clean = roomCode.trim().toUpperCase();
    if (!clean) {
      setJoinError('Please enter a room invite code.');
      return;
    }

    const res = joinRoomByCode(clean);
    if (res.success) {
      setJoinSuccess(res.message);
      setRoomCode('');
      // Find the joined room and open it
      const targetRoom = rooms.find((r) => r.code.toUpperCase() === clean);
      if (targetRoom) {
        setTimeout(() => {
          handleSelectRoom(targetRoom.id);
        }, 300);
      }
    } else {
      setJoinError(res.message);
    }
  };

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      navigator.clipboard.writeText(code);
      setCopiedRoomCode(code);
      setTimeout(() => setCopiedRoomCode(null), 2000);
      setToast({
        title: 'Invite Code Copied! 📋',
        message: `Room code "${code}" copied to clipboard.`,
        type: 'info',
      });
    } catch (err) {}
  };

  const handleFetchDailyPreview = async () => {
    setLoadingDaily(true);
    try {
      const daily = await fetchLeetCodeDaily();
      if (daily && daily.title) {
        setQuickDaily(daily);
        setToast({
          title: "Today's Official Daily Challenge",
          message: `"${daily.title}" (${daily.difficulty || 'Medium'})`,
          type: 'info',
        });
      }
    } catch {
      setToast({
        title: 'LeetCode Daily Challenge',
        message: 'Could not fetch latest challenge. Please try again.',
        type: 'warning',
      });
    } finally {
      setLoadingDaily(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117] text-[#f0f6fc] flex flex-col justify-between overflow-y-auto relative selection:bg-[#2ea043]/20 selection:text-[#3fb950]">
      {/* Background Ambient Subtle Glow */}
      <div className="absolute inset-0 pointer-events-none hero-gradient" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-[#30363d] px-4 sm:px-6 py-3 bg-[#161b22]/90 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-[#30363d] flex items-center justify-center bg-[#0d1117] shadow-sm">
              <Code2 className="w-4 h-4 text-[#3fb950]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white font-sans">
              Leet<span className="text-[#3fb950]">Tracker</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setTourStep(1)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#21262d] transition-colors text-slate-300 hover:text-white"
              title="How It Works / Tour"
              aria-label="How It Works"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#0d1117] px-3 py-1.5 rounded-lg border border-[#30363d]">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-[#30363d]"
                  />
                  <span className="text-xs font-mono text-cyan-400 font-medium">@{currentUser.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg border border-[#30363d] hover:bg-[#21262d] transition-colors text-slate-400 hover:text-rose-400"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setAuthDefaultRegister(false);
                  setIsAuthOpen(true);
                }}
                leftIcon={<LogIn className="w-3.5 h-3.5" />}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Center Content Canvas */}
      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center justify-center w-full py-8 sm:py-12 space-y-8">
        {!isLoggedIn ? (
          <>
            {/* Logged Out Hero */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#30363d] bg-[#161b22] shadow-sm">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  REAL-TIME LEETCODE ROOMS • V1.0
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight font-sans">
                Crack LeetCode Together with Your{' '}
                <span className="text-[#3fb950]">Crew</span>.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed text-balance font-sans">
                Create collaborative practice rooms, post daily challenges, sync live solutions with verified LeetCode metrics, and compete on leaderboards.
              </p>
            </div>

            {/* Central Auth Card */}
            <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-2xl text-left space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3fb950]" />
                  <h2 className="text-sm sm:text-base font-bold text-white font-sans">Sign In with LeetCode</h2>
                </div>
                <span className="text-xs text-slate-300 font-medium bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                  Step 1 to Access
                </span>
              </div>

              <form onSubmit={handleHeroLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs text-slate-200 font-medium block" htmlFor="username">
                    LeetCode Username / Handle
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-xs font-mono text-slate-400 group-focus-within:text-[#3fb950] transition-colors">@</span>
                    </span>
                    <input
                      id="username"
                      type="text"
                      required
                      value={loginHandleInput}
                      onChange={(e) => {
                        setLoginHandleInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="e.g. tourist or neal_wu"
                      className="w-full bg-[#0d1117] border border-[#30363d] text-white text-xs sm:text-sm font-mono rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:border-[#3fb950] transition-all placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-200 font-medium block" htmlFor="password">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#3fb950] transition-colors" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginPasswordInput}
                      onChange={(e) => {
                        setLoginPasswordInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Enter password"
                      className="w-full bg-[#0d1117] border border-[#30363d] text-white text-xs sm:text-sm rounded-lg pl-8 pr-9 py-2.5 focus:outline-none focus:border-[#3fb950] transition-all placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 leading-relaxed font-sans">
                    {loginError}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={loginLoading}
                    className="flex-1"
                    leftIcon={loginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                  >
                    {loginLoading ? 'Verifying...' : 'Sign In & Enter'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    type="button"
                    onClick={() => {
                      setAuthDefaultRegister(false);
                      setIsAuthOpen(true);
                    }}
                  >
                    More
                  </Button>
                </div>
              </form>

              <div className="pt-3 border-t border-[#30363d] flex justify-between items-center text-xs">
                <span className="text-slate-300 font-sans">New to LeetTracker?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthDefaultRegister(true);
                    setIsAuthOpen(true);
                  }}
                  className="text-[#3fb950] hover:underline font-semibold font-mono"
                >
                  Create Profile →
                </button>
              </div>
            </div>
          </>
        ) : (
          /* =========================================================================
             AUTHENTICATED ROOM SELECTION GATEWAY & LOBBY
             ========================================================================= */
          <div className="w-full max-w-4xl space-y-6 text-left">
            {/* User Profile Banner */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#2ea043]/60 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#161b22] rounded-full p-0.5 border border-[#30363d]">
                    <ShieldCheck className="w-4 h-4 text-[#3fb950]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white font-sans">{currentUser.name}</h2>
                    <span className="bg-[#2ea043]/20 text-[#3fb950] text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-[#2ea043]/30">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>@{currentUser.username}</span>
                    <span>•</span>
                    <span>{currentUser.leetcodeTotalSolved ? `${currentUser.leetcodeTotalSolved} LeetCode Solves` : 'Verified Handle'}</span>
                    {currentUser.streak > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#f0883e] font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-[#f0883e]" />
                          {currentUser.streak}d streak
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsCreateOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Practice Room
                </Button>
              </div>
            </div>

            {/* Quick Join Code Card */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#3fb950]" />
                  <h3 className="text-sm sm:text-base font-bold text-white font-sans">
                    Have an Invite Code? Join Room
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-sans">Enter 6-character room ID</span>
              </div>

              <form onSubmit={handleQuickJoin} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => {
                      setRoomCode(e.target.value.toUpperCase());
                      setJoinError('');
                      setJoinSuccess('');
                    }}
                    placeholder="ENTER ROOM CODE (e.g. 7X9K2P)"
                    maxLength={8}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm sm:text-base text-white font-mono uppercase tracking-wider focus:outline-none focus:border-[#3fb950] transition-colors placeholder-slate-500"
                  />
                </div>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shrink-0"
                >
                  Join &amp; Enter Room
                </Button>
              </form>

              {joinError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 flex items-center gap-2 font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{joinError}</span>
                </div>
              )}

              {joinSuccess && (
                <div className="text-xs text-[#3fb950] bg-[#2ea043]/15 p-2.5 rounded-lg border border-[#2ea043]/30 flex items-center gap-2 font-sans">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3fb950]" />
                  <span>{joinSuccess}</span>
                </div>
              )}
            </div>

            {/* Section 1: Active Rooms (Previously Joined or Created) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3fb950]" />
                  <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                    Your Active Practice Rooms ({myRooms.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-sans">Click any room card to open workspace</span>
              </div>

              {myRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {myRooms.map((room) => {
                    const isHost = isUserHostOfRoom(room, currentUser);
                    const isActive = room.id === activeRoomId;
                    const todayProblem =
                      room.dailyProblems.find(
                        (p) => p.date === new Date().toISOString().split('T')[0]
                      ) || room.dailyProblems[0];

                    return (
                      <div
                        key={room.id}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`bg-[#161b22] hover:bg-[#1c222b] border rounded-xl p-5 cursor-pointer transition-all space-y-3.5 group shadow-md hover:border-slate-500 ${
                          isActive
                            ? 'border-[#2ea043]/50 ring-1 ring-[#2ea043]/30'
                            : 'border-[#30363d]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base text-white font-sans truncate group-hover:text-[#3fb950] transition-colors">
                                {room.name}
                              </h4>
                              {isHost ? (
                                <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.2 rounded font-bold border border-purple-500/30 font-mono shrink-0">
                                  HOST
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 border border-slate-700">
                                  MEMBER
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-1 font-sans">
                              {room.description || 'Collaborative daily practice room.'}
                            </p>
                          </div>

                          <button
                            onClick={(e) => handleCopyCode(room.code, e)}
                            className="bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-mono text-[11px] px-2 py-1 rounded border border-[#30363d] flex items-center gap-1.5 shrink-0 transition-colors"
                            title="Copy Room Invite Code"
                            aria-label="Copy Room Code"
                          >
                            <span>{room.code}</span>
                            {copiedRoomCode === room.code ? (
                              <Check className="w-3 h-3 text-[#3fb950]" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {todayProblem ? (
                          <div className="bg-[#0d1117] px-3 py-2 rounded-lg border border-[#30363d] text-xs flex items-center justify-between">
                            <span className="text-slate-300 truncate max-w-[220px] font-sans">
                              Today's Challenge: <strong className="text-white">{todayProblem.title}</strong>
                            </span>
                            <span
                              className={`font-mono font-semibold text-[11px] ${
                                todayProblem.difficulty === 'Hard'
                                  ? 'text-rose-400'
                                  : todayProblem.difficulty === 'Medium'
                                  ? 'text-amber-400'
                                  : 'text-[#3fb950]'
                              }`}
                            >
                              {todayProblem.difficulty}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-[#0d1117] px-3 py-2 rounded-lg border border-[#30363d] text-xs text-slate-400 font-sans flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Auto-fetch daily challenge on entry</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-[#30363d]/60 pt-3">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <strong className="text-slate-200 font-sans">{room.members.length}</strong>{' '}
                              {room.members.length === 1 ? 'member' : 'members'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3.5 h-3.5 text-[#3fb950]" />
                              <strong className="text-slate-200 font-sans">{room.targetDailyGoal || 1}</strong>/day
                            </span>
                          </div>

                          <span className="text-[#3fb950] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs font-sans">
                            Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state when no joined rooms */
                <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#2ea043]/15 text-[#3fb950] flex items-center justify-center mx-auto border border-[#2ea043]/30">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="font-bold text-base text-white font-sans">No Active Practice Rooms Yet</h4>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      You haven't joined or created any rooms. Enter a room code above from a teammate, or create your own custom practice room below!
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsCreateOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Create Your First Room
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Explore Other Community Rooms (if any available) */}
            {otherRooms.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-base font-bold text-white font-sans">
                    Explore Other Community Rooms ({otherRooms.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {otherRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-[#161b22] border border-[#30363d] rounded-xl p-4.5 space-y-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm sm:text-base text-white font-sans truncate">
                            {room.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-sans">
                            {room.description || 'Collaborative daily practice room.'}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                          {room.code}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#30363d]/60">
                        <span className="text-xs text-slate-400 font-sans">
                          {room.members.length} members • {room.targetDailyGoal || 1} prob/day
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            joinRoomByCode(room.code);
                            handleSelectRoom(room.id);
                          }}
                          leftIcon={<LogIn className="w-3 h-3" />}
                        >
                          Join &amp; Enter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Daily Challenge Live Preview */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleFetchDailyPreview}
                  disabled={loadingDaily}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono font-medium"
                >
                  {loadingDaily ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Check Today's Official LeetCode Daily Challenge</span>
                </button>
              </div>

              {quickDaily && (
                <div className="p-3.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[260px] font-sans">{quickDaily.title}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        quickDaily.difficulty === 'Hard'
                          ? 'text-rose-400 border-rose-500/30'
                          : quickDaily.difficulty === 'Medium'
                          ? 'text-amber-400 border-amber-500/30'
                          : 'text-[#3fb950] border-[#2ea043]/30'
                      }`}
                    >
                      {quickDaily.difficulty}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Scheduled: {quickDaily.date}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3 Interactive Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl text-left pt-2">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2 shadow-md hover:border-slate-500 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#2ea043]/15 text-[#3fb950] flex items-center justify-center border border-[#2ea043]/30">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white font-sans">Official Daily Sync</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Auto-fetch today's official LeetCode challenge with automatic verified AC detection.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2 shadow-md hover:border-slate-500 transition-all">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Radio className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white font-sans">Real-Time Team Sync</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Instant inter-tab broadcasts and cloud database synchronization across your squad.
            </p>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2 shadow-md hover:border-slate-500 transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white font-sans">Leaderboards &amp; Streaks</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Climb the practice room ladder, earn difficulty points, and maintain daily fire streaks.
            </p>
          </div>
        </div>
      </main>

      {/* Feature Highlights Footer Bar */}
      <footer className="relative z-10 border-t border-[#30363d] py-3.5 px-4 sm:px-6 bg-[#161b22]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
            <span className="font-medium font-sans">Official LeetCode API Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-medium font-sans">Real-time Inter-Tab Broadcast</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#f0883e]" />
            <span className="font-medium font-sans">Live Rankings &amp; Fire Streaks</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRegisterMode={authDefaultRegister}
        onSuccess={() => {
          // When logged in via modal, stay on room lobby so user can pick / join / create room
          setIsAuthOpen(false);
        }}
      />
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          if (onEnterWorkspace) onEnterWorkspace();
        }}
      />
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={() => {
          if (onEnterWorkspace) onEnterWorkspace();
        }}
      />

      {/* Tour / Walkthrough Modal */}
      {tourStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setTourStep(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#21262d]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-[#30363d]">
              <Sparkles className="w-4 h-4 text-[#3fb950]" />
              <h3 className="font-bold text-sm sm:text-base text-white font-sans">How LeetTracker Works</h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ea043]/20 text-[#3fb950] flex items-center justify-center font-bold font-mono text-xs shrink-0">1</span>
                <div>
                  <strong className="text-white">Create or Join a Practice Room:</strong>
                  <p className="text-xs text-slate-400 mt-0.5">Start a private group with friends or your study circle using an invite code.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ea043]/20 text-[#3fb950] flex items-center justify-center font-bold font-mono text-xs shrink-0">2</span>
                <div>
                  <strong className="text-white">Schedule Daily DSA Challenges:</strong>
                  <p className="text-xs text-slate-400 mt-0.5">Auto-fetch today's official LeetCode challenge or post custom practice problems.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ea043]/20 text-[#3fb950] flex items-center justify-center font-bold font-mono text-xs shrink-0">3</span>
                <div>
                  <strong className="text-white">Solve, Verify &amp; Review Solutions:</strong>
                  <p className="text-xs text-slate-400 mt-0.5">Submit your solution, earn points, track streaks, and review teammates' code.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setTourStep(null)}
              >
                Got It, Let's Practice!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

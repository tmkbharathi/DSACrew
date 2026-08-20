import React, { useState } from 'react';
import { useApp, isUserHostOfRoom, isUserInRoom } from '../../context/AppContext';
import { AuthModal } from '../auth/AuthModal';
import { CreateRoomModal } from '../room/CreateRoomModal';
import { JoinRoomModal } from '../room/JoinRoomModal';
import { CozyCoderIllustration } from '../illustrations/CozyCoderIllustration';
import { fetchLeetCodeDaily, type LeetCodeDailyChallenge } from '../../services/leetcodeApi';
import {
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
  Zap,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onEnterRoom?: (roomId?: string) => void;
  onEnterWorkspace?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterRoom, onEnterWorkspace }) => {
  const {
    currentUser,
    rooms,
    communityRooms,
    activeRoomId,
    switchActiveRoom,
    joinRoomByCode,
    login,
    logout,
    setToast,
    setIsLandingView,
    theme,
    setTheme,
  } = useApp();

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
  const otherRooms = (communityRooms || []).filter((r) => !myRooms.some((mr) => mr.id === r.id));

  const handleSelectRoom = (roomId: string) => {
    switchActiveRoom(roomId);
    setIsLandingView(false);
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
      setLoginHandleInput('');
      setLoginPasswordInput('');
    } else {
      setLoginError(res.message);
    }
  };

  const handleQuickJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    const clean = roomCode.trim().toUpperCase();
    if (!clean) {
      setJoinError('Please enter a room invite code.');
      return;
    }

    const res = await joinRoomByCode(clean);
    if (res.success) {
      setJoinSuccess(res.message);
      setRoomCode('');
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

  const isIllustrative = theme === 'illustrative';

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-between overflow-y-auto relative transition-colors duration-300 ${
        isIllustrative
          ? 'bg-[#faf5ea] text-[#212d27] selection:bg-[#2d6a4f]/20 selection:text-[#1b4332]'
          : 'bg-[#0d1117] text-[#f0f6fc] selection:bg-[#2ea043]/20 selection:text-[#3fb950]'
      }`}
    >
      {/* Ambient Background Gradient Glow */}
      <div className={`absolute inset-0 pointer-events-none ${isIllustrative ? 'opacity-40' : 'hero-gradient'}`} />

      {/* Top Navigation Bar */}
      <header
        className={`relative z-20 px-4 sm:px-8 py-3.5 backdrop-blur-md shrink-0 transition-colors duration-300 ${
          isIllustrative
            ? 'bg-[#faf5ea]/90 border-b border-[#ede4d4]'
            : 'bg-[#161b22]/90 border-b border-[#30363d]'
        }`}
      >
        <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1880px] mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-colors ${
                isIllustrative
                  ? 'bg-white border border-[#ede4d4] text-[#2d6a4f]'
                  : 'bg-[#0d1117] border border-[#30363d] text-[#3fb950]'
              }`}
            >
              &lt;/&gt;
            </div>
            <span
              className={`font-extrabold text-xl tracking-tight font-sans transition-colors ${
                isIllustrative ? 'text-[#212d27]' : 'text-white'
              }`}
            >
              Leet<span className={isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}>Tracker</span>
            </span>
          </div>

          {/* Center Navigation Links (Matching Reference UI) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            <button
              onClick={() => {
                if (isLoggedIn) setIsLandingView(false);
                else {
                  setAuthDefaultRegister(false);
                  setIsAuthOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#2d6a4f]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 opacity-70" />
              <span>Rooms</span>
            </button>

            <button
              onClick={handleFetchDailyPreview}
              disabled={loadingDaily}
              className={`flex items-center gap-1.5 transition-colors ${
                isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#2d6a4f]'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Preview today's official LeetCode Challenge"
            >
              <Zap className="w-4 h-4 opacity-70 text-amber-500" />
              <span>Challenges</span>
            </button>

            <button
              onClick={() => {
                if (isLoggedIn) setIsLandingView(false);
                else {
                  setAuthDefaultRegister(false);
                  setIsAuthOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#2d6a4f]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 opacity-70 text-amber-500" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setTourStep(1)}
              className={`flex items-center gap-1.5 transition-colors ${
                isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#2d6a4f]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 opacity-70" />
              <span>About</span>
            </button>
          </nav>

          {/* Right Action Group (Theme toggle + Sign In) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isIllustrative ? 'dark' : 'illustrative')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                isIllustrative
                  ? 'bg-white hover:bg-[#f4ede0] text-[#2d6a4f] border-[#ede4d4]'
                  : 'bg-[#161b22] hover:bg-[#21262d] text-amber-400 border-[#30363d]'
              }`}
              title={`Switch to ${isIllustrative ? 'Dark Mode' : 'Illustrative Theme'}`}
            >
              {isIllustrative ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isIllustrative ? 'Dark Mode' : 'Illustrative'}</span>
            </button>

            <button
              onClick={() => setTourStep(1)}
              className={`flex md:hidden items-center justify-center w-9 h-9 rounded-xl border transition-colors ${
                isIllustrative
                  ? 'bg-white hover:bg-[#f4ede0] border-[#ede4d4] text-[#5c6b63]'
                  : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-slate-300'
              }`}
              title="How It Works / Tour"
              aria-label="How It Works"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border shadow-sm ${
                    isIllustrative
                      ? 'bg-white border-[#ede4d4]'
                      : 'bg-[#0d1117] border-[#30363d]'
                  }`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#ede4d4]"
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold hidden sm:inline">{currentUser.name}</span>
                    <span className={`text-xs font-mono ${isIllustrative ? 'text-[#2d6a4f]' : 'text-cyan-400'}`}>
                      @{currentUser.username}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className={`p-2 rounded-xl border transition-colors ${
                    isIllustrative
                      ? 'bg-white hover:bg-rose-50 border-[#ede4d4] text-slate-400 hover:text-rose-600'
                      : 'border-[#30363d] hover:bg-[#21262d] text-slate-400 hover:text-rose-400'
                  }`}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthDefaultRegister(false);
                  setIsAuthOpen(true);
                }}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${
                  isIllustrative
                    ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white active:scale-95'
                    : 'bg-[#2ea043] hover:bg-[#3fb950] text-white active:scale-95'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Center Content Canvas */}
      <main className="flex-1 relative z-10 max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1880px] mx-auto px-4 sm:px-8 flex flex-col justify-center w-full py-8 sm:py-12 2xl:py-16">
        {!isLoggedIn ? (
          /* =========================================================================
             LOGGED-OUT HERO (Matching Reference Design with Cozy Illustration)
             ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1
                className={`text-4xl sm:text-5xl xl:text-6xl font-black leading-tight tracking-tight font-sans ${
                  isIllustrative ? 'text-[#212d27]' : 'text-white'
                }`}
              >
                Crack LeetCode Together with Your{' '}
                <span className={isIllustrative ? 'text-[#2d6a4f] inline-block' : 'text-[#3fb950] inline-block'}>
                  Crew
                </span>
                .
              </h1>

              <p
                className={`text-base sm:text-lg max-w-2xl leading-relaxed font-sans ${
                  isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'
                }`}
              >
                Create collaborative practice rooms, schedule daily algorithm challenges, sync live solutions with verified LeetCode runtime metrics, and compete on room leaderboards.
              </p>

              {/* Quick Feature Highlights in Hero (Matching Reference 3-Card Design) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div
                  className={`rounded-2xl p-4 space-y-1.5 border transition-all cozy-card ${
                    isIllustrative
                      ? 'bg-white/80 border-[#ede4d4] shadow-sm'
                      : 'bg-[#161b22]/80 border-[#30363d]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#3fb950]'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className={`font-bold text-xs font-mono ${isIllustrative ? 'text-[#212d27]' : 'text-[#3fb950]'}`}>
                    Daily Challenges
                  </div>
                  <p className={`text-xs leading-snug ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                    Official daily sync &amp; difficulty points
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-4 space-y-1.5 border transition-all cozy-card ${
                    isIllustrative
                      ? 'bg-white/80 border-[#ede4d4] shadow-sm'
                      : 'bg-[#161b22]/80 border-[#30363d]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isIllustrative ? 'bg-[#e0f2fe] text-[#0284c7]' : 'bg-cyan-950/40 text-cyan-400'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className={`font-bold text-xs font-mono ${isIllustrative ? 'text-[#212d27]' : 'text-cyan-400'}`}>
                    Real-time Sync
                  </div>
                  <p className={`text-xs leading-snug ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                    Inter-tab broadcasts &amp; cloud updates
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-4 space-y-1.5 border transition-all cozy-card ${
                    isIllustrative
                      ? 'bg-white/80 border-[#ede4d4] shadow-sm'
                      : 'bg-[#161b22]/80 border-[#30363d]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isIllustrative ? 'bg-[#ffedd5] text-[#ea580c]' : 'bg-amber-950/40 text-amber-400'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className={`font-bold text-xs font-mono ${isIllustrative ? 'text-[#212d27]' : 'text-amber-400'}`}>
                    Leaderboards
                  </div>
                  <p className={`text-xs leading-snug ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                    Room streak rankings &amp; review
                  </p>
                </div>
              </div>

              {/* Cozy Developer Illustration */}
              <div className="pt-2">
                <CozyCoderIllustration className="w-full max-w-sm sm:max-w-md" />
              </div>
            </div>

            {/* Right Auth Card Column (Matching Reference Design) */}
            <div className="lg:col-span-5 w-full">
              <div
                className={`rounded-3xl p-6 sm:p-8 text-left space-y-5 transition-all shadow-xl ${
                  isIllustrative
                    ? 'bg-white border border-[#ede4d4]'
                    : 'bg-[#161b22] border border-[#30363d]'
                }`}
              >
                <div
                  className={`flex justify-between items-center pb-3.5 border-b ${
                    isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                    <h2
                      className={`text-base sm:text-lg font-bold font-sans ${
                        isIllustrative ? 'text-[#212d27]' : 'text-white'
                      }`}
                    >
                      Sign In with LeetCode
                    </h2>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                      isIllustrative
                        ? 'bg-[#f7f3eb] text-[#5c6b63] border-[#ede4d4]'
                        : 'bg-[#0d1117] text-slate-300 border-[#30363d]'
                    }`}
                  >
                    Step 1 to Access
                  </span>
                </div>

                <form onSubmit={handleHeroLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      className={`text-xs font-medium block ${
                        isIllustrative ? 'text-[#5c6b63]' : 'text-slate-200'
                      }`}
                      htmlFor="username"
                    >
                      LeetCode Username / Handle
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <span
                          className={`text-xs font-mono transition-colors ${
                            isIllustrative
                              ? 'text-slate-400 group-focus-within:text-[#2d6a4f]'
                              : 'text-slate-400 group-focus-within:text-[#3fb950]'
                          }`}
                        >
                          @
                        </span>
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
                        className={`w-full text-xs sm:text-sm font-mono rounded-xl pl-8 pr-3.5 py-3 focus:outline-none transition-all ${
                          isIllustrative
                            ? 'bg-[#f7f3eb] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                            : 'bg-[#0d1117] border border-[#30363d] text-white placeholder-slate-500 focus:border-[#3fb950]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className={`text-xs font-medium block ${
                        isIllustrative ? 'text-[#5c6b63]' : 'text-slate-200'
                      }`}
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock
                          className={`w-4 h-4 transition-colors ${
                            isIllustrative
                              ? 'text-slate-400 group-focus-within:text-[#2d6a4f]'
                              : 'text-slate-400 group-focus-within:text-[#3fb950]'
                          }`}
                        />
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
                        className={`w-full text-xs sm:text-sm rounded-xl pl-9 pr-10 py-3 focus:outline-none transition-all ${
                          isIllustrative
                            ? 'bg-[#f7f3eb] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                            : 'bg-[#0d1117] border border-[#30363d] text-white placeholder-slate-500 focus:border-[#3fb950]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 leading-relaxed font-sans">
                      {loginError}
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                        isIllustrative
                          ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                          : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
                      }`}
                    >
                      {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                      <span>{loginLoading ? 'Verifying...' : 'Sign In & Enter'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthDefaultRegister(false);
                        setIsAuthOpen(true);
                      }}
                      className={`py-3 px-4 rounded-xl font-medium text-xs sm:text-sm border transition-colors ${
                        isIllustrative
                          ? 'bg-[#f7f3eb] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                          : 'bg-[#21262d] hover:bg-[#30363d] text-white border-[#30363d]'
                      }`}
                    >
                      Options
                    </button>
                  </div>
                </form>

                <div
                  className={`pt-3.5 border-t flex justify-between items-center text-xs ${
                    isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'
                  }`}
                >
                  <span className={isIllustrative ? 'text-[#5c6b63] font-sans' : 'text-slate-300 font-sans'}>
                    New to LeetTracker?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthDefaultRegister(true);
                      setIsAuthOpen(true);
                    }}
                    className={`font-semibold font-mono hover:underline ${
                      isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'
                    }`}
                  >
                    Create Profile →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             LOGGED-IN ROOM SELECTION GATEWAY (2-Column Widescreen for 1080p & 1440p)
             ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 items-start text-left">
            {/* Left Control Column (Profile + Join by Code + Create Room) */}
            <div className="lg:col-span-5 space-y-5">
              {/* User Profile Card */}
              <div
                className={`rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 border transition-all ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4] text-[#212d27]'
                    : 'bg-[#161b22] border-[#30363d] text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#2d6a4f]/60 shadow-md"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border ${
                        isIllustrative ? 'bg-white border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
                      }`}
                    >
                      <ShieldCheck className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-lg sm:text-xl font-bold font-sans truncate ${
                          isIllustrative ? 'text-[#212d27]' : 'text-white'
                        }`}
                      >
                        {currentUser.name}
                      </h2>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                          isIllustrative
                            ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                            : 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/30'
                        }`}
                      >
                        ONLINE
                      </span>
                    </div>
                    <div
                      className={`text-xs font-mono mt-1 flex items-center gap-1.5 flex-wrap ${
                        isIllustrative ? 'text-[#2d6a4f]' : 'text-cyan-400'
                      }`}
                    >
                      <span>@{currentUser.username}</span>
                      <span>•</span>
                      <span>{currentUser.leetcodeTotalSolved ? `${currentUser.leetcodeTotalSolved} Solves` : 'Verified Handle'}</span>
                    </div>
                  </div>
                </div>

                {currentUser.streak > 0 && (
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border-[#ede4d4]'
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <span className={`font-sans flex items-center gap-1.5 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
                      <Flame className="w-4 h-4 text-[#ea580c] fill-[#ea580c]" />
                      <span>Current Daily Streak</span>
                    </span>
                    <span className="font-bold text-[#ea580c] font-mono">{currentUser.streak} consecutive days</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                    isIllustrative
                      ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                      : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Practice Room</span>
                </button>
              </div>

              {/* Join by Code Interactive Box */}
              <div
                className={`rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5 border transition-all ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                    <h3
                      className={`text-sm sm:text-base font-bold font-sans ${
                        isIllustrative ? 'text-[#212d27]' : 'text-white'
                      }`}
                    >
                      Join Room by Code
                    </h3>
                  </div>
                  <span className={`text-xs font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                    6-8 CHAR CODE
                  </span>
                </div>

                <form onSubmit={handleQuickJoin} className="space-y-3">
                  <div className="relative">
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
                      className={`w-full rounded-xl px-4 py-3 text-sm sm:text-base font-mono uppercase tracking-wider focus:outline-none transition-colors ${
                        isIllustrative
                          ? 'bg-[#f7f3eb] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                          : 'bg-[#0d1117] border border-[#30363d] text-white placeholder-slate-500 focus:border-[#3fb950]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 ${
                      isIllustrative
                        ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                        : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
                    }`}
                  >
                    <span>Join &amp; Enter Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {joinError && (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-2 font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{joinError}</span>
                  </div>
                )}

                {joinSuccess && (
                  <div className="text-xs text-[#2d6a4f] bg-[#d8f3dc] p-2.5 rounded-lg border border-[#b7e4c7] flex items-center gap-2 font-sans">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2d6a4f]" />
                    <span>{joinSuccess}</span>
                  </div>
                )}
              </div>

              {/* Official Daily Challenge Live Preview */}
              <div
                className={`rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 border transition-all ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#161b22] border-[#30363d]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleFetchDailyPreview}
                    disabled={loadingDaily}
                    className={`text-xs transition-colors flex items-center gap-1.5 font-mono font-medium ${
                      isIllustrative
                        ? 'text-[#2d6a4f] hover:text-[#1b4332]'
                        : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    {loadingDaily ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Preview Today's Official Daily Challenge</span>
                  </button>
                </div>

                {quickDaily && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border-[#ede4d4]'
                        : 'bg-[#0d1117] border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold truncate max-w-[260px] font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                        {quickDaily.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          quickDaily.difficulty === 'Hard'
                            ? 'text-rose-600 bg-rose-50 border-rose-200'
                            : quickDaily.difficulty === 'Medium'
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-[#2d6a4f] bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {quickDaily.difficulty}
                      </span>
                    </div>
                    <div className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      Scheduled: {quickDaily.date}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Rooms Display Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Users className={`w-5 h-5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                  <h3
                    className={`text-lg sm:text-xl font-bold font-sans ${
                      isIllustrative ? 'text-[#212d27]' : 'text-white'
                    }`}
                  >
                    Your Active Practice Rooms ({myRooms.length})
                  </h3>
                </div>
                <span className={`text-xs font-sans hidden sm:inline ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                  Select a room to enter workspace
                </span>
              </div>

              {myRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className={`rounded-2xl p-5 cursor-pointer transition-all space-y-3.5 group shadow-md cozy-card border ${
                          isIllustrative
                            ? isActive
                              ? 'bg-white border-[#2d6a4f] ring-2 ring-[#2d6a4f]/20'
                              : 'bg-white hover:bg-[#fffdfa] border-[#ede4d4] hover:border-[#d6cbba]'
                            : isActive
                              ? 'bg-[#161b22] border-[#2ea043]/50 ring-1 ring-[#2ea043]/30'
                              : 'bg-[#161b22] hover:bg-[#1c222b] border-[#30363d] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-bold text-base font-sans truncate transition-colors ${
                                  isIllustrative
                                    ? 'text-[#212d27] group-hover:text-[#2d6a4f]'
                                    : 'text-white group-hover:text-[#3fb950]'
                                }`}
                              >
                                {room.name}
                              </h4>
                              {isHost ? (
                                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold border border-purple-200 font-mono shrink-0">
                                  HOST
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-mono shrink-0 border border-slate-200">
                                  MEMBER
                                </span>
                              )}
                            </div>
                            <p className={`text-xs line-clamp-1 mt-1 font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                              {room.description || 'Collaborative daily practice room.'}
                            </p>
                          </div>

                          <button
                            onClick={(e) => handleCopyCode(room.code, e)}
                            className={`font-mono text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shrink-0 transition-colors ${
                              isIllustrative
                                ? 'bg-[#f7f3eb] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                                : 'bg-[#21262d] hover:bg-[#30363d] text-slate-200 border-[#30363d]'
                            }`}
                            title="Copy Room Invite Code"
                            aria-label="Copy Room Code"
                          >
                            <span>{room.code}</span>
                            {copiedRoomCode === room.code ? (
                              <Check className="w-3 h-3 text-[#2d6a4f]" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {todayProblem ? (
                          <div
                            className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between ${
                              isIllustrative
                                ? 'bg-[#fbf7ee] border-[#ede4d4]'
                                : 'bg-[#0d1117] border-[#30363d]'
                            }`}
                          >
                            <span className={`truncate max-w-[200px] font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
                              Challenge: <strong className={isIllustrative ? 'text-[#212d27]' : 'text-white'}>{todayProblem.title}</strong>
                            </span>
                            <span
                              className={`font-mono font-semibold text-[11px] ${
                                todayProblem.difficulty === 'Hard'
                                  ? 'text-rose-600'
                                  : todayProblem.difficulty === 'Medium'
                                  ? 'text-amber-700'
                                  : isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'
                              }`}
                            >
                              {todayProblem.difficulty}
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`px-3 py-2 rounded-xl border text-xs font-sans flex items-center gap-1.5 ${
                              isIllustrative
                                ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#8d9a93]'
                                : 'bg-[#0d1117] border-[#30363d] text-slate-400'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                            <span>Auto-fetch daily challenge on entry</span>
                          </div>
                        )}

                        <div
                          className={`flex items-center justify-between text-xs border-t pt-3 ${
                            isIllustrative ? 'border-[#ede4d4] text-[#5c6b63]' : 'border-[#30363d]/60 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <strong className={isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}>{room.members.length}</strong>{' '}
                              {room.members.length === 1 ? 'member' : 'members'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                              <strong className={isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}>{room.targetDailyGoal || 1}</strong>/day
                            </span>
                          </div>

                          <span
                            className={`font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs font-sans ${
                              isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'
                            }`}
                          >
                            Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state when no joined rooms */
                <div
                  className={`rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xl border ${
                    isIllustrative
                      ? 'bg-white border-[#ede4d4]'
                      : 'bg-[#161b22] border-[#30363d]'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${
                      isIllustrative
                        ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                        : 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/30'
                    }`}
                  >
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h4 className={`font-bold text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                      No Active Practice Rooms Yet
                    </h4>
                    <p className={`text-xs sm:text-sm font-sans leading-relaxed ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                      You haven't joined or created any practice rooms. Enter an invite code from your squad on the left, or create your first room!
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95 ${
                        isIllustrative
                          ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                          : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Your First Room</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Explore Other Community Rooms (if any) */}
              {otherRooms.length > 0 && (
                <div className="space-y-3.5 pt-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-base font-bold text-white font-sans">
                      Explore Other Community Rooms ({otherRooms.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherRooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4.5 space-y-3 text-left shadow-md"
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
                          <span className="font-mono text-xs text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30">
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
            </div>
          </div>
        )}
      </main>

      {/* Feature Highlights Footer Bar */}
      <footer className="relative z-10 border-t border-[#30363d] py-3.5 px-4 sm:px-8 bg-[#161b22]/90 backdrop-blur-md">
        <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1880px] mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-slate-300">
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
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setTourStep(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#21262d]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-[#30363d]">
              <Sparkles className="w-4 h-4 text-[#3fb950]" />
              <h3 className="font-bold text-base text-white font-sans">How LeetTracker Works</h3>
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  Layers,
  LogOut,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onEnterRoom?: () => void;
  onEnterWorkspace?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterRoom, onEnterWorkspace }) => {
  const { currentUser, joinRoomByCode, login, logout, setToast } = useApp();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultRegister, setAuthDefaultRegister] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(null);

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

  const handleEnter = () => {
    if (onEnterWorkspace) onEnterWorkspace();
    else if (onEnterRoom) onEnterRoom();
  };

  const handleHeroLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginHandleInput.trim()) return;

    setLoginLoading(true);
    setLoginError('');

    const res = await login(loginHandleInput.trim(), loginPasswordInput);
    setLoginLoading(false);

    if (res.success) {
      handleEnter();
    } else {
      setLoginError(res.message);
    }
  };

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!roomCode.trim()) return;

    const res = joinRoomByCode(roomCode);
    if (res.success) {
      handleEnter();
    } else {
      setJoinError(res.message);
    }
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
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEnter}
                  leftIcon={<Layers className="w-3.5 h-3.5" />}
                >
                  Workspace
                </Button>
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
      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center justify-center w-full py-10 sm:py-14 space-y-8">
        <div className="space-y-3 max-w-2xl mx-auto">
          {/* Version / Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#30363d] bg-[#161b22] shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              REAL-TIME LEETCODE ROOMS • V1.0
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight font-sans">
            Crack LeetCode Together with Your{' '}
            <span className="text-[#3fb950]">Crew</span>.
          </h1>

          {/* Hero Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed text-balance font-sans">
            Create collaborative practice rooms, post daily challenges, sync live solutions with verified LeetCode metrics, and compete on leaderboards.
          </p>
        </div>

        {/* Central Auth / Action Card */}
        {!isLoggedIn ? (
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
              {/* Username Input */}
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

              {/* Password Input */}
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

              {/* Actions */}
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
        ) : (
          /* Post-login Room Controls */
          <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-[#30363d]"
                />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    {currentUser.name}
                    <span className="bg-[#2ea043]/20 text-[#3fb950] text-[10px] px-1.5 py-0.2 rounded border border-[#2ea043]/30 font-mono">
                      Logged In
                    </span>
                  </div>
                  {currentUser.username && (
                    <div className="text-xs text-cyan-400 font-mono">@{currentUser.username}</div>
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleEnter}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                Workspace
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateOpen(true)}
                className="w-full"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Room
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsJoinOpen(true)}
                className="w-full"
                leftIcon={<Users className="w-3.5 h-3.5" />}
              >
                Join with Code
              </Button>
            </div>

            {/* Quick Code Join Form */}
            <form onSubmit={handleQuickJoin} className="flex gap-2 pt-1">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                placeholder="INVITE CODE (e.g. 7X9K2P)"
                maxLength={8}
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:border-[#3fb950] placeholder-slate-500"
              />
              <Button
                variant="secondary"
                size="sm"
                type="submit"
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                Join
              </Button>
            </form>

            {joinError && (
              <p className="text-xs text-rose-400 font-sans">{joinError}</p>
            )}

            {/* Daily Challenge Live Fetcher */}
            <div className="pt-2 border-t border-[#30363d] flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={handleFetchDailyPreview}
                disabled={loadingDaily}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 font-mono font-medium"
              >
                {loadingDaily ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Fetch Today's Official Daily</span>
              </button>
            </div>

            {quickDaily && (
              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate max-w-[200px] font-sans">{quickDaily.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    quickDaily.difficulty === 'Hard' ? 'text-rose-400 border-rose-500/30' :
                    quickDaily.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/30' :
                    'text-[#3fb950] border-[#2ea043]/30'
                  }`}>
                    {quickDaily.difficulty}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Date: {quickDaily.date}</div>
              </div>
            )}
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
        onSuccess={handleEnter}
      />
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleEnter}
      />
      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onSuccess={handleEnter}
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

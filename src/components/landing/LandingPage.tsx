import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateRoomModal } from '../room/CreateRoomModal';
import { JoinRoomModal } from '../room/JoinRoomModal';
import { AuthModal } from '../auth/AuthModal';
import { fetchLeetCodeDaily } from '../../services/leetcodeApi';
import {
  Code2,
  Sparkles,
  Zap,
  LogIn,
  Plus,
  ArrowRight,
  Bell,
  HelpCircle,
  X,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Layers,
  Lock,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

interface LandingPageProps {
  onEnterRoom?: () => void;
  onEnterWorkspace?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterRoom, onEnterWorkspace }) => {
  const { joinRoomByCode, setToast, currentUser, isLoggedIn, login, logout } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultRegister, setAuthDefaultRegister] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [loginHandleInput, setLoginHandleInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [quickDaily, setQuickDaily] = useState<any>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  const handleEnter = () => {
    if (onEnterRoom) onEnterRoom();
    if (onEnterWorkspace) onEnterWorkspace();
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
    const daily = await fetchLeetCodeDaily();
    setQuickDaily(daily);
    setLoadingDaily(false);
    setToast({
      title: "Today's Official Daily Challenge",
      message: `"${daily.title}" (${daily.difficulty})`,
      type: 'info',
    });
  };

  return (
    <div className="h-screen max-h-screen w-screen bg-[#0A0E12] text-slate-200 flex flex-col justify-between overflow-hidden relative selection:bg-[#4ade80]/20 selection:text-[#4ade80]">
      {/* Background Ambient Radial Glows */}
      <div className="absolute inset-0 pointer-events-none hero-gradient" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 border-b border-slate-800/80 px-4 sm:px-6 py-3 bg-[#101418]/80 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded border border-emerald-500/30 flex items-center justify-center bg-[#111827] shadow-sm">
              <Code2 className="w-5 h-5 text-[#4ade80]" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white font-sans">
              Leet<span className="text-[#4ade80]">Tracker</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTourStep(1)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-800/80 transition-colors text-slate-400 hover:text-white"
              title="How It Works / Tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnter}
                  className="px-4 py-2 rounded-lg bg-[#4ade80] hover:bg-[#6bfb9a] text-[#0A0E12] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Layers className="w-4 h-4" />
                  <span>Workspace</span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-rose-400"
                  title="Sign Out"
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
                className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors text-white font-medium text-xs flex items-center gap-2"
              >
                <span>Sign In</span>
                <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Center Content Canvas */}
      <main className="flex-1 relative z-10 max-w-3xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center justify-center w-full min-h-0 py-2 sm:py-3">
        {/* Version / Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-800 bg-[#181c20] mb-2 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            REAL-TIME LEETCODE ROOMS • V1.0
          </span>
        </div>

        {/* Hero Title - Scaled to prevent overlap */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-1.5 max-w-xl mx-auto leading-tight tracking-tight">
          Crack LeetCode Together with Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] to-[#38dac5]">
            Crew
          </span>
          .
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-3 text-balance">
          Create collaborative practice rooms, post daily challenges, receive live sync notifications, and compete on leaderboards.
        </p>

        {/* Central Auth / Action Card (Level 2 Glassmorphic) */}
        {!isLoggedIn ? (
          <div className="w-full max-w-sm sm:max-w-md bg-[#111827]/70 backdrop-blur-xl border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl relative glow-effect text-left">
            <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                <h2 className="text-sm sm:text-base font-semibold text-white font-sans">Sign In with LeetCode</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Step 1 to Access</span>
            </div>

            <form onSubmit={handleHeroLogin} className="space-y-2.5 sm:space-y-3">
              {/* Username Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 block" htmlFor="username">
                  LeetCode Username / Handle
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-xs font-mono text-slate-500 group-focus-within:text-[#4ade80] transition-colors">@</span>
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
                    className="w-full bg-[#111827] border border-slate-800 text-white text-xs sm:text-sm font-mono rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-all placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400 block" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-3.5 h-3.5 text-slate-500 group-focus-within:text-[#4ade80] transition-colors" />
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
                    className="w-full bg-[#111827] border border-slate-800 text-white text-xs sm:text-sm font-mono rounded-lg pl-8 pr-9 py-2 focus:outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30 leading-relaxed">
                  {loginError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-0.5">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 bg-[#4ade80] hover:bg-[#6bfb9a] text-[#0A0E12] font-semibold text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-lg transition-colors flex justify-center items-center gap-1.5 group shadow-md shadow-emerald-500/20"
                >
                  {loginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
                  <span>{loginLoading ? 'Verifying...' : 'Sign In & Enter'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthDefaultRegister(false);
                    setIsAuthOpen(true);
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors text-white font-medium text-xs whitespace-nowrap"
                >
                  More Options
                </button>
              </div>
            </form>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-[11px] sm:text-xs">
              <span className="text-slate-400 font-mono">New to LeetTracker?</span>
              <button
                type="button"
                onClick={() => {
                  setAuthDefaultRegister(true);
                  setIsAuthOpen(true);
                }}
                className="text-[#4ade80] hover:text-[#6bfb9a] transition-colors font-medium hover:underline font-mono"
              >
                Create Profile
              </button>
            </div>
          </div>
        ) : (
          /* Post-login Room Controls */
          <div className="w-full max-w-sm sm:max-w-md bg-[#111827]/70 backdrop-blur-xl border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl relative glow-effect text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500/60"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="bg-emerald-500/20 text-[#4ade80] text-[9px] px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Logged In
                    </span>
                  </div>
                  {currentUser.username && (
                    <div className="text-[10px] text-cyan-400 font-mono">@{currentUser.username}</div>
                  )}
                </div>
              </div>

              <button
                onClick={handleEnter}
                className="bg-[#4ade80] hover:bg-[#6bfb9a] text-[#0A0E12] font-bold text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20"
              >
                Enter Workspace <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full bg-[#4ade80] hover:bg-[#6bfb9a] text-[#0A0E12] font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Create New Room
              </button>

              <form onSubmit={handleQuickJoin} className="flex gap-1">
                <input
                  type="text"
                  maxLength={8}
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="Code (7X9K2P)"
                  className="w-full bg-[#111827] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono tracking-wider text-cyan-400 uppercase focus:outline-none focus:border-[#4ade80]"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  Join
                </button>
              </form>
            </div>

            {joinError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30 text-left">
                {joinError}
              </p>
            )}

            {/* Official Daily Fetcher */}
            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-end gap-2 text-[11px]">
              <button
                onClick={handleFetchDailyPreview}
                disabled={loadingDaily}
                className="text-slate-400 hover:text-cyan-400 font-medium flex items-center gap-1 transition-colors"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                {loadingDaily ? 'Fetching...' : "Fetch Today's Official Daily"}
              </button>
            </div>

            {quickDaily && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg p-2 text-left text-xs text-emerald-300 flex items-center justify-between">
                <div className="truncate mr-2">
                  <span className="font-bold text-white truncate">{quickDaily.title}</span> ({quickDaily.difficulty})
                </div>
                <a
                  href={quickDaily.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#4ade80] text-[#0A0E12] px-2 py-0.5 rounded font-bold text-[10px] hover:bg-[#6bfb9a] shrink-0"
                >
                  Solve
                </a>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Feature Bar */}
      <footer className="w-full border-t border-slate-800/80 bg-[#101418]/60 backdrop-blur-md mt-auto hidden md:block shrink-0 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-around items-center">
          <div className="flex items-center gap-3 group">
            <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-[#4ade80] transition-colors" />
            <span className="text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
              Official LeetCode Daily Sync
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex items-center gap-3 group">
            <Bell className="w-4 h-4 text-slate-400 group-hover:text-[#4ade80] transition-colors" />
            <span className="text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
              Real-time Inter-Tab Broadcast
            </span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex items-center gap-3 group">
            <Flame className="w-4 h-4 text-slate-400 group-hover:text-[#4ade80] transition-colors" />
            <span className="text-xs font-mono text-slate-400 group-hover:text-white transition-colors">
              Live Rankings &amp; Fire Streaks
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Tour Modal */}
      {tourStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setTourStep(null)} />

          <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 space-y-3.5 mx-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4ade80]" />
                <h3 className="font-bold text-base text-white">How LeetTracker Works</h3>
              </div>
              <button onClick={() => setTourStep(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {tourStep === 1 && (
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-[#4ade80] flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white">Sign In with Your LeetCode Handle</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect your LeetCode handle to auto-sync your problem solving statistics and verify daily submissions.
                </p>
              </div>
            )}

            {tourStep === 2 && (
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white">Create or Join a Practice Room</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start your own practice room or enter an invite code (like <code className="text-cyan-400 font-mono">7X9K2P</code>) to collaborate with teammates.
                </p>
              </div>
            )}

            {tourStep === 3 && (
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white">Solve, Post &amp; Climb Leaderboard</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Post daily problems or auto-fetch the official challenge, submit solutions, earn points, and build daily streaks!
                </p>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all ${
                      tourStep === step ? 'w-5 bg-[#4ade80]' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {tourStep < 3 ? (
                  <button
                    onClick={() => setTourStep(tourStep + 1)}
                    className="bg-[#4ade80] hover:bg-[#6bfb9a] text-[#0A0E12] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTourStep(null);
                      if (isLoggedIn) {
                        handleEnter();
                      } else {
                        setIsAuthOpen(true);
                      }
                    }}
                    className="bg-[#4ade80] hover:bg-[#6bfb9a] text-[#0A0E12] font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isLoggedIn ? 'Enter Workspace' : 'Sign In Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={onEnterRoom} />
      <JoinRoomModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} onSuccess={onEnterRoom} />
      <AuthModal
        isOpen={isAuthOpen}
        defaultRegisterMode={authDefaultRegister}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={onEnterRoom}
      />
    </div>
  );
};

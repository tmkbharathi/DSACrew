import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreateRoomModal } from '../room/CreateRoomModal';
import { JoinRoomModal } from '../room/JoinRoomModal';
import { AuthModal } from '../auth/AuthModal';
import { fetchLeetCodeDaily } from '../../services/leetcodeApi';
import {
  Code2,
  Sparkles,
  Trophy,
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
} from 'lucide-react';

interface LandingPageProps {
  onEnterRoom: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterRoom }) => {
  const { joinRoomByCode, setToast, currentUser, isLoggedIn, login, logout } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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
      onEnterRoom();
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
      onEnterRoom();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Dynamic Ambient Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-gradient-to-bl from-cyan-500/10 via-emerald-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-20 border-b border-slate-800/80 px-6 py-4 backdrop-blur-md bg-slate-950/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight font-mono text-white">
              Leet<span className="text-emerald-400">Tracker</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTourStep(1)}
              className="text-xs text-slate-300 hover:text-emerald-400 font-semibold px-3 py-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Take a Tour
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterRoom}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Layers className="w-4 h-4" />
                  Workspace
                </button>
                <button
                  onClick={logout}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 font-semibold text-xs px-3 py-2 rounded-xl transition-all border border-slate-700 flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center justify-center">
        {/* AxionSync Style Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-lg shadow-emerald-500/10 glow-emerald animate-pulse-subtle">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          REAL-TIME LEETCODE ROOMS • V1.0
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          Crack LeetCode Together with Your <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Crew</span>.
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-5 leading-relaxed">
          Create collaborative practice rooms, post daily coding challenges, receive live inter-tab notifications, mark solutions, and compete on your group leaderboard.
        </p>

        {/* Central Action Capsule: Login first, or Room controls once logged in */}
        {!isLoggedIn ? (
          /* Pre-login Hero Card: Direct LeetCode Sign In */
          <div className="w-full max-w-lg glass-panel bg-slate-900/95 border border-slate-800 rounded-2xl p-6 mt-9 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Sign In with LeetCode</h3>
              </div>
              <span className="text-xs text-slate-400">Step 1 to Access Workspace</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your LeetCode handle to sync your stats, join practice rooms, and track daily solutions.
            </p>

            <form onSubmit={handleHeroLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">LeetCode Handle / Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-500 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={loginHandleInput}
                    onChange={(e) => {
                      setLoginHandleInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="e.g. tourist or neal_wu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPasswordInput}
                    onChange={(e) => {
                      setLoginPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
                  {loginError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all glow-emerald"
                >
                  {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {loginLoading ? 'Verifying on LeetCode...' : 'Sign In & Enter'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-3 rounded-xl border border-slate-700 transition-colors shrink-0"
                >
                  More Options
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Don't have a handle yet?</span>
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Create Profile
              </button>
            </div>
          </div>
        ) : (
          /* Post-login Room Controls: ONLY shown once successfully logged in */
          <div className="w-full max-w-xl glass-panel bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mt-9 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-left">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500/60"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {currentUser.name}
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Logged In
                    </span>
                  </div>
                  {currentUser.username && (
                    <div className="text-[10px] text-cyan-400 font-mono">@{currentUser.username}</div>
                  )}
                </div>
              </div>

              <button
                onClick={onEnterRoom}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1"
              >
                Enter Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all glow-emerald"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Create New Room
              </button>

              <form onSubmit={handleQuickJoin} className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={roomCode}
                  onChange={(e) => {
                    setRoomCode(e.target.value.toUpperCase());
                    setJoinError('');
                  }}
                  placeholder="Room Code (7X9K2P)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-mono tracking-wider text-cyan-400 uppercase focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  Join
                </button>
              </form>
            </div>

            {joinError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-500/30 text-left">
                {joinError}
              </p>
            )}

            {/* Official Daily Fetcher */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2 flex-wrap text-xs">
              <button
                onClick={handleFetchDailyPreview}
                disabled={loadingDaily}
                className="text-slate-400 hover:text-cyan-400 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                {loadingDaily ? 'Fetching...' : "Fetch Today's Official Daily"}
              </button>
            </div>

            {quickDaily && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 text-left text-xs text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{quickDaily.title}</span> ({quickDaily.difficulty})
                  <div className="text-[10px] text-slate-400">{quickDaily.tags.join(', ')}</div>
                </div>
                <a
                  href={quickDaily.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-lg font-bold text-[11px] hover:bg-emerald-400"
                >
                  Solve
                </a>
              </div>
            )}
          </div>
        )}

        {/* 3 AxionSync Style Feature Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-16 text-left">
          {/* Feature 1 */}
          <div className="glass-panel bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">Daily LeetCode Challenge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Post custom problems or auto-fetch today's official LeetCode problem. Track target completion times and difficulty levels.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">Real-time Inter-Tab Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              BroadcastChannel engine notifies room members instantly across open browser tabs when a problem is posted or resolved.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">Streaks & Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn points for problem completions, build daily fire streaks, view completion grid matrix, and analyze Recharts performance statistics.
            </p>
          </div>
        </div>
      </main>

      {/* Interactive Tour Modal */}
      {tourStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setTourStep(null)} />

          <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg text-white">How LeetTracker Works</h3>
              </div>
              <button onClick={() => setTourStep(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {tourStep === 1 && (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h4 className="font-bold text-base text-white">Sign In with Your LeetCode Handle</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect your LeetCode handle to auto-sync your problem solving statistics and verify daily submissions.
                </p>
              </div>
            )}

            {tourStep === 2 && (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h4 className="font-bold text-base text-white">Create or Join a Practice Room</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start your own practice room or enter an invite code (like <code className="text-cyan-400 font-mono">7X9K2P</code>) to collaborate with teammates.
                </p>
              </div>
            )}

            {tourStep === 3 && (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h4 className="font-bold text-base text-white">Solve, Post & Climb Leaderboard</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Post daily problems or auto-fetch the official challenge, submit solutions, earn points, and build daily streaks!
                </p>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <div className="flex gap-1">
                {[1, 2, 3].map((step) => (
                  <span
                    key={step}
                    className={`w-2 h-2 rounded-full transition-all ${
                      tourStep === step ? 'w-6 bg-emerald-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {tourStep < 3 ? (
                  <button
                    onClick={() => setTourStep(tourStep + 1)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1"
                  >
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTourStep(null);
                      if (isLoggedIn) {
                        onEnterRoom();
                      } else {
                        setIsAuthOpen(true);
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1"
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
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={onEnterRoom} />
    </div>
  );
};

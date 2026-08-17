import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { DailyProblemHero } from './components/problem/DailyProblemHero';
import { ProblemHistory } from './components/problem/ProblemHistory';
import { ProblemDiscussion } from './components/problem/ProblemDiscussion';
import { LeaderboardTable } from './components/leaderboard/LeaderboardTable';
import { CompletionMatrix } from './components/leaderboard/CompletionMatrix';
import { AnalyticsCharts } from './components/leaderboard/AnalyticsCharts';
import { ToastContainer } from './components/notifications/ToastContainer';
import { CreateRoomModal } from './components/room/CreateRoomModal';
import { Flame, Trophy, ShieldCheck, Zap, Layers, Plus, RotateCcw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeRoom, currentUser, isLoggedIn, resetDemoData } = useApp();
  const [showLanding, setShowLanding] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    (window as any).__setLandingView = (show: boolean) => setShowLanding(show);
  }, []);

  if (!isLoggedIn || showLanding) {
    return <LandingPage onEnterRoom={() => setShowLanding(false)} />;
  }

  // Handle case where activeRoom is missing / all rooms deleted
  if (!activeRoom) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md glass-panel bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">No Practice Rooms Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All rooms have been deleted. You can create a new room or restore the default workspace.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> Create Room
              </button>
              <button
                onClick={resetDemoData}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Restore Default Room
              </button>
            </div>
          </div>
        </div>
        <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        <ToastContainer />
      </div>
    );
  }

  const activeProblem = activeRoom.dailyProblems.find((p) => p.id === activeRoom.activeProblemId) || activeRoom.dailyProblems[0];

  return (
    <div className="min-h-screen bg-[#101418] text-[#e0e2e8] flex flex-col font-sans selection:bg-[#4ade80]/20 selection:text-[#4ade80]">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row pt-[60px] sm:pt-[72px] min-h-screen md:h-screen md:overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 bg-[#101418] overflow-y-auto p-3.5 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 md:gap-8 relative min-w-0 pb-16 md:pb-8">
          {/* Top Quick Stats Grid (Compact Slim Section) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 relative z-10">
            {/* 1. STREAK */}
            <div className="bg-[#1c2024] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 border border-[#3d4a3e] flex items-center gap-2.5 shadow-sm hover:border-[#ea580c]/40 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 border border-[#ea580c]/20">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#ea580c] text-[#ea580c]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold leading-tight">STREAK</div>
                <div className="text-xs sm:text-sm font-bold text-[#ea580c] font-sans truncate leading-tight mt-0.5">
                  {currentUser.streak} Days
                </div>
              </div>
            </div>

            {/* 2. POINTS */}
            <div className="bg-[#1c2024] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 border border-[#3d4a3e] flex items-center gap-2.5 shadow-sm hover:border-[#eab308]/40 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#eab308]/10 text-[#eab308] flex items-center justify-center shrink-0 border border-[#eab308]/20">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#eab308]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold leading-tight">POINTS</div>
                <div className="text-xs sm:text-sm font-bold text-[#eab308] font-sans truncate leading-tight mt-0.5">
                  {currentUser.points} pts
                </div>
              </div>
            </div>

            {/* 3. SOLVED */}
            <div className="bg-[#1c2024] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 border border-[#3d4a3e] flex items-center gap-2.5 shadow-sm hover:border-[#4ade80]/40 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4ade80]/10 text-[#4ade80] flex items-center justify-center shrink-0 border border-[#4ade80]/20">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4ade80]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold leading-tight">SOLVED</div>
                <div className="text-xs sm:text-sm font-bold text-[#4ade80] font-sans truncate leading-tight mt-0.5">
                  {currentUser.solvedCount}
                </div>
              </div>
            </div>

            {/* 4. TODAY */}
            <div className="bg-[#1c2024] rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 border border-[#3d4a3e] flex items-center gap-2.5 shadow-sm hover:border-[#3b82f6]/40 transition-colors">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center shrink-0 border border-[#3b82f6]/20">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3b82f6]" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold leading-tight">TODAY</div>
                <div className={`text-xs sm:text-sm font-bold font-sans truncate leading-tight mt-0.5 ${currentUser.solvedToday ? 'text-[#4ade80]' : 'text-slate-300'}`}>
                  {currentUser.solvedToday ? '✓ Solved' : 'Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <DailyProblemHero problem={activeProblem} />
              <LeaderboardTable />
              <ProblemDiscussion problem={activeProblem} />
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6 sm:space-y-8">
              <LeaderboardTable />
              <CompletionMatrix />
              <AnalyticsCharts />
            </div>
          )}

          {activeTab === 'history' && <ProblemHistory />}

          {activeTab === 'discussion' && <ProblemDiscussion problem={activeProblem} />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;

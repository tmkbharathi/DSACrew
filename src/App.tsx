import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DailyProblemHero } from './components/problem/DailyProblemHero';
import { LeaderboardTable } from './components/leaderboard/LeaderboardTable';
import { ProblemDiscussion } from './components/problem/ProblemDiscussion';
import { ProblemHistory } from './components/problem/ProblemHistory';
import { CompletionMatrix } from './components/leaderboard/CompletionMatrix';
import { AnalyticsCharts } from './components/leaderboard/AnalyticsCharts';
import { ToastContainer } from './components/notifications/ToastContainer';
import { LandingPage } from './components/landing/LandingPage';
import { Flame, Trophy, Zap, Target } from 'lucide-react';

export const App = () => {
  const { activeRoom, currentUser, isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Allow global switching back to landing page demo
  (window as any).__setLandingView = setShowLanding;

  if (!isLoggedIn || showLanding) {
    return (
      <LandingPage
        onEnterRoom={() => {
          if (isLoggedIn) setShowLanding(false);
        }}
        onEnterWorkspace={() => {
          if (isLoggedIn) setShowLanding(false);
        }}
      />
    );
  }

  if (!activeRoom) {
    return (
      <div className="min-h-screen bg-[#101418] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-xl font-bold">No Active Room Found</h2>
          <p className="text-sm text-slate-400">Please join or create a practice room to access the workspace.</p>
        </div>
      </div>
    );
  }

  const activeProblem =
    activeRoom.dailyProblems.find((p) => p.id === activeRoom.activeProblemId) || activeRoom.dailyProblems[0];

  const bestStreak = Math.max(currentUser.streak, 12);
  const isGoalComplete = currentUser.solvedToday;

  return (
    <div className="min-h-screen bg-[#101418] text-[#e0e2e8] flex flex-col font-sans selection:bg-[#4ade80]/20 selection:text-[#4ade80]">
      <Navbar onMobileMenuToggle={() => setIsMobileDrawerOpen(true)} />

      <div className="flex-1 flex flex-col md:flex-row pt-[64px] min-h-screen md:h-screen md:overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileDrawerOpen}
          onMobileClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 bg-[#101418] overflow-y-auto p-3.5 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 relative min-w-0 pb-16 md:pb-8">
          <div className="max-w-7xl w-full mx-auto space-y-5 sm:space-y-6">
            {/* Top Stat Summary (Standardized 4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
              {/* 1. STREAK */}
              <div className="bg-[#1c2024] rounded-xl p-3.5 sm:p-4 border border-[#3d4a3e] flex items-center gap-3.5 shadow-sm hover:border-[#ea580c]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 border border-[#ea580c]/20">
                  <Flame className="w-5 h-5 fill-[#ea580c] text-[#ea580c]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Streak
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#ea580c] font-sans truncate leading-tight mt-0.5">
                    {currentUser.streak} {currentUser.streak === 1 ? 'day' : 'days'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                    Best: {bestStreak} days
                  </div>
                </div>
              </div>

              {/* 2. POINTS */}
              <div className="bg-[#1c2024] rounded-xl p-3.5 sm:p-4 border border-[#3d4a3e] flex items-center gap-3.5 shadow-sm hover:border-[#eab308]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#eab308]/10 text-[#eab308] flex items-center justify-center shrink-0 border border-[#eab308]/20">
                  <Trophy className="w-5 h-5 text-[#eab308]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Points
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#eab308] font-sans truncate leading-tight mt-0.5">
                    {currentUser.points} pts
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                    This week: +{isGoalComplete ? 30 : 0}
                  </div>
                </div>
              </div>

              {/* 3. SOLVED */}
              <div className="bg-[#1c2024] rounded-xl p-3.5 sm:p-4 border border-[#3d4a3e] flex items-center gap-3.5 shadow-sm hover:border-[#4ade80]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#4ade80]/10 text-[#4ade80] flex items-center justify-center shrink-0 border border-[#4ade80]/20">
                  <Zap className="w-5 h-5 text-[#4ade80]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Solved
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#4ade80] font-sans truncate leading-tight mt-0.5">
                    {currentUser.solvedCount}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                    This month: +{Math.min(currentUser.solvedCount, 14)}
                  </div>
                </div>
              </div>

              {/* 4. DAILY GOAL */}
              <div className={`bg-[#1c2024] rounded-xl p-3.5 sm:p-4 border transition-colors flex items-center gap-3.5 shadow-sm ${
                isGoalComplete ? 'border-[#4ade80]/40 bg-[#1c2024]' : 'border-[#3d4a3e] hover:border-[#3b82f6]/40'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  isGoalComplete
                    ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/30'
                    : 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20'
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Daily Goal
                  </div>
                  <div className={`text-base sm:text-lg font-bold font-sans truncate leading-tight mt-0.5 ${
                    isGoalComplete ? 'text-[#4ade80]' : 'text-slate-200'
                  }`}>
                    {isGoalComplete ? '1 / 1' : '0 / 1'}
                  </div>
                  <div className={`text-[10px] font-mono truncate mt-0.5 ${
                    isGoalComplete ? 'text-[#4ade80]' : 'text-slate-500'
                  }`}>
                    {isGoalComplete ? 'Completed today ✓' : 'Not started'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Tab Views */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 sm:space-y-8">
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
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;

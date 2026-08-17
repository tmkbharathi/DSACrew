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

  // Allow global switching back to landing page overview
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
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-xl font-bold">No Active Room Found</h2>
          <p className="text-sm text-slate-400">Please join or create a practice room to access the workspace.</p>
        </div>
      </div>
    );
  }

  const activeProblem =
    activeRoom.dailyProblems.find((p) => p.id === activeRoom.activeProblemId) || activeRoom.dailyProblems[0];

  const isGoalComplete = currentUser.solvedToday;

  // Dynamically calculate metrics from actual room submissions
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const pointsThisWeek = activeRoom.dailyProblems.reduce((sum, p) => {
    const pDate = new Date(p.date + 'T00:00:00');
    const userSub = p.submissions.find((s) => s.userId === currentUser.id);
    if (pDate >= weekStart && userSub) {
      return sum + (p.difficulty === 'Hard' ? 100 : p.difficulty === 'Medium' ? 60 : 30);
    }
    return sum;
  }, 0);

  const roomSolvesCount = currentUser.roomSolvedCount ?? currentUser.solvedCount ?? 0;
  const targetGoal = activeRoom.targetDailyGoal || 1;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col font-sans selection:bg-[#2ea043]/20 selection:text-[#3fb950]">
      <Navbar onMobileMenuToggle={() => setIsMobileDrawerOpen(true)} />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileDrawerOpen}
          onMobileClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 bg-[#0d1117] overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6 relative min-w-0 pb-16 md:pb-8">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            {/* Top Stat Summary (Standardized 4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 relative z-10">
              {/* 1. STREAK */}
              <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] flex items-center gap-3.5 shadow-sm hover:border-[#f0883e]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#f0883e]/10 text-[#f0883e] flex items-center justify-center shrink-0 border border-[#f0883e]/20">
                  <Flame className="w-5 h-5 fill-[#f0883e] text-[#f0883e]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-400">
                    Streak
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#f0883e] font-sans truncate leading-tight mt-0.5">
                    {currentUser.streak} {currentUser.streak === 1 ? 'day' : 'days'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    Current: {currentUser.streak}d
                  </div>
                </div>
              </div>

              {/* 2. POINTS */}
              <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] flex items-center gap-3.5 shadow-sm hover:border-[#d29922]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#d29922]/10 text-[#d29922] flex items-center justify-center shrink-0 border border-[#d29922]/20">
                  <Trophy className="w-5 h-5 text-[#d29922]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-400">
                    Points
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#d29922] font-sans truncate leading-tight mt-0.5">
                    {currentUser.points} pts
                  </div>
                  <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    This week: +{pointsThisWeek} pts
                  </div>
                </div>
              </div>

              {/* 3. SOLVED */}
              <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] flex items-center gap-3.5 shadow-sm hover:border-[#3fb950]/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#2ea043]/10 text-[#3fb950] flex items-center justify-center shrink-0 border border-[#2ea043]/20">
                  <Zap className="w-5 h-5 text-[#3fb950]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-400">
                    Room Solves
                  </div>
                  <div className="text-base sm:text-lg font-bold text-[#3fb950] font-sans truncate leading-tight mt-0.5">
                    {roomSolvesCount}
                  </div>
                  <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                    {currentUser.leetcodeTotalSolved ? `LeetCode: ${currentUser.leetcodeTotalSolved}` : 'Room Problems'}
                  </div>
                </div>
              </div>

              {/* 4. DAILY GOAL */}
              <div className={`bg-[#161b22] rounded-xl p-4 border transition-colors flex items-center gap-3.5 shadow-sm ${
                isGoalComplete ? 'border-[#2ea043]/40' : 'border-[#30363d] hover:border-[#58a6ff]/40'
              }`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                  isGoalComplete
                    ? 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/30'
                    : 'bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/20'
                }`}>
                  <Target className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-400">
                    Daily Goal
                  </div>
                  <div className={`text-base sm:text-lg font-bold font-sans truncate leading-tight mt-0.5 ${
                    isGoalComplete ? 'text-[#3fb950]' : 'text-slate-200'
                  }`}>
                    {isGoalComplete ? 1 : 0} / {targetGoal}
                  </div>
                  <div className={`text-xs truncate mt-0.5 ${
                    isGoalComplete ? 'text-[#3fb950] font-medium' : 'text-slate-500 font-mono'
                  }`}>
                    {isGoalComplete ? 'Completed today' : 'Not started'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Tab Views */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <DailyProblemHero problem={activeProblem} />
                <LeaderboardTable />
                <ProblemDiscussion problem={activeProblem} />
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
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

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
import { SpiderCrawler } from './components/fun/SpiderCrawler';
import { SnakeGameModal } from './components/fun/SnakeGameModal';
import { Flame, Trophy, Zap, Target, Users, TrendingUp } from 'lucide-react';

export const App = () => {
  const { activeRoom, currentUser, isLoggedIn, isLandingView, setIsLandingView, theme } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSnakeOpen, setIsSnakeOpen] = useState(false);

  const isIllustrative = theme === 'illustrative';

  if (!isLoggedIn || isLandingView || !activeRoom) {
    return (
      <LandingPage
        onEnterRoom={(roomId) => {
          if (roomId) {
            // Room already selected via switchActiveRoom
          }
          if (isLoggedIn) setIsLandingView(false);
        }}
        onEnterWorkspace={() => {
          if (isLoggedIn) setIsLandingView(false);
        }}
      />
    );
  }

  // Calculate dynamic data
  const todayStr = new Date().toISOString().split('T')[0];
  const activeProblem =
    activeRoom.dailyProblems.find((p) => p.id === activeRoom.activeProblemId) ||
    activeRoom.dailyProblems.find((p) => p.date === todayStr) ||
    activeRoom.dailyProblems[0];

  const isGoalComplete =
    activeProblem?.submissions?.some((s) => s.userId === currentUser.id && s.status === 'Accepted') ||
    currentUser.solvedToday;

  const pointsThisWeek = activeRoom.dailyProblems.reduce((sum, p) => {
    const userSub = p.submissions.find((s) => s.userId === currentUser.id && s.status === 'Accepted');
    if (userSub) {
      return sum + (p.difficulty === 'Hard' ? 100 : p.difficulty === 'Medium' ? 60 : 30);
    }
    return sum;
  }, 0);

  const roomSolvesCount = currentUser.roomSolvedCount ?? currentUser.solvedCount ?? 0;
  const targetGoal = activeRoom.targetDailyGoal || 1;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isIllustrative
          ? 'bg-[#fbf7ee] text-[#212d27] selection:bg-[#2d6a4f]/20 selection:text-[#1b4332]'
          : 'bg-[#0d1117] text-[#f0f6fc] selection:bg-[#2ea043]/20 selection:text-[#3fb950]'
      }`}
    >
      <Navbar onMobileMenuToggle={() => setIsMobileDrawerOpen(true)} />

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileDrawerOpen}
          onMobileClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Dynamic Main Workspace View */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 2xl:p-10 flex flex-col gap-6 relative min-w-0 pb-16 md:pb-8 transition-colors duration-200 ${
            isIllustrative ? 'bg-[#fbf7ee]' : 'bg-[#0d1117]'
          }`}
        >
          <div className="max-w-7xl xl:max-w-[1500px] 2xl:max-w-[1880px] w-full mx-auto space-y-6 2xl:space-y-8">
            {/* Top Stat Summary (Standardized 4 Cards with Character Stickers) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 2xl:gap-6 relative z-10">
              {/* 1. STREAK */}
              <div
                className={`rounded-2xl p-4 sm:p-5 border flex items-center justify-between gap-3 shadow-sm transition-all cozy-card ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#f0883e]/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIllustrative
                        ? 'bg-[#ffedd5] text-[#ea580c] border-[#fed7aa]'
                        : 'bg-[#f0883e]/10 text-[#f0883e] border-[#f0883e]/20'
                    }`}
                  >
                    <Flame className="w-5 h-5 2xl:w-6 2xl:h-6 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs 2xl:text-sm font-medium ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                      Streak
                    </div>
                    <div className="text-base sm:text-lg 2xl:text-xl font-bold text-[#ea580c] font-sans truncate leading-tight mt-0.5">
                      {currentUser.streak} {currentUser.streak === 1 ? 'day' : 'days'}
                    </div>
                    <div className={`text-xs truncate mt-0.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      {currentUser.streak > 0 ? 'Keep it up! 🔥' : 'Solve today to start!'}
                    </div>
                  </div>
                </div>

                {isIllustrative && (
                  <div className="text-3xl shrink-0 select-none hidden sm:block">
                    👦
                  </div>
                )}
              </div>

              {/* 2. POINTS */}
              <div
                className={`rounded-2xl p-4 sm:p-5 border flex items-center justify-between gap-3 shadow-sm transition-all cozy-card ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#d29922]/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIllustrative
                        ? 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]'
                        : 'bg-[#d29922]/10 text-[#d29922] border-[#d29922]/20'
                    }`}
                  >
                    <Trophy className="w-5 h-5 2xl:w-6 2xl:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs 2xl:text-sm font-medium ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                      Points
                    </div>
                    <div className="text-base sm:text-lg 2xl:text-xl font-bold text-[#d97706] font-sans truncate leading-tight mt-0.5">
                      {currentUser.points} pts
                    </div>
                    <div className={`text-xs truncate mt-0.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      {pointsThisWeek > 0 ? `This week: +${pointsThisWeek} pts` : 'Earn +30 to +100'}
                    </div>
                  </div>
                </div>

                {isIllustrative && (
                  <div className="text-2xl shrink-0 select-none text-amber-400 hidden sm:block">
                    ✨
                  </div>
                )}
              </div>

              {/* 3. SOLVED */}
              <div
                className={`rounded-2xl p-4 sm:p-5 border flex items-center justify-between gap-3 shadow-sm transition-all cozy-card ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-[#3fb950]/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIllustrative
                        ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                        : 'bg-[#2ea043]/10 text-[#3fb950] border-[#2ea043]/20'
                    }`}
                  >
                    <Zap className="w-5 h-5 2xl:w-6 2xl:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs 2xl:text-sm font-medium ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                      Room Solves
                    </div>
                    <div className={`text-base sm:text-lg 2xl:text-xl font-bold font-sans truncate leading-tight mt-0.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`}>
                      {roomSolvesCount}
                    </div>
                    <div className={`text-xs truncate mt-0.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      {activeRoom.dailyProblems.length} challenges passed
                    </div>
                  </div>
                </div>

                {isIllustrative && (
                  <div className="text-3xl shrink-0 select-none hidden sm:block">
                    👧
                  </div>
                )}
              </div>

              {/* 4. DAILY GOAL */}
              <div
                className={`rounded-2xl p-4 sm:p-5 border flex items-center justify-between gap-3 shadow-sm transition-all cozy-card ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#161b22] border-[#30363d] hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIllustrative
                        ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    }`}
                  >
                    <Target className="w-5 h-5 2xl:w-6 2xl:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs 2xl:text-sm font-medium ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                      Daily Goal
                    </div>
                    <div
                      className={`text-base sm:text-lg 2xl:text-xl font-bold font-sans truncate leading-tight mt-0.5 ${
                        isGoalComplete
                          ? (isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]')
                          : 'text-amber-500'
                      }`}
                    >
                      {isGoalComplete ? `${targetGoal} / ${targetGoal} Met! 🎉` : `0 / ${targetGoal} Pending`}
                    </div>
                    <div className={`text-xs truncate mt-0.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      {isGoalComplete ? 'Daily target achieved' : 'Solve today to achieve'}
                    </div>
                  </div>
                </div>

                {isIllustrative && (
                  <div className="text-3xl shrink-0 select-none hidden sm:block">
                    🧑‍💻
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Tab Views */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <DailyProblemHero problem={activeProblem} />
                
                {/* 2-Column Responsive Workspace Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-6">
                    <LeaderboardTable />
                  </div>
                  <div className="lg:col-span-6">
                    <ProblemDiscussion problem={activeProblem} />
                  </div>
                </div>

                {/* Bottom Collaborative Highlights Banner */}
                <div
                  className={`rounded-2xl p-5 sm:p-6 border flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm transition-all ${
                    isIllustrative
                      ? 'bg-gradient-to-r from-[#fbf7ee] via-white to-[#f4fbf6] border-[#ede4d4]'
                      : 'bg-[#161b22] border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#d8f3dc] border border-[#b7e4c7] flex items-center justify-center text-3xl shrink-0 shadow-inner">
                      🙌
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm sm:text-base font-sans ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`}>
                        Collaborate. Practice. Grow.
                      </h4>
                      <p className={`text-xs mt-0.5 leading-relaxed ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                        Solve problems together in real-time and become a better coder as a crew.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isIllustrative ? 'bg-white border-[#ede4d4] shadow-sm' : 'bg-[#0d1117] border-[#30363d]'}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <strong className={`block ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>Real-time Collaboration</strong>
                        <span className={isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}>Work together in room</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isIllustrative ? 'bg-white border-[#ede4d4] shadow-sm' : 'bg-[#0d1117] border-[#30363d]'}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <strong className={`block ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>Track Progress</strong>
                        <span className={isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}>Monitor streaks &amp; solves</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isIllustrative ? 'bg-white border-[#ede4d4] shadow-sm' : 'bg-[#0d1117] border-[#30363d]'}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#d97706] flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <strong className={`block ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>Compete &amp; Climb</strong>
                        <span className={isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}>Climb room rankings</span>
                      </div>
                    </div>
                  </div>
                </div>
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

      <SpiderCrawler onOpenSnakeGame={() => setIsSnakeOpen(true)} />
      <SnakeGameModal isOpen={isSnakeOpen} onClose={() => setIsSnakeOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default App;

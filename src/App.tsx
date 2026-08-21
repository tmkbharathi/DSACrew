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
import { getLocalTodayStr } from './utils/dateUtils';

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
  const todayStr = getLocalTodayStr();
  const activeProblem =
    activeRoom.dailyProblems.find((p) => p.id === activeRoom.activeProblemId) ||
    activeRoom.dailyProblems.find((p) => p.date === todayStr);

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
            {/* Dynamic Tab Views */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <DailyProblemHero problem={activeProblem} />
                
                {/* Vertical Workspace Layout: Leaderboard on top, Discussion below */}
                <div className="space-y-6">
                  <LeaderboardTable />
                  <ProblemDiscussion problem={activeProblem} />
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

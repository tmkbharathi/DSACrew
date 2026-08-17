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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace View */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Top Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-orange-400 fill-orange-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Current Streak</div>
                <div className="text-base font-black text-orange-400">{currentUser.streak} Days</div>
              </div>
            </div>

            <div className="glass-panel bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Points</div>
                <div className="text-base font-black text-amber-400">{currentUser.points} pts</div>
              </div>
            </div>

            <div className="glass-panel bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Problems Solved</div>
                <div className="text-base font-black text-emerald-400">{currentUser.solvedCount}</div>
              </div>
            </div>

            <div className="glass-panel bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Today Status</div>
                <div className={`text-xs font-black ${currentUser.solvedToday ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {currentUser.solvedToday ? '✓ Completed' : 'Pending Solved'}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Views */}
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

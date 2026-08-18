import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SubmitSolutionModal } from './SubmitSolutionModal';
import { PostProblemModal } from './PostProblemModal';
import {
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Dices,
  Sparkles,
  Trash2,
  Users,
  Code2,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  Code,
  Eye,
  EyeOff,
} from 'lucide-react';
import { fetchLeetCodeDaily } from '../../services/leetcodeApi';
import type { Problem } from '../../types';

interface DailyProblemHeroProps {
  problem?: Problem;
}

const RANDOM_BANK = [
  {
    title: 'Two Sum',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy' as const,
    tags: ['Array', 'Hash Table'],
    targetTimeMinutes: 20,
  },
  {
    title: 'Add Two Numbers',
    url: 'https://leetcode.com/problems/add-two-numbers/',
    difficulty: 'Medium' as const,
    tags: ['Linked List', 'Math', 'Recursion'],
    targetTimeMinutes: 30,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'Medium' as const,
    tags: ['Hash Table', 'String', 'Sliding Window'],
    targetTimeMinutes: 30,
  },
  {
    title: 'Trapping Rain Water',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard' as const,
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'],
    targetTimeMinutes: 45,
  },
  {
    title: 'Merge k Sorted Lists',
    url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    difficulty: 'Hard' as const,
    tags: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)'],
    targetTimeMinutes: 45,
  },
];

export const DailyProblemHero: React.FC<DailyProblemHeroProps> = ({ problem: initialProblem }) => {
  const { currentUser, activeRoom, deleteProblem, postDailyProblem, setActiveProblemId, setToast, isHost } = useApp();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialProblem?.date || getTodayStr());
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [loadingDailyFetch, setLoadingDailyFetch] = useState(false);
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState<{ name: string; code: string; lang: string } | null>(null);
  const [isCardHidden, setIsCardHidden] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('leettracker_hide_daily_hero');
      if (saved !== null) {
        return saved === 'true';
      }
      return true; // Default is hidden
    } catch {
      return true;
    }
  });

  const toggleHideCard = () => {
    setIsCardHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('leettracker_hide_daily_hero', String(next));
      } catch {}
      return next;
    });
  };

  const todayStr = getTodayStr();

  // Find all problems in room and on selectedDate
  const allProblems = activeRoom?.dailyProblems || [];
  const problemsOnDate = activeRoom?.dailyProblems.filter((p) => p.date === selectedDate) || [];
  const activeProblem =
    problemsOnDate.find((p) => p.id === activeRoom?.activeProblemId) ||
    problemsOnDate[0] ||
    allProblems.find((p) => p.id === activeRoom?.activeProblemId) ||
    allProblems[0] ||
    (selectedDate === todayStr ? initialProblem : undefined);

  const currentProblemIndex = allProblems.findIndex((p) => p.id === activeProblem?.id);

  const handlePrevProblem = () => {
    if (allProblems.length <= 1) return;
    const prevIdx = currentProblemIndex > 0 ? currentProblemIndex - 1 : allProblems.length - 1;
    const prevProb = allProblems[prevIdx];
    if (prevProb) {
      setSelectedDate(prevProb.date);
      setActiveProblemId(prevProb.id);
    }
  };

  const handleNextProblem = () => {
    if (allProblems.length <= 1) return;
    const nextIdx = currentProblemIndex >= 0 && currentProblemIndex < allProblems.length - 1 ? currentProblemIndex + 1 : 0;
    const nextProb = allProblems[nextIdx];
    if (nextProb) {
      setSelectedDate(nextProb.date);
      setActiveProblemId(nextProb.id);
    }
  };

  const canDeleteProblem = Boolean(
    activeProblem && (isHost || activeProblem.postedBy.id === currentUser.id)
  );

  // Generate 7-day strip
  const getDateStrip = () => {
    const dates = [];
    const base = new Date(selectedDate || todayStr);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleFetchOfficialDaily = async () => {
    setLoadingDailyFetch(true);
    try {
      const daily = await fetchLeetCodeDaily();
      if (daily && daily.title) {
        postDailyProblem({
          title: daily.title,
          url: daily.url,
          difficulty: daily.difficulty,
          tags: daily.tags,
          date: selectedDate,
        });
        setToast({
          title: 'LeetCode Daily Added!',
          message: `Added "${daily.title}" (${daily.difficulty}) to ${formatDisplayDate(selectedDate)}`,
          type: 'success',
        });
      }
    } catch (e) {
      setToast({ title: 'Error', message: 'Could not fetch official LeetCode daily.', type: 'warning' });
    } finally {
      setLoadingDailyFetch(false);
    }
  };

  const handleQuickRandomProblem = () => {
    const available = RANDOM_BANK.filter(
      (p) => !activeRoom?.dailyProblems.some((dp) => dp.title.toLowerCase() === p.title.toLowerCase())
    );
    const chosen = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : RANDOM_BANK[0];

    postDailyProblem({
      title: chosen.title,
      url: chosen.url,
      difficulty: chosen.difficulty,
      tags: chosen.tags,
      targetTimeMinutes: chosen.targetTimeMinutes,
      date: selectedDate,
    });
  };

  const isSolved = Boolean(activeProblem?.submissions?.some((s) => s.userId === currentUser.id));
  const isMissed = selectedDate < todayStr && !isSolved;

  const difficultyVariant =
    activeProblem?.difficulty === 'Easy'
      ? 'easy'
      : activeProblem?.difficulty === 'Medium'
      ? 'medium'
      : 'hard';

  const formatDisplayDate = (dStr: string) => {
    if (dStr === todayStr) return 'Today';
    const dateObj = new Date(dStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalMembers = activeRoom?.members?.length || 1;
  const completedCount = activeProblem?.submissions?.length || 0;
  const completionPercentage = Math.round((completedCount / totalMembers) * 100);

  return (
    <div className="space-y-4">
      {/* 7-Day Interactive Date Navigation Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
        <button
          onClick={handlePrevDay}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors shrink-0"
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 justify-center flex-1">
          {getDateStrip().map((dStr) => {
            const isToday = dStr === todayStr;
            const isSelected = dStr === selectedDate;
            const dayProblems = activeRoom?.dailyProblems.filter((p) => p.date === dStr) || [];
            const userSolved = dayProblems.some((p) => p.submissions?.some((s) => s.userId === currentUser.id));

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[70px] py-1 px-1.5 sm:px-2 rounded-lg border text-xs transition-all relative ${
                  isSelected
                    ? 'bg-[#2ea043]/20 border-[#2ea043]/60 text-white font-bold shadow-sm'
                    : 'bg-[#0d1117] border-[#30363d] text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                <span className={`text-[10px] font-sans font-medium ${isSelected ? 'text-[#3fb950]' : 'text-slate-400'}`}>
                  {isToday ? 'Today' : new Date(dStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1">
                  {new Date(dStr + 'T00:00:00').getDate()}
                  {dayProblems.length > 1 && (
                    <span className="text-[9px] font-normal text-slate-400 font-mono">({dayProblems.length})</span>
                  )}
                </span>

                {/* Solved Status Indicator Dot */}
                {userSolved && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] absolute top-1 right-1 ring-1 ring-[#161b22]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextDay}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#21262d] transition-colors shrink-0"
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Challenge Card or Empty State */}
      {!activeProblem ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-[#2ea043]/10 text-[#3fb950] flex items-center justify-center mb-3 border border-[#2ea043]/20">
            <Sparkles className="w-5 h-5" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white font-sans mb-1">Ready for today's challenge?</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-4 leading-relaxed font-sans">
            No challenges scheduled for <span className="text-[#3fb950] font-semibold">{formatDisplayDate(selectedDate)}</span> yet. Choose a problem or fetch today's LeetCode challenge.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsPostOpen(true)}
            >
              Choose Problem
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<Sparkles className={`w-4 h-4 text-[#3fb950] ${loadingDailyFetch ? 'animate-spin' : ''}`} />}
              disabled={loadingDailyFetch}
              onClick={handleFetchOfficialDaily}
            >
              {loadingDailyFetch ? 'Fetching...' : 'Fetch LeetCode Daily'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              leftIcon={<Dices className="w-4 h-4 text-amber-400" />}
              onClick={handleQuickRandomProblem}
            >
              Random Problem
            </Button>
          </div>
        </div>
      ) : isCardHidden ? (
        /* Collapsed / Hidden Challenge Strip */
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 sm:p-4.5 flex items-center justify-between shadow-md gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3fb950] shrink-0 animate-pulse" />
            
            {allProblems.length > 1 && (
              <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevProblem(); }}
                  className="p-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
                  title="Previous Problem"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-300 font-bold px-1">
                  {(currentProblemIndex >= 0 ? currentProblemIndex + 1 : 1)}/{allProblems.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextProblem(); }}
                  className="p-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded transition-colors"
                  title="Next Problem"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-400 font-sans">
                {selectedDate === todayStr ? "Today's Challenge:" : `Challenge (${formatDisplayDate(selectedDate)}):`}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md font-sans">
                {activeProblem.title}
              </span>
              <Badge variant={difficultyVariant} size="sm">
                {activeProblem.difficulty}
              </Badge>
              {isSolved && (
                <span className="bg-[#2ea043]/20 text-[#3fb950] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#2ea043]/30">
                  SOLVED
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleHideCard}
              className="flex items-center gap-1.5 text-xs text-[#3fb950] hover:text-[#4ade80] font-semibold px-3 py-1.5 rounded-xl bg-[#2ea043]/10 hover:bg-[#2ea043]/20 border border-[#2ea043]/30 transition-all shadow-sm"
              title="Expand Challenge Details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show Challenge</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-lg space-y-4">
          {/* Header Bar with Date, Difficulty, Arrow Switcher & Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-[#30363d]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {selectedDate === todayStr ? "TODAY'S CHALLENGE" : `SCHEDULED: ${activeProblem.date}`}
              </span>
              <span className="text-slate-600">•</span>
              <Badge variant={difficultyVariant} size="sm">
                {activeProblem.difficulty}
              </Badge>

              {/* Prev / Next Problem Navigation Arrows */}
              {allProblems.length > 1 && (
                <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-1.5 py-0.5 shadow-sm">
                  <button
                    type="button"
                    onClick={handlePrevProblem}
                    className="p-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded transition-colors flex items-center gap-0.5"
                    title="Previous Problem"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono hidden sm:inline">Prev</span>
                  </button>

                  <span className="text-[11px] font-mono text-emerald-400 font-bold px-1.5 border-x border-[#30363d]">
                    {(currentProblemIndex >= 0 ? currentProblemIndex + 1 : 1)} of {allProblems.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextProblem}
                    className="p-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded transition-colors flex items-center gap-0.5"
                    title="Next Problem"
                  >
                    <span className="text-[10px] font-mono hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setIsPostOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#3fb950] hover:text-[#4ade80] bg-[#2ea043]/10 hover:bg-[#2ea043]/20 border border-[#2ea043]/30 transition-all"
                title="Add another problem"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Problem</span>
              </button>

              <button
                onClick={toggleHideCard}
                className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors flex items-center gap-1.5 text-xs border border-[#30363d]"
                title="Hide challenge card"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Card</span>
              </button>
            </div>
          </div>

          {/* Multi-Problem Pills for Selected Date (if multiple) */}
          {problemsOnDate.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1">
              <span className="text-[11px] font-mono text-slate-400">Date Problems ({problemsOnDate.length}):</span>
              {problemsOnDate.map((prob, idx) => {
                const isSelected = prob.id === activeProblem?.id;
                const probSolved = prob.submissions?.some((s) => s.userId === currentUser.id);
                const diffVar = prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard';

                return (
                  <button
                    key={prob.id}
                    onClick={() => setActiveProblemId(prob.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#2ea043]/25 border border-[#2ea043]/60 text-white font-bold shadow-sm'
                        : 'bg-[#0d1117] border border-[#30363d] text-slate-300 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {probSolved && <CheckCircle2 className="w-3 h-3 text-[#3fb950]" />}
                    <span className="truncate max-w-[120px] sm:max-w-[180px]">
                      #{idx + 1} {prob.title}
                    </span>
                    <Badge variant={diffVar} size="sm">
                      {prob.difficulty}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {/* Completion reward banner */}
          {isSolved && (
            <div className="bg-[#2ea043]/10 border border-[#2ea043]/30 rounded-lg px-3.5 py-2 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[#3fb950]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">DAILY GOAL COMPLETE</span>
                <span className="text-xs text-slate-300 hidden sm:inline font-sans">• Completed today</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-amber-300 flex items-center gap-1 font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> +30 Points
                </span>
                <span className="text-[#f0883e] flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-[#f0883e]" /> {currentUser.streak}d Streak
                </span>
              </div>
            </div>
          )}

          {/* Missed challenge banner */}
          {isMissed && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Daily Goal Missed • You didn't complete this day's challenge.</span>
              </div>
              <span className="text-slate-500 font-mono hidden sm:inline">Past Date</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 relative z-10 pt-1">
            <div className="min-w-0 flex-1 space-y-2.5">
              {/* Problem Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight break-words font-sans">
                {activeProblem.title}
              </h2>

              {/* Topic Tags - High Contrast */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {activeProblem.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#21262d] text-slate-100 text-xs px-2.5 py-1 rounded-md border border-[#30363d] flex items-center gap-1.5 font-sans font-medium shadow-sm"
                  >
                    <Tag className="w-3 h-3 text-slate-400" /> {tag}
                  </span>
                ))}
              </div>

              {/* Posted by context */}
              <div className="text-xs text-slate-300 flex items-center gap-1.5 font-sans pt-0.5">
                <span className="text-slate-400">Posted by</span>
                <img src={activeProblem.postedBy.avatar} alt="" className="w-4 h-4 rounded-full object-cover border border-[#30363d]" />
                <span className="text-slate-100 font-semibold">{activeProblem.postedBy.name}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 shrink-0 pt-1 lg:pt-0">
              <a
                href={activeProblem.url}
                target="_blank"
                rel="noreferrer"
                className="bg-[#21262d] hover:bg-[#30363d] text-white text-xs px-4 py-2 rounded-lg font-semibold border border-[#30363d] flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Open LeetCode</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
              </a>

              {!isSolved ? (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => setIsSubmitOpen(true)}
                >
                  Mark Complete
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Code2 className="w-4 h-4 text-[#3fb950]" />}
                  onClick={() => setIsSubmitOpen(true)}
                >
                  Update Solution
                </Button>
              )}

              {canDeleteProblem && (
                <button
                  onClick={() => deleteProblem(activeProblem.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center"
                  title="Delete Challenge Post"
                  aria-label="Delete Challenge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Room Progress Metrics Bar */}
          <div className="pt-3 border-t border-[#30363d] space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold font-sans">
                <Users className="w-3.5 h-3.5 text-[#3fb950]" />
                <span>Room Completion Rate</span>
              </div>
              <span className="font-mono text-slate-200 font-bold bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                {completedCount} / {totalMembers} Members ({completionPercentage}%)
              </span>
            </div>

            <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden border border-[#30363d]">
              <div
                className="bg-[#2ea043] h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(completionPercentage, 4)}%` }}
              />
            </div>
          </div>

          {/* Teammates Solved Avatar Strip */}
          {activeProblem.submissions.length > 0 && (
            <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Solved by:</span>
              <div className="flex items-center -space-x-1.5">
                {activeProblem.submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (isSolved || isHost) {
                        setSelectedCodeSnippet({
                          name: sub.userName,
                          code: sub.codeSnippet,
                          lang: sub.language,
                        });
                      } else {
                        setToast({
                          title: 'Solve to Unlock Code Review 🔒',
                          message: 'Submit your solution first to view teammates\' code snippets and runtime metrics.',
                          type: 'info',
                        });
                      }
                    }}
                    className="relative group focus:outline-none"
                    title={`${sub.userName} (${sub.language}) - Click to review`}
                  >
                    <img
                      src={sub.userAvatar}
                      alt={sub.userName}
                      className="w-6 h-6 rounded-full object-cover border border-[#30363d] ring-1 ring-[#161b22] group-hover:scale-110 transition-transform"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Snippet Review Modal */}
      {selectedCodeSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 max-w-2xl w-full space-y-3 shadow-2xl relative">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#3fb950]" />
                <h4 className="font-bold text-sm text-white font-sans">
                  {selectedCodeSnippet.name}'s Solution ({selectedCodeSnippet.lang})
                </h4>
              </div>
              <button
                onClick={() => setSelectedCodeSnippet(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <pre className="bg-[#0d1117] p-4 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 border border-[#30363d]">
              <code>{selectedCodeSnippet.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Modals */}
      {activeProblem && (
        <SubmitSolutionModal
          problem={activeProblem}
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
        />
      )}
      <PostProblemModal
        isOpen={isPostOpen}
        onClose={() => setIsPostOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
};

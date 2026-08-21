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
import { getLocalTodayStr, parseLocalDate, addDaysToDateStr } from '../../utils/dateUtils';

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

export const DailyProblemHero: React.FC<DailyProblemHeroProps> = () => {
  const {
    currentUser,
    activeRoom,
    deleteProblem,
    postDailyProblem,
    setActiveProblemId,
    setToast,
    isHost,
    theme,
    selectedDate,
    setSelectedDate,
  } = useApp();
  const isIllustrative = theme === 'illustrative';

  const todayStr = getLocalTodayStr();
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
      return false; // Default is visible
    } catch {
      return false;
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

  // Find problems scheduled strictly for selectedDate
  const allProblems = activeRoom?.dailyProblems || [];
  const problemsOnDate = activeRoom?.dailyProblems.filter((p) => p.date === selectedDate) || [];
  const activeProblem =
    problemsOnDate.find((p) => p.id === activeRoom?.activeProblemId) ||
    problemsOnDate[0] ||
    undefined;

  // Sync activeProblemId when date changes
  React.useEffect(() => {
    const matching = activeRoom?.dailyProblems.filter((p) => p.date === selectedDate) || [];
    if (matching.length > 0) {
      if (!matching.some((p) => p.id === activeRoom?.activeProblemId)) {
        setActiveProblemId(matching[0].id);
      }
    } else {
      if (activeRoom?.activeProblemId) {
        setActiveProblemId('');
      }
    }
  }, [selectedDate, activeRoom?.dailyProblems]);

  const currentProblemIndex = problemsOnDate.findIndex((p) => p.id === activeProblem?.id);

  const handlePrevProblem = () => {
    if (problemsOnDate.length <= 1) return;
    const prevIdx = currentProblemIndex > 0 ? currentProblemIndex - 1 : problemsOnDate.length - 1;
    const prevProb = problemsOnDate[prevIdx];
    if (prevProb) {
      setActiveProblemId(prevProb.id);
    }
  };

  const handleNextProblem = () => {
    if (problemsOnDate.length <= 1) return;
    const nextIdx = currentProblemIndex >= 0 && currentProblemIndex < problemsOnDate.length - 1 ? currentProblemIndex + 1 : 0;
    const nextProb = problemsOnDate[nextIdx];
    if (nextProb) {
      setActiveProblemId(nextProb.id);
    }
  };

  const canDeleteProblem = Boolean(
    activeProblem && (isHost || activeProblem.postedBy.id === currentUser.id)
  );

  // Generate 7-day strip centered on selected date
  const getDateStrip = () => {
    const dates = [];
    const base = selectedDate || todayStr;
    for (let i = -3; i <= 3; i++) {
      dates.push(addDaysToDateStr(base, i));
    }
    return dates;
  };

  const handlePrevDay = () => {
    setSelectedDate(addDaysToDateStr(selectedDate || todayStr, -1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDaysToDateStr(selectedDate || todayStr, 1));
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

  const isSolved = Boolean(activeProblem?.submissions?.some((s) => s.userId === currentUser.id && s.status === 'Accepted'));
  const isMissed = selectedDate < todayStr && !isSolved;

  const difficultyVariant =
    activeProblem?.difficulty === 'Easy'
      ? 'easy'
      : activeProblem?.difficulty === 'Medium'
      ? 'medium'
      : 'hard';

  const formatDisplayDate = (dStr: string) => {
    if (dStr === todayStr) return 'Today';
    const dateObj = parseLocalDate(dStr);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalMembers = activeRoom?.members?.length || 1;
  const completedCount = activeProblem?.submissions?.filter((s) => s.status === 'Accepted').length || 0;
  const completionPercentage = Math.round((completedCount / totalMembers) * 100);

  return (
    <div className="space-y-4">
      {/* 7-Day Interactive Date Navigation Bar */}
      <div
        className={`rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-sm transition-all ${
          isIllustrative
            ? 'bg-white border border-[#ede4d4]'
            : 'bg-[#161b22] border border-[#30363d]'
        }`}
      >
        <button
          onClick={handlePrevDay}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            isIllustrative ? 'text-slate-400 hover:text-black hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
          }`}
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
            const userSolved = dayProblems.some((p) => p.submissions?.some((s) => s.userId === currentUser.id && s.status === 'Accepted'));
            const dateObj = parseLocalDate(dStr);

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[70px] py-1.5 px-2 rounded-xl border text-xs transition-all relative ${
                  isSelected
                    ? isIllustrative
                      ? 'bg-[#52b788] border-[#2d6a4f] text-white font-bold shadow-sm'
                      : 'bg-[#2ea043]/20 border-[#2ea043]/60 text-white font-bold shadow-sm'
                    : isIllustrative
                    ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#212d27] hover:bg-white hover:border-[#2d6a4f]/40'
                    : 'bg-[#0d1117] border-[#30363d] text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                <span className={`text-[10px] font-sans font-medium ${isSelected ? 'text-white' : isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                  {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${isSelected ? 'text-white' : isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                  {dateObj.getDate()}
                  {dayProblems.length > 1 && (
                    <span className={`text-[9px] font-normal font-mono ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>({dayProblems.length})</span>
                  )}
                </span>

                {/* Solved Status Indicator Dot */}
                {userSolved && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute top-1 right-1 ring-1 ring-white ${isIllustrative ? 'bg-[#2d6a4f]' : 'bg-[#3fb950]'}`} />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextDay}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            isIllustrative ? 'text-slate-400 hover:text-black hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
          }`}
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Challenge Card or Empty State */}
      {!activeProblem ? (
        <div
          className={`rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden border ${
            isIllustrative
              ? 'bg-white border-[#ede4d4]'
              : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          <img
            src={isIllustrative ? '/crew_chars_light.png' : '/crew_chars_dark.png'}
            alt="Study Crew"
            className="w-44 sm:w-52 h-auto object-contain mb-3 drop-shadow-sm rounded-lg"
          />

          <h3 className={`text-base sm:text-lg font-bold font-sans mb-1 ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
            Ready for today's challenge?
          </h3>
          <p className={`text-xs sm:text-sm max-w-md mx-auto mb-4 leading-relaxed font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
            No challenges scheduled for <span className={`font-semibold ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`}>{formatDisplayDate(selectedDate)}</span> yet. Choose a problem or fetch today's LeetCode challenge.
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
        <div
          className={`rounded-2xl p-4 sm:p-4.5 flex items-center justify-between shadow-md gap-3 border ${
            isIllustrative
              ? 'bg-white border-[#ede4d4]'
              : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 animate-pulse ${isIllustrative ? 'bg-[#2d6a4f]' : 'bg-[#3fb950]'}`} />
            
            {allProblems.length > 1 && (
              <div
                className={`flex items-center gap-1 rounded-lg p-0.5 shrink-0 border ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border-[#ede4d4]'
                    : 'bg-[#0d1117] border-[#30363d]'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevProblem(); }}
                  className={`p-1 rounded transition-colors ${
                    isIllustrative ? 'text-slate-400 hover:text-black hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                  }`}
                  title="Previous Problem"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[10px] font-mono font-bold px-1 ${isIllustrative ? 'text-[#212d27]' : 'text-slate-300'}`}>
                  {(currentProblemIndex >= 0 ? currentProblemIndex + 1 : 1)}/{allProblems.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextProblem(); }}
                  className={`p-1 rounded transition-colors ${
                    isIllustrative ? 'text-slate-400 hover:text-black hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                  }`}
                  title="Next Problem"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                {selectedDate === todayStr ? "Today's Challenge:" : `Challenge (${formatDisplayDate(selectedDate)}):`}
              </span>
              <span className={`text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                {activeProblem.title}
              </span>
              <Badge variant={difficultyVariant} size="sm">
                {activeProblem.difficulty}
              </Badge>
              {isSolved && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isIllustrative
                    ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                    : 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/30'
                }`}>
                  • SOLVED
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleHideCard}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm ${
                isIllustrative
                  ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                  : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
              }`}
              title="Expand Challenge Details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show Challenge</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-md space-y-4 border ${
            isIllustrative
              ? 'bg-white border-[#ede4d4]'
              : 'bg-[#161b22] border-[#30363d]'
          }`}
        >
          {/* Header Bar with Date, Difficulty, Arrow Switcher & Actions */}
          <div className={`flex items-center justify-between gap-2 flex-wrap pb-3 border-b ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                {selectedDate === todayStr ? "TODAY'S CHALLENGE" : `SCHEDULED: ${activeProblem.date}`}
              </span>
              <span className="text-slate-600">•</span>
              <Badge variant={difficultyVariant} size="sm">
                {activeProblem.difficulty}
              </Badge>

              {/* Prev / Next Problem Navigation Arrows */}
              {allProblems.length > 1 && (
                <div className={`flex items-center gap-1 rounded-lg px-1.5 py-0.5 shadow-sm border ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border-[#ede4d4]'
                    : 'bg-[#0d1117] border-[#30363d]'
                }`}>
                  <button
                    type="button"
                    onClick={handlePrevProblem}
                    className={`p-1 rounded transition-colors flex items-center gap-0.5 ${
                      isIllustrative
                        ? 'text-[#5c6b63] hover:text-[#212d27] hover:bg-[#ede4d4]'
                        : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                    }`}
                    title="Previous Problem"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono hidden sm:inline">Prev</span>
                  </button>

                  <span className={`text-[11px] font-mono font-bold px-1.5 border-x ${
                    isIllustrative
                      ? 'text-[#2d6a4f] border-[#ede4d4]'
                      : 'text-emerald-400 border-[#30363d]'
                  }`}>
                    {(currentProblemIndex >= 0 ? currentProblemIndex + 1 : 1)} of {allProblems.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextProblem}
                    className={`p-1 rounded transition-colors flex items-center gap-0.5 ${
                      isIllustrative
                        ? 'text-[#5c6b63] hover:text-[#212d27] hover:bg-[#ede4d4]'
                        : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                    }`}
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  isIllustrative
                    ? 'bg-[#d8f3dc] hover:bg-[#b7e4c7] text-[#2d6a4f] border-[#b7e4c7]'
                    : 'bg-[#2ea043]/10 hover:bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/30'
                }`}
                title="Add another problem"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Problem</span>
              </button>

              <button
                onClick={toggleHideCard}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 text-xs border ${
                  isIllustrative
                    ? 'text-[#5c6b63] hover:text-[#212d27] hover:bg-[#fbf7ee] border-[#ede4d4]'
                    : 'text-slate-400 hover:text-white hover:bg-[#21262d] border-[#30363d]'
                }`}
                title="Hide challenge card"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Card</span>
              </button>
            </div>
          </div>

          {/* Multi-Problem Pills for Selected Date (if multiple) */}
          {problemsOnDate.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-1">
              <span className={`text-[11px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                Date Problems ({problemsOnDate.length}):
              </span>
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
                        ? isIllustrative
                          ? 'bg-[#d8f3dc] border border-[#2d6a4f] text-[#212d27] font-bold shadow-sm'
                          : 'bg-[#2ea043]/25 border border-[#2ea043]/60 text-white font-bold shadow-sm'
                        : isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] hover:bg-white hover:border-[#2d6a4f]/40'
                        : 'bg-[#0d1117] border border-[#30363d] text-slate-300 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {probSolved && <CheckCircle2 className={`w-3 h-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />}
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
            <div className={`rounded-xl px-3.5 py-2 flex items-center justify-between flex-wrap gap-2 border ${
              isIllustrative
                ? 'bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32]'
                : 'bg-[#2ea043]/10 border-[#2ea043]/30 text-[#3fb950]'
            }`}>
              <div className={`flex items-center gap-2 ${isIllustrative ? 'text-[#2e7d32]' : 'text-[#3fb950]'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">DAILY GOAL COMPLETE</span>
                <span className={`text-xs hidden sm:inline font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>• Completed today</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className={`flex items-center gap-1 font-bold ${isIllustrative ? 'text-[#d97706]' : 'text-amber-300'}`}>
                  <Award className="w-3.5 h-3.5" /> +30 Points
                </span>
                <span className="text-[#ea580c] flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-[#ea580c]" /> {currentUser.streak}d Streak
                </span>
              </div>
            </div>
          )}

          {/* Missed challenge banner */}
          {isMissed && (
            <div className={`rounded-xl px-3.5 py-2 flex items-center justify-between text-xs border ${
              isIllustrative
                ? 'bg-[#faf5ea] border-[#ede4d4] text-[#5c6b63]'
                : 'bg-[#0d1117] border-[#30363d] text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Daily Goal Missed • You didn't complete this day's challenge.</span>
              </div>
              <span className={`font-mono hidden sm:inline ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>Past Date</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 relative z-10 pt-1">
            <div className="min-w-0 flex-1 space-y-2.5">
              {/* Problem Title */}
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight break-words font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                {activeProblem.title}
              </h2>

              {/* Topic Tags - High Contrast */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {activeProblem.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 font-sans font-medium shadow-sm ${
                      isIllustrative
                        ? 'bg-[#f7f3eb] text-[#212d27] border-[#ede4d4]'
                        : 'bg-[#21262d] text-slate-100 border-[#30363d]'
                    }`}
                  >
                    <Tag className={`w-3 h-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-400'}`} /> {tag}
                  </span>
                ))}
              </div>

              {/* Posted by context */}
              <div className={`text-xs flex items-center gap-1.5 font-sans pt-0.5 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
                <span className={isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}>Posted by</span>
                <img src={activeProblem.postedBy.avatar} alt="" className={`w-4 h-4 rounded-full object-cover border ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`} />
                <span className={`font-semibold ${isIllustrative ? 'text-[#212d27]' : 'text-slate-100'}`}>{activeProblem.postedBy.name}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 shrink-0 pt-1 lg:pt-0">
              <a
                href={activeProblem.url}
                target="_blank"
                rel="noreferrer"
                className={`text-xs px-4 py-2 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isIllustrative
                    ? 'bg-[#f4ede0] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-white border-[#30363d]'
                }`}
              >
                <span>Open LeetCode</span>
                <ExternalLink className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-300'}`} />
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
                  leftIcon={<Code2 className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />}
                  onClick={() => setIsSubmitOpen(true)}
                >
                  Update Solution
                </Button>
              )}

              {canDeleteProblem && (
                <button
                  onClick={() => deleteProblem(activeProblem.id)}
                  className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center"
                  title="Delete Challenge Post"
                  aria-label="Delete Challenge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Room Progress Metrics Bar */}
          <div className={`pt-3 border-t space-y-1.5 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}>
            <div className="flex justify-between items-center text-xs">
              <div className={`flex items-center gap-1.5 font-semibold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>
                <Users className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                <span>Room Completion Rate</span>
              </div>
              <span className={`font-mono font-bold px-2 py-0.5 rounded border ${
                isIllustrative
                  ? 'bg-[#fbf7ee] text-[#212d27] border-[#ede4d4]'
                  : 'bg-[#0d1117] text-slate-200 border-[#30363d]'
              }`}>
                {completedCount} / {totalMembers} Members ({completionPercentage}%)
              </span>
            </div>

            <div className={`w-full h-2 rounded-full overflow-hidden border ${
              isIllustrative
                ? 'bg-[#ede4d4] border-[#d8cbba]'
                : 'bg-[#0d1117] border-[#30363d]'
            }`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isIllustrative ? 'bg-[#2d6a4f]' : 'bg-[#2ea043]'
                }`}
                style={{ width: `${Math.max(completionPercentage, 4)}%` }}
              />
            </div>
          </div>

          {/* Teammates Solved Avatar Strip */}
          {activeProblem.submissions.length > 0 && (
            <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
              <span className={`font-medium ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Solved by:</span>
              <div className="flex items-center -space-x-1.5">
                {activeProblem.submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      if (isSolved || isHost) {
                        setSelectedCodeSnippet({
                          name: sub.userName,
                          code: sub.codeSnippet || sub.notes || 'Solved problem on LeetCode.',
                          lang: sub.language || 'LeetCode',
                        });
                      } else {
                        setToast({
                          title: 'Solve to Unlock Solution Details 🔒',
                          message: 'Mark your solution complete first to view teammates\' submission details.',
                          type: 'info',
                        });
                      }
                    }}
                    className="relative group focus:outline-none"
                    title={`${sub.userName}${sub.language ? ` (${sub.language})` : ''} - Click to review`}
                  >
                    <img
                      src={sub.userAvatar}
                      alt={sub.userName}
                      className={`w-6 h-6 rounded-full object-cover border ring-1 group-hover:scale-110 transition-transform ${
                        isIllustrative
                          ? 'border-[#ede4d4] ring-white'
                          : 'border-[#30363d] ring-[#161b22]'
                      }`}
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
          <div className={`rounded-2xl p-5 max-w-2xl w-full space-y-3 shadow-2xl relative border ${
            isIllustrative ? 'bg-white border-[#ede4d4] text-[#212d27]' : 'bg-[#161b22] border-[#30363d] text-white'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}>
              <div className="flex items-center gap-2">
                <Code className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                <h4 className="font-bold text-sm font-sans">
                  {selectedCodeSnippet.name}'s Solution ({selectedCodeSnippet.lang})
                </h4>
              </div>
              <button
                onClick={() => setSelectedCodeSnippet(null)}
                className={`p-1 rounded-lg transition-colors ${
                  isIllustrative ? 'text-slate-400 hover:text-black hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                ✕
              </button>
            </div>
            <pre className={`p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border ${
              isIllustrative
                ? 'bg-[#fbf7ee] text-[#1b4332] border-[#ede4d4]'
                : 'bg-[#0d1117] text-emerald-300 border-[#30363d]'
            }`}>
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

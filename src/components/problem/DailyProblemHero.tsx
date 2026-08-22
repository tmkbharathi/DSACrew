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
  Target,
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
      {/* 7-Day Interactive Date Navigation Strip (Compact & Sleek) */}
      <div
        className={`rounded-xl sm:rounded-2xl p-2 sm:p-2.5 px-2.5 sm:px-3.5 flex items-center justify-between gap-1.5 sm:gap-2.5 shadow-xs transition-all ${
          isIllustrative
            ? 'bg-[#FAF6EE] border border-[#EDE4D4]'
            : 'bg-[#0F141C] border border-[#232B36]'
        }`}
      >
        <button
          onClick={handlePrevDay}
          className={`p-1.5 rounded-full transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
            isIllustrative
              ? 'text-[#5C6B63] hover:text-[#1F2933] hover:bg-black/5'
              : 'text-[#8E9892] hover:text-white hover:bg-white/5'
          }`}
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 justify-center flex-1 no-scrollbar">
          {getDateStrip().map((dStr) => {
            const isToday = dStr === todayStr;
            const isSelected = dStr === selectedDate;
            const dayProblems = activeRoom?.dailyProblems.filter((p) => p.date === dStr) || [];
            const hasProblemsOrSolved = dayProblems.length > 0;
            const dateObj = parseLocalDate(dStr);

            return (
              <button
                key={dStr}
                type="button"
                onClick={() => setSelectedDate(dStr)}
                className={`flex-1 min-w-[48px] sm:min-w-[62px] max-w-[80px] h-[52px] sm:h-[58px] rounded-xl flex flex-col items-center justify-center relative cursor-pointer select-none transition-all duration-200 border ${
                  isSelected
                    ? isIllustrative
                      ? 'bg-[#EEF7F0] border-[#68B684] shadow-xs'
                      : 'bg-[#1A2E22] border-[#3FA862] shadow-xs'
                    : isIllustrative
                    ? 'bg-white border-[#E8E3D8] hover:border-[#D0C8B8]'
                    : 'bg-[#181E27] border-[#262F3C] hover:border-[#384354]'
                }`}
              >
                {/* Weekday text (Tue, Wed, Thu, Today, Sat, Sun, Mon) */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold leading-none mb-1 ${
                    isSelected
                      ? isIllustrative
                        ? 'text-[#2D6A4F] font-bold'
                        : 'text-[#4ADE80] font-bold'
                      : isIllustrative
                      ? 'text-[#5C6B63]'
                      : 'text-[#8E9892]'
                  }`}
                >
                  {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>

                {/* Date Number + (Count) */}
                <div
                  className={`text-sm sm:text-base leading-none flex items-center font-sans ${
                    isSelected
                      ? isIllustrative
                        ? 'text-[#2D6A4F] font-black'
                        : 'text-[#4ADE80] font-black'
                      : isIllustrative
                      ? 'text-[#1F2933] font-bold'
                      : 'text-[#F2F4F1] font-bold'
                  }`}
                >
                  <span>{dateObj.getDate()}</span>
                  {dayProblems.length > 0 && (
                    <span
                      className={`text-[9px] sm:text-[10px] ml-0.5 font-sans ${
                        isSelected
                          ? isIllustrative
                            ? 'text-[#2D6A4F] font-semibold'
                            : 'text-[#4ADE80] font-semibold'
                          : isIllustrative
                          ? 'text-[#5C6B63] font-normal'
                          : 'text-[#8E9892] font-normal'
                      }`}
                    >
                      ({dayProblems.length})
                    </span>
                  )}
                </div>

                {/* Status Indicator Dot (Top Right) */}
                {hasProblemsOrSolved && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 ${
                      isIllustrative
                        ? 'bg-[#2D6A4F]'
                        : 'bg-[#4ADE80]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextDay}
          className={`p-1.5 rounded-full transition-colors shrink-0 flex items-center justify-center cursor-pointer ${
            isIllustrative
              ? 'text-[#5C6B63] hover:text-[#1F2933] hover:bg-black/5'
              : 'text-[#8E9892] hover:text-white hover:bg-white/5'
          }`}
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4 stroke-[2]" />
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
          className={`rounded-2xl sm:rounded-[20px] p-5 sm:p-6 relative overflow-hidden shadow-xs space-y-4 border transition-all ${
            isIllustrative
              ? 'bg-[#FAF7F0] border-[#EDE4D4]'
              : 'bg-[#0F141C] border-[#232B36]'
          }`}
        >
          {/* Header Bar with Target, Date, Difficulty, Arrow Switcher & Actions */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Target className={`w-4 h-4 shrink-0 ${isIllustrative ? 'text-[#2D6A4F]' : 'text-[#4ADE80]'}`} />
              <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider font-mono ${isIllustrative ? 'text-[#1F2933]' : 'text-white'}`}>
                {selectedDate === todayStr ? "TODAY'S CHALLENGE" : `SCHEDULED: ${activeProblem.date}`}
              </span>
              <Badge variant={difficultyVariant} size="sm">
                {activeProblem.difficulty}
              </Badge>

              {/* Prev / Next Problem Navigation Arrows */}
              {allProblems.length > 1 && (
                <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1 border text-xs font-mono shadow-xs ${
                  isIllustrative
                    ? 'bg-white border-[#EDE4D4]'
                    : 'bg-[#181E27] border-[#262F3C]'
                }`}>
                  <button
                    type="button"
                    onClick={handlePrevProblem}
                    className={`transition-colors cursor-pointer ${
                      isIllustrative
                        ? 'text-[#5C6B63] hover:text-[#1F2933]'
                        : 'text-[#8E9892] hover:text-white'
                    }`}
                    title="Previous Problem"
                  >
                    &lt; Prev
                  </button>

                  <span className={`font-bold ${
                    isIllustrative
                      ? 'text-[#2D6A4F]'
                      : 'text-[#4ADE80]'
                  }`}>
                    {(currentProblemIndex >= 0 ? currentProblemIndex + 1 : 1)} of {allProblems.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextProblem}
                    className={`transition-colors cursor-pointer ${
                      isIllustrative
                        ? 'text-[#5C6B63] hover:text-[#1F2933]'
                        : 'text-[#8E9892] hover:text-white'
                    }`}
                    title="Next Problem"
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setIsPostOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                  isIllustrative
                    ? 'bg-white hover:bg-[#F4EDE0] text-[#1F2933] border-[#EDE4D4]'
                    : 'bg-[#181E27] hover:bg-[#212733] text-white border-[#262F3C]'
                }`}
                title="Add another problem"
              >
                <PlusCircle className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2D6A4F]' : 'text-[#4ADE80]'}`} />
                <span>Add Problem</span>
              </button>

              <button
                onClick={toggleHideCard}
                className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold border cursor-pointer shadow-xs ${
                  isIllustrative
                    ? 'bg-white hover:bg-[#F4EDE0] text-[#5C6B63] hover:text-[#1F2933] border-[#EDE4D4]'
                    : 'bg-[#181E27] hover:bg-[#212733] text-[#8E9892] hover:text-white border-[#262F3C]'
                }`}
                title="Hide challenge card"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Card</span>
              </button>
            </div>
          </div>

          {/* Date Problems (3): Strip */}
          {problemsOnDate.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-0.5 pb-0.5">
              <span className={`text-xs font-mono ${isIllustrative ? 'text-[#5C6B63]' : 'text-[#8E9892]'}`}>
                Date Problems ({problemsOnDate.length}):
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {problemsOnDate.map((prob, idx) => {
                  const isSelected = prob.id === activeProblem?.id;
                  const diffVar = prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard';

                  return (
                    <button
                      key={prob.id}
                      type="button"
                      onClick={() => setActiveProblemId(prob.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? isIllustrative
                            ? 'bg-[#EEF7F0] border-[#68B684] text-[#1F2933] font-bold shadow-xs'
                            : 'bg-[#1A2E22] border-[#3FA862] text-[#F2F4F1] font-bold shadow-xs'
                          : isIllustrative
                          ? 'bg-white border-[#EDE4D4] text-[#1F2933] hover:bg-[#FAF6EE]'
                          : 'bg-[#181E27] border-[#262F3C] text-[#F2F4F1] hover:bg-[#212733]'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected
                            ? isIllustrative
                              ? 'text-[#2D6A4F]'
                              : 'text-[#4ADE80]'
                            : isIllustrative
                            ? 'text-[#8D9A93]'
                            : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        #{idx + 1} {prob.title}
                      </span>
                      <Badge variant={diffVar} size="sm">
                        {prob.difficulty}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Problem Title & Primary Action Buttons Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight break-words font-sans ${isIllustrative ? 'text-[#1F2933]' : 'text-white'}`}>
              {activeProblem.title}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={activeProblem.url}
                target="_blank"
                rel="noreferrer"
                className={`text-xs px-3.5 py-2 rounded-xl font-semibold border flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isIllustrative
                    ? 'bg-white hover:bg-[#F4EDE0] text-[#1F2933] border-[#EDE4D4]'
                    : 'bg-[#181E27] hover:bg-[#212733] text-white border-[#262F3C]'
                }`}
              >
                <span>Open LeetCode</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsSubmitOpen(true)}
                className={`text-xs px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all text-white shadow-xs cursor-pointer ${
                  isIllustrative
                    ? 'bg-[#3E7652] hover:bg-[#346344]'
                    : 'bg-[#3F7D55] hover:bg-[#4E9969]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSolved ? 'Update Solution' : 'Mark Complete'}</span>
              </button>

              {canDeleteProblem && (
                <button
                  type="button"
                  onClick={() => deleteProblem(activeProblem.id)}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                    isIllustrative
                      ? 'bg-[#FFF0F0] hover:bg-[#FFE0E0] text-rose-600 border-[#FFD0D0]'
                      : 'bg-[#321619] hover:bg-[#431B20] text-[#FF7B72] border-[#5C2329]'
                  }`}
                  title="Delete Challenge Post"
                  aria-label="Delete Challenge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Topic Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {activeProblem.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono shadow-xs ${
                  isIllustrative
                    ? 'bg-white text-[#1F2933] border-[#EDE4D4]'
                    : 'bg-[#181E27] text-[#F2F4F1] border-[#262F3C]'
                }`}
              >
                <Tag className={`w-3 h-3 ${isIllustrative ? 'text-[#5C6B63]' : 'text-[#8E9892]'}`} />
                {tag}
              </span>
            ))}
          </div>

          {/* Posted by context */}
          <div className={`text-xs flex items-center gap-1.5 font-mono pt-0.5 ${isIllustrative ? 'text-[#5C6B63]' : 'text-[#8E9892]'}`}>
            <span>Posted by</span>
            <img
              src={activeProblem.postedBy.avatar}
              alt=""
              className={`w-5 h-5 rounded-full object-cover border ${isIllustrative ? 'border-[#EDE4D4]' : 'border-[#262F3C]'}`}
            />
            <span className={`font-bold font-sans ${isIllustrative ? 'text-[#1F2933]' : 'text-white'}`}>
              {activeProblem.postedBy.name}
            </span>
          </div>

          {/* Room Progress Metrics Bar */}
          <div className={`rounded-xl p-3 border space-y-2 ${
            isIllustrative
              ? 'bg-white border-[#EDE4D4]'
              : 'bg-[#181E27] border-[#262F3C]'
          }`}>
            <div className="flex justify-between items-center text-xs">
              <div className={`flex items-center gap-2 font-semibold font-mono ${
                isIllustrative ? 'text-[#1F2933]' : 'text-[#F2F4F1]'
              }`}>
                <Users className={`w-4 h-4 ${isIllustrative ? 'text-[#2D6A4F]' : 'text-[#4ADE80]'}`} />
                <span>Room Completion Rate</span>
              </div>
              <span className={`font-mono font-bold ${
                isIllustrative ? 'text-[#5C6B63]' : 'text-[#8E9892]'
              }`}>
                {completedCount} / {totalMembers} Members ({completionPercentage}%)
              </span>
            </div>

            <div className={`w-full h-1.5 rounded-full overflow-hidden ${
              isIllustrative
                ? 'bg-[#E8E3D8]'
                : 'bg-[#262F3C]'
            }`}>
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isIllustrative ? 'bg-[#2D6A4F]' : 'bg-[#4ADE80]'
                }`}
                style={{ width: `${Math.max(completionPercentage, 2)}%` }}
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

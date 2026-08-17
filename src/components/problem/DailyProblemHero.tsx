import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Problem } from '../../types';
import { SubmitSolutionModal } from './SubmitSolutionModal';
import { PostProblemModal } from './PostProblemModal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Tag,
  Code2,
  PlusCircle,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Dices,
  Sparkles,
  Award,
  Flame,
  AlertCircle,
  RefreshCw,
  Percent,
} from 'lucide-react';

interface DailyProblemHeroProps {
  problem?: Problem;
}

// Curated DSA problems for Instant Random Picker
const CURATED_RANDOM_PROBLEMS = [
  {
    title: 'Two Sum',
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'Easy' as const,
    tags: ['Array', 'Hash Table'],
    targetTimeMinutes: 20,
    acceptanceRate: '50.4%',
  },
  {
    title: '3Sum',
    url: 'https://leetcode.com/problems/3sum/',
    difficulty: 'Medium' as const,
    tags: ['Array', 'Two Pointers', 'Sorting'],
    targetTimeMinutes: 35,
    acceptanceRate: '33.2%',
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'Medium' as const,
    tags: ['Hash Table', 'Sliding Window', 'String'],
    targetTimeMinutes: 30,
    acceptanceRate: '34.8%',
  },
  {
    title: 'Trapping Rain Water',
    url: 'https://leetcode.com/problems/trapping-rain-water/',
    difficulty: 'Hard' as const,
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Monotonic Stack'],
    targetTimeMinutes: 45,
    acceptanceRate: '60.1%',
  },
  {
    title: 'Container With Most Water',
    url: 'https://leetcode.com/problems/container-with-most-water/',
    difficulty: 'Medium' as const,
    tags: ['Array', 'Two Pointers', 'Greedy'],
    targetTimeMinutes: 25,
    acceptanceRate: '54.9%',
  },
  {
    title: 'Valid Parentheses',
    url: 'https://leetcode.com/problems/valid-parentheses/',
    difficulty: 'Easy' as const,
    tags: ['String', 'Stack'],
    targetTimeMinutes: 15,
    acceptanceRate: '40.6%',
  },
  {
    title: 'LRU Cache',
    url: 'https://leetcode.com/problems/lru-cache/',
    difficulty: 'Medium' as const,
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    targetTimeMinutes: 40,
    acceptanceRate: '42.1%',
  },
  {
    title: 'Merge k Sorted Lists',
    url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    difficulty: 'Hard' as const,
    tags: ['Linked List', 'Divide and Conquer', 'Heap (Priority Queue)'],
    targetTimeMinutes: 45,
    acceptanceRate: '51.8%',
  },
];

export const DailyProblemHero: React.FC<DailyProblemHeroProps> = ({ problem: initialProblem }) => {
  const { currentUser, activeRoom, deleteProblem, postDailyProblem, setToast, isHost } = useApp();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialProblem?.date || getTodayStr());
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState<{ name: string; code: string; lang: string } | null>(null);
  const [networkError, setNetworkError] = useState(false);

  const isAdmin = isHost;
  const todayStr = getTodayStr();

  // Find problem matching selectedDate
  const activeProblem =
    activeRoom?.dailyProblems.find((p) => p.date === selectedDate) ||
    (selectedDate === todayStr ? initialProblem : undefined);

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

  const handleQuickRandomProblem = () => {
    const randomItem =
      CURATED_RANDOM_PROBLEMS[Math.floor(Math.random() * CURATED_RANDOM_PROBLEMS.length)];

    postDailyProblem({
      title: randomItem.title,
      url: randomItem.url,
      difficulty: randomItem.difficulty,
      tags: randomItem.tags,
      targetTimeMinutes: randomItem.targetTimeMinutes,
      date: selectedDate,
    });

    setToast({
      title: 'Random Challenge Selected! 🎲',
      message: `Scheduled "${randomItem.title}" (${randomItem.difficulty}) for ${selectedDate}`,
      type: 'success',
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dateStr === todayStr) return `Today (${dayName}, ${monthName})`;
    return `${dayName}, ${monthName}`;
  };

  const userSubmission = activeProblem?.submissions.find((s) => s.userId === currentUser.id);
  const isSolved = Boolean(userSubmission);
  const isPastDate = selectedDate < todayStr;
  const isMissed = isPastDate && !isSolved;

  const difficultyVariant =
    activeProblem?.difficulty === 'Easy'
      ? 'easy'
      : activeProblem?.difficulty === 'Hard'
      ? 'hard'
      : 'medium';

  return (
    <div className="space-y-4">
      {/* Date Progress Navigation Bar */}
      <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-3 sm:p-3.5 flex flex-col gap-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Active Date Title & Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg bg-[#101418] hover:bg-[#262a2f] border border-[#3d4a3e] text-slate-300 hover:text-white transition-colors"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4ade80]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#101418] border border-[#3d4a3e] rounded-lg px-2.5 py-1 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#4ade80]"
              />
              <span className="text-xs font-semibold text-[#4ade80] hidden md:inline font-mono">
                {formatDisplayDate(selectedDate)}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg bg-[#101418] hover:bg-[#262a2f] border border-[#3d4a3e] text-slate-300 hover:text-white transition-colors"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2">
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-[#101418] border border-[#3d4a3e] text-slate-300 hover:text-[#4ade80] hover:border-[#4ade80]/40 transition-colors"
              >
                Jump to Today
              </button>
            )}

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#4ade80]" />}
              onClick={() => setIsPostOpen(true)}
            >
              Schedule Problem
            </Button>
          </div>
        </div>

        {/* 7-Day Progress Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#3d4a3e]/60">
          {getDateStrip().map((dStr) => {
            const isCurr = dStr === selectedDate;
            const isToday = dStr === todayStr;
            const probOnDate = activeRoom?.dailyProblems.find((p) => p.date === dStr);
            const isDateSolved = probOnDate?.submissions.some((s) => s.userId === currentUser.id);
            const isDatePast = dStr < todayStr;
            const isDateMissed = isDatePast && probOnDate && !isDateSolved;

            const d = new Date(dStr + 'T00:00:00');
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`flex-1 min-w-[54px] py-1.5 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5 ${
                  isCurr
                    ? 'bg-[#4ade80]/15 border-[#4ade80] text-white shadow-sm'
                    : isToday
                    ? 'bg-[#1c2024] border-[#4ade80]/40 text-slate-200'
                    : 'bg-[#101418] border-[#3d4a3e] text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span className={`text-[9px] font-mono uppercase font-bold ${isToday ? 'text-[#4ade80]' : 'text-slate-400'}`}>
                  {dayLabel} {isToday ? '•' : ''}
                </span>
                <span className={`text-xs font-bold font-mono ${isCurr ? 'text-[#4ade80]' : 'text-slate-200'}`}>
                  {dayNum}
                </span>
                <div className="flex items-center justify-center h-3 text-[10px] font-mono leading-none">
                  {isDateSolved ? (
                    <span className="text-[#4ade80] font-bold" title="Completed">✓</span>
                  ) : isDateMissed ? (
                    <span className="text-slate-500 font-bold" title="Missed">×</span>
                  ) : probOnDate ? (
                    <span className="text-amber-400" title="Scheduled">○</span>
                  ) : (
                    <span className="text-slate-600">·</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Network Failure State Fallback */}
      {networkError && (
        <div className="bg-[#1c2024] border border-amber-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3 text-left">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Couldn't load today's challenge</h4>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Showing cached problem. Check your internet connection.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => setNetworkError(false)}
          >
            Retry Sync
          </Button>
        </div>
      )}

      {/* Main Challenge Card or Empty State */}
      {!activeProblem ? (
        /* Compact Empty State (Section 7) */
        <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-[#4ade80]/10 text-[#4ade80] flex items-center justify-center mb-3.5 border border-[#4ade80]/20">
            <Sparkles className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white font-sans mb-1">Ready for today's challenge?</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Your daily challenge for <span className="text-[#4ade80] font-semibold">{formatDisplayDate(selectedDate)}</span> hasn't been scheduled yet.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
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
              leftIcon={<Dices className="w-4 h-4 text-amber-400" />}
              onClick={handleQuickRandomProblem}
            >
              Random Problem
            </Button>
          </div>
        </div>
      ) : (
        /* Primary Challenge Card (Section 8 & 9 & 10) */
        <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-xl space-y-5">
          {/* Subtle completion reward banner */}
          {isSolved && (
            <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-xl px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[#4ade80]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider">DAILY GOAL COMPLETE</span>
                <span className="text-xs text-slate-300 hidden sm:inline">• Completed today</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-amber-300 flex items-center gap-1 font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> +30 Points
                </span>
                <span className="text-[#ea580c] flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-[#ea580c]" /> {currentUser.streak}d Streak
                </span>
              </div>
            </div>
          )}

          {/* Missed challenge banner */}
          {isMissed && (
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Daily Goal Missed • You didn't complete this day's challenge.</span>
              </div>
              <span className="text-slate-500 font-mono hidden sm:inline">Past Date</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 relative z-10">
            <div className="min-w-0 flex-1 space-y-3">
              {/* Problem Metadata Header */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                  {selectedDate === todayStr ? "TODAY'S CHALLENGE" : `SCHEDULED: ${activeProblem.date}`}
                </span>
                <span className="text-slate-600">•</span>
                <Badge variant={difficultyVariant} size="sm">
                  {activeProblem.difficulty}
                </Badge>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-slate-500" />
                  Acceptance: 49.8%
                </span>
              </div>

              {/* Problem Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight break-words font-sans">
                {activeProblem.title}
              </h2>

              {/* Topic Tags */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                {activeProblem.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-[#101418] text-slate-300 text-[11px] px-2.5 py-1 rounded-md border border-[#3d4a3e] flex items-center gap-1 font-mono"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                  </span>
                ))}
              </div>

              {/* Posted by context */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono pt-1">
                <span>Posted by</span>
                <img src={activeProblem.postedBy.avatar} alt="" className="w-4 h-4 rounded-full object-cover border border-[#3d4a3e]" />
                <span className="text-slate-200 font-medium">{activeProblem.postedBy.name}</span>
                <span className="text-slate-500">• Source: LeetCode</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5 shrink-0 pt-2 lg:pt-0">
              <a
                href={activeProblem.url}
                target="_blank"
                rel="noreferrer"
                className="bg-[#101418] hover:bg-[#262a2f] text-slate-200 hover:text-white text-xs px-4 py-2.5 rounded-lg font-semibold border border-[#3d4a3e] flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Open Problem</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
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
                  leftIcon={<Code2 className="w-4 h-4 text-[#4ade80]" />}
                  onClick={() => setIsSubmitOpen(true)}
                >
                  Update Solution
                </Button>
              )}

              {isAdmin && (
                <button
                  onClick={() => deleteProblem(activeProblem.id)}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all shrink-0"
                  title="Delete Problem (Admin)"
                  aria-label="Delete Problem"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Collaborative Room Solved Status */}
          <div className="pt-4 border-t border-[#3d4a3e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 font-mono">Room Progress:</span>
              <span className="text-xs text-[#4ade80] font-bold font-mono">
                {activeProblem.submissions.length} / {activeRoom?.members.length || 1} Completed
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeProblem.submissions.length === 0 ? (
                <span className="text-xs text-slate-500 font-mono">No submissions yet</span>
              ) : (
                activeProblem.submissions.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() =>
                      setSelectedCodeSnippet({
                        name: sub.userName,
                        code: sub.codeSnippet,
                        lang: sub.language,
                      })
                    }
                    className="flex items-center gap-1.5 bg-[#101418] border border-[#4ade80]/30 hover:border-[#4ade80] rounded-lg px-2.5 py-1 text-xs text-slate-200 transition-colors"
                    title={`Click to view code by ${sub.userName}`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                    <span className="truncate max-w-[90px]">{sub.userName}</span>
                    {sub.runtimeMs && <span className="text-[10px] text-slate-400 font-mono">({sub.runtimeMs})</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Snippet Modal */}
      {selectedCodeSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedCodeSnippet(null)} />
          <div className="relative w-full max-w-2xl bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-5 sm:p-6 shadow-2xl z-10 space-y-4 max-h-[85vh] flex flex-col mx-3">
            <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#4ade80]" />
                <h3 className="font-bold text-white text-sm sm:text-base font-sans">
                  Solution by <span className="text-[#4ade80]">{selectedCodeSnippet.name}</span>
                </h3>
              </div>
              <Badge variant="neutral" size="sm">
                {selectedCodeSnippet.lang}
              </Badge>
            </div>

            <div className="flex-1 overflow-auto bg-[#101418] border border-[#3d4a3e] rounded-lg p-4 font-mono text-xs text-[#4ade80] leading-relaxed">
              <pre>{selectedCodeSnippet.code}</pre>
            </div>

            <div className="flex justify-end pt-1">
              <Button variant="secondary" size="sm" onClick={() => setSelectedCodeSnippet(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Solution Modal */}
      {activeProblem && (
        <SubmitSolutionModal problem={activeProblem} isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      )}

      {/* Post / Schedule Problem Modal */}
      <PostProblemModal
        isOpen={isPostOpen}
        initialDate={selectedDate}
        onClose={() => setIsPostOpen(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeDaily, fetchLeetCodeProblemDetails, extractSlugFromLeetCodeUrl } from '../../services/leetcodeApi';
import type { Difficulty } from '../../types';
import { getLocalTodayStr, addDaysToDateStr } from '../../utils/dateUtils';
import { Button } from '../ui/Button';
import { X, PlusCircle, ExternalLink, RefreshCw, Tag, Calendar, Dices, Search, Sparkles, Loader2 } from 'lucide-react';

interface PostProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

const POPULAR_PROBLEMS = [
  { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy' as const, tags: ['Array', 'Hash Table'] },
  { title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium' as const, tags: ['Array', 'Two Pointers'] },
  { title: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy' as const, tags: ['Array', 'Dynamic Programming'] },
  { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium' as const, tags: ['DFS', 'BFS', 'Union Find'] },
  { title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium' as const, tags: ['Array', 'Sorting'] },
  { title: 'Word Break', url: 'https://leetcode.com/problems/word-break/', difficulty: 'Medium' as const, tags: ['Trie', 'Dynamic Programming'] },
  { title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'Easy' as const, tags: ['Hash Table', 'String'] },
  { title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', difficulty: 'Medium' as const, tags: ['Tree', 'BFS'] },
  { title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy' as const, tags: ['Math', 'Dynamic Programming'] },
  { title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium' as const, tags: ['DFS', 'Graph', 'Topological Sort'] },
];

export const PostProblemModal: React.FC<PostProblemModalProps> = ({ isOpen, onClose, initialDate }) => {
  const { postDailyProblem, setToast, theme } = useApp();

  const getTodayStr = () => getLocalTodayStr();
  const getTomorrowStr = () => addDaysToDateStr(getLocalTodayStr(), 1);

  const [dateInput, setDateInput] = useState(initialDate || getTodayStr());
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [isAutoFetchingUrl, setIsAutoFetchingUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isIllustrative = theme === 'illustrative';

  useEffect(() => {
    if (initialDate) {
      setDateInput(initialDate);
    } else {
      setDateInput(getTodayStr());
    }
  }, [initialDate, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);

    const slug = extractSlugFromLeetCodeUrl(newUrl);
    if (slug) {
      setIsAutoFetchingUrl(true);
      try {
        const details = await fetchLeetCodeProblemDetails(newUrl);
        if (details) {
          setTitle(details.title);
          setDifficulty(details.difficulty);
          setTagsInput(details.tags.join(', '));
          setUrl(details.url);
          setToast({
            title: 'Problem Details Auto-Filled! ✨',
            message: `Loaded "${details.title}" (${details.difficulty}) from LeetCode`,
            type: 'success',
          });
        }
      } catch (err) {
        console.warn('Auto fetch error on URL change:', err);
      } finally {
        setIsAutoFetchingUrl(false);
      }
    }
  };

  const handleFetchOfficialDaily = async () => {
    setLoadingFetch(true);
    try {
      const daily = await fetchLeetCodeDaily();
      setTitle(daily.title);
      setUrl(daily.url);
      setDifficulty(daily.difficulty);
      setTagsInput(daily.tags.join(', '));
      setToast({
        title: 'LeetCode Daily Fetched!',
        message: `Auto-filled "${daily.title}" (${daily.difficulty})`,
        type: 'success',
      });
    } catch (e) {
      setToast({ title: 'Error', message: 'Could not auto-fetch official LeetCode daily.', type: 'warning' });
    } finally {
      setLoadingFetch(false);
    }
  };

  const handlePickRandomProblem = () => {
    const match = POPULAR_PROBLEMS[Math.floor(Math.random() * POPULAR_PROBLEMS.length)];
    setTitle(match.title);
    setUrl(match.url);
    setDifficulty(match.difficulty);
    setTagsInput(match.tags.join(', '));
  };

  const handleSelectPopular = (prob: typeof POPULAR_PROBLEMS[0]) => {
    setTitle(prob.title);
    setUrl(prob.url);
    setDifficulty(prob.difficulty);
    setTagsInput(prob.tags.join(', '));
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    postDailyProblem({
      title: title.trim(),
      url: url.trim(),
      difficulty,
      tags: tags.length > 0 ? tags : ['Algorithms'],
      date: dateInput || getTodayStr(),
    });

    setTitle('');
    setUrl('');
    setTagsInput('');
    onClose();
  };

  const matchingProblems = searchQuery.trim()
    ? POPULAR_PROBLEMS.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 z-10 my-auto max-h-[90vh] flex flex-col mx-3 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
              <PlusCircle className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              Add Problem
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isIllustrative ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#31353a]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Quick Actions Strip */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFetchOfficialDaily}
              disabled={loadingFetch}
              className={`rounded-xl p-2.5 flex items-center gap-2 text-left transition-colors border ${
                isIllustrative
                  ? 'bg-[#fbf7ee] hover:bg-[#ede4d4] border-[#ede4d4]'
                  : 'bg-[#101418] hover:bg-[#262a2f] border-[#4ade80]/30'
              }`}
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'} ${loadingFetch ? 'animate-spin' : ''}`} />
              <div className="min-w-0">
                <div className={`text-xs font-bold font-sans leading-tight ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>Auto-Fetch Daily</div>
                <div className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>Official LC Challenge</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePickRandomProblem}
              className={`rounded-xl p-2.5 flex items-center gap-2 text-left transition-colors border ${
                isIllustrative
                  ? 'bg-[#fef3c7]/60 hover:bg-[#fde68a] border-[#fde68a]'
                  : 'bg-[#101418] hover:bg-[#262a2f] border-amber-500/30'
              }`}
            >
              <Dices className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <div className={`text-xs font-bold font-sans leading-tight ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>Random Problem</div>
                <div className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>Curated Top Pick</div>
              </div>
            </button>
          </div>

          {/* Quick Search Autocomplete */}
          <div className="relative">
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Search Popular Problem</label>
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search (e.g. Two Sum, 3Sum, Number of Islands)..."
                className={`w-full rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white placeholder:text-slate-500 focus:border-[#4ade80]'
                }`}
              />
            </div>

            {matchingProblems.length > 0 && (
              <div
                className={`absolute top-full mt-1 left-0 w-full rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto p-1 space-y-1 border ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4]'
                    : 'bg-[#101418] border-[#3d4a3e]'
                }`}
              >
                {matchingProblems.map((prob) => (
                  <button
                    key={prob.title}
                    type="button"
                    onClick={() => handleSelectPopular(prob)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isIllustrative
                        ? 'hover:bg-[#fbf7ee] text-[#212d27]'
                        : 'hover:bg-[#1c2024] text-slate-200'
                    }`}
                  >
                    <span className="font-medium">{prob.title}</span>
                    <span className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>{prob.difficulty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Problem Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Target Schedule Date */}
            <div>
              <label className={`block text-xs font-mono mb-1 flex items-center gap-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                <Calendar className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}`} /> Target Schedule Date
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setDateInput(getTodayStr())}
                  className={`text-[11px] font-mono px-2.5 py-2 rounded-xl border transition-colors ${
                    dateInput === getTodayStr()
                      ? isIllustrative
                        ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7] font-bold'
                        : 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40 font-bold'
                      : isIllustrative
                      ? 'bg-[#fbf7ee] text-[#5c6b63] border-[#ede4d4]'
                      : 'bg-[#101418] text-slate-400 border-[#3d4a3e]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateInput(getTomorrowStr())}
                  className={`text-[11px] font-mono px-2.5 py-2 rounded-xl border transition-colors ${
                    dateInput === getTomorrowStr()
                      ? isIllustrative
                        ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7] font-bold'
                        : 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40 font-bold'
                      : isIllustrative
                      ? 'bg-[#fbf7ee] text-[#5c6b63] border-[#ede4d4]'
                      : 'bg-[#101418] text-slate-400 border-[#3d4a3e]'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>LeetCode URL Link</label>
                {isAutoFetchingUrl ? (
                  <span className={`text-[10px] flex items-center gap-1 font-mono animate-pulse ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}`}>
                    <Loader2 className="w-3 h-3 animate-spin" /> Auto-fetching details...
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>
                    Paste link to auto-fill
                  </span>
                )}
              </div>
              <div className="relative">
                <ExternalLink className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-mono focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Problem Title</label>
                {title && (
                  <span className={`text-[10px] flex items-center gap-1 font-mono ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}`}>
                    <Sparkles className="w-3 h-3" /> Auto-filled
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className={`w-full rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className={`w-full rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                >
                  <option value="Easy">Easy (30 Pts)</option>
                  <option value="Medium">Medium (60 Pts)</option>
                  <option value="Hard">Hard (100 Pts)</option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Topic Tags</label>
                <div className="relative">
                  <Tag className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Array, Hash Table, DP"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 shrink-0">
              <Button variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                type="submit"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Add Problem
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeDaily } from '../../services/leetcodeApi';
import type { Difficulty } from '../../types';
import { Button } from '../ui/Button';
import { X, PlusCircle, ExternalLink, RefreshCw, Tag, Calendar, Dices, Search } from 'lucide-react';

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
  const { postDailyProblem, setToast } = useApp();

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [dateInput, setDateInput] = useState(initialDate || getTodayStr());
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialDate) {
      setDateInput(initialDate);
    } else {
      setDateInput(getTodayStr());
    }
  }, [initialDate, isOpen]);

  if (!isOpen) return null;

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
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-5 sm:p-6 z-10 my-auto max-h-[90vh] flex flex-col mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Add Problem</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#31353a]">
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
              className="bg-[#101418] hover:bg-[#262a2f] border border-[#4ade80]/30 rounded-xl p-2.5 flex items-center gap-2 text-left transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-[#4ade80] shrink-0 ${loadingFetch ? 'animate-spin' : ''}`} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight">Auto-Fetch Daily</div>
                <div className="text-[10px] text-slate-400 font-mono">Official LC Challenge</div>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePickRandomProblem}
              className="bg-[#101418] hover:bg-[#262a2f] border border-amber-500/30 rounded-xl p-2.5 flex items-center gap-2 text-left transition-colors"
            >
              <Dices className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-tight">Random Problem</div>
                <div className="text-[10px] text-slate-400 font-mono">Curated Top Pick</div>
              </div>
            </button>
          </div>

          {/* Quick Search Autocomplete */}
          <div className="relative">
            <label className="block text-xs font-mono text-slate-400 mb-1">Search Popular Problem</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search (e.g. Two Sum, 3Sum, Number of Islands)..."
                className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4ade80]"
              />
            </div>

            {matchingProblems.length > 0 && (
              <div className="absolute top-full mt-1 left-0 w-full bg-[#101418] border border-[#3d4a3e] rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto p-1 space-y-1">
                {matchingProblems.map((prob) => (
                  <button
                    key={prob.title}
                    type="button"
                    onClick={() => handleSelectPopular(prob)}
                    className="w-full text-left px-2.5 py-1.5 rounded text-xs hover:bg-[#1c2024] flex items-center justify-between text-slate-200"
                  >
                    <span className="font-medium">{prob.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{prob.difficulty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Problem Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Target Schedule Date */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#4ade80]" /> Target Schedule Date
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="flex-1 bg-[#101418] border border-[#3d4a3e] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#4ade80]"
                />
                <button
                  type="button"
                  onClick={() => setDateInput(getTodayStr())}
                  className={`text-[11px] font-mono px-2.5 py-2 rounded-lg border transition-colors ${
                    dateInput === getTodayStr()
                      ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40 font-bold'
                      : 'bg-[#101418] text-slate-400 border-[#3d4a3e]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateInput(getTomorrowStr())}
                  className={`text-[11px] font-mono px-2.5 py-2 rounded-lg border transition-colors ${
                    dateInput === getTomorrowStr()
                      ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40 font-bold'
                      : 'bg-[#101418] text-slate-400 border-[#3d4a3e]'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Problem Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">LeetCode URL Link</label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
                >
                  <option value="Easy">Easy (30 Pts)</option>
                  <option value="Medium">Medium (60 Pts)</option>
                  <option value="Hard">Hard (100 Pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Topic Tags</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Array, Hash Table, DP"
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
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

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeDaily } from '../../services/leetcodeApi';
import type { Difficulty } from '../../types';
import { X, PlusCircle, ExternalLink, RefreshCw, Tag, Clock, Sparkles, Calendar } from 'lucide-react';

interface PostProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

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
  const [targetTime, setTargetTime] = useState(30);
  const [loadingFetch, setLoadingFetch] = useState(false);

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
      targetTimeMinutes: targetTime,
      date: dateInput || getTodayStr(),
    });

    setTitle('');
    setUrl('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-5 sm:p-6 z-10 my-auto max-h-[88vh] flex flex-col mx-3">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Add Problem by Date</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#31353a]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Target Date Picker Selection */}
          <div className="bg-[#101418] border border-[#3d4a3e] rounded-xl p-3 space-y-2">
            <label className="block text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4ade80]" /> Target Schedule Date
            </label>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="date"
                required
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full sm:w-auto flex-1 bg-[#1c2024] border border-[#3d4a3e] rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#4ade80]"
              />
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDateInput(getTodayStr())}
                  className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors ${
                    dateInput === getTodayStr()
                      ? 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/40 font-bold'
                      : 'bg-[#1c2024] text-slate-400 border-[#3d4a3e] hover:text-white'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateInput(getTomorrowStr())}
                  className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-colors ${
                    dateInput === getTomorrowStr()
                      ? 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/40 font-bold'
                      : 'bg-[#1c2024] text-slate-400 border-[#3d4a3e] hover:text-white'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>

          {/* Auto-fetch button */}
          <div className="bg-[#101418] border border-[#4ade80]/30 rounded-xl p-3 flex items-center justify-between gap-3 shrink-0">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" /> Auto-Fetch Official LeetCode Daily
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Quick fill today's official challenge details</p>
            </div>
            <button
              type="button"
              onClick={handleFetchOfficialDaily}
              disabled={loadingFetch}
              className="bg-[#4ade80]/10 hover:bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFetch ? 'animate-spin' : ''}`} />
              {loadingFetch ? 'Fetching...' : 'Fetch'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Problem Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3Sum, Two Sum, Word Break"
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

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Time (Minutes)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={targetTime}
                    onChange={(e) => setTargetTime(Number(e.target.value))}
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Topic Tags (Comma-separated)</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Array, Two Pointers, Dynamic Programming"
                  className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-[#31353a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-[#4ade80] hover:bg-[#6dfe9c] text-[#005e2d] rounded-lg transition-colors shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save for {dateInput}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

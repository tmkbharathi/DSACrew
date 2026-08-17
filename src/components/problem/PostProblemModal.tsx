import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeDaily } from '../../services/leetcodeApi';
import type { Difficulty } from '../../types';
import { X, PlusCircle, ExternalLink, RefreshCw, Tag, Clock, Sparkles } from 'lucide-react';

interface PostProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostProblemModal: React.FC<PostProblemModalProps> = ({ isOpen, onClose }) => {
  const { postDailyProblem, setToast } = useApp();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [targetTime, setTargetTime] = useState(30);
  const [loadingFetch, setLoadingFetch] = useState(false);

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
    });

    setTitle('');
    setUrl('');
    setTagsInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Post Daily LeetCode Problem</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Auto-fetch button */}
          <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 shrink-0">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Auto-Fetch Official LeetCode Daily
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Automatically pull today's official LeetCode challenge</p>
            </div>
            <button
              type="button"
              onClick={handleFetchOfficialDaily}
              disabled={loadingFetch}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFetch ? 'animate-spin' : ''}`} />
              {loadingFetch ? 'Fetching...' : 'Fetch Now'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Problem Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 3Sum, Container With Most Water"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">LeetCode URL Link</label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Easy">Easy (30 Pts)</option>
                  <option value="Medium">Medium (60 Pts)</option>
                  <option value="Hard">Hard (100 Pts)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Time (Minutes)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={targetTime}
                    onChange={(e) => setTargetTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Topic Tags (Comma-separated)</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Array, Two Pointers, Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Post to Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

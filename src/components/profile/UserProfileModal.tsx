import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeProfile } from '../../services/leetcodeApi';
import type { LeetCodeProfileStats } from '../../types';
import { X, User, Code2, RefreshCw, CheckCircle2, Award, Zap, Flame, Trophy, AlertCircle } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser, setToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lcStats, setLcStats] = useState<LeetCodeProfileStats | null>(null);

  if (!isOpen) return null;

  const handleSyncLeetCode = async () => {
    if (!username.trim()) {
      setToast({ title: 'Input Required', message: 'Enter your LeetCode username handle first.', type: 'warning' });
      return;
    }
    setLoadingSync(true);
    setSyncError('');
    const stats = await fetchLeetCodeProfile(username.trim());
    setLoadingSync(false);

    if (stats) {
      setLcStats(stats);
      if (stats.avatar) setAvatar(stats.avatar);
      if (stats.realName && !name) setName(stats.realName);
      setToast({
        title: 'LeetCode Stats Synced!',
        message: `Verified @${stats.username}: ${stats.totalSolved} total solved (Rank #${stats.ranking.toLocaleString()}).`,
        type: 'success',
      });
    } else {
      setSyncError(`Could not find LeetCode profile for "@${username.trim()}". Check handle spelling.`);
      setToast({
        title: 'User Not Found',
        message: `No public LeetCode user found for "${username.trim()}".`,
        type: 'warning',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name: name.trim() || (lcStats?.realName) || (lcStats?.username) || 'User',
      username: username.trim(),
      avatar,
      solvedCount: lcStats ? lcStats.totalSolved : currentUser.solvedCount,
    });
    setToast({ title: 'Profile Saved', message: 'Your settings have been saved.', type: 'success' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Your Profile Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Avatar</label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Current Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
              />
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt=""
                    onClick={() => setAvatar(imgUrl)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                      avatar === imgUrl ? 'border-emerald-400 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="Your Name"
            />
          </div>

          {/* LeetCode Handle */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">LeetCode Username / Handle</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Code2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSyncError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="e.g. touriste, neal_wu"
                />
              </div>
              <button
                type="button"
                onClick={handleSyncLeetCode}
                disabled={loadingSync}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs px-3 py-2.5 rounded-xl font-medium border border-emerald-500/30 flex items-center gap-1.5 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
                {loadingSync ? 'Syncing...' : 'Sync LeetCode'}
              </button>
            </div>
            {syncError && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {syncError}
              </p>
            )}
          </div>

          {/* Stats summary */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> Points
              </div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{currentUser.points}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" /> Streak
              </div>
              <div className="text-sm font-bold text-orange-400 mt-0.5">{currentUser.streak} Days</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Solved
              </div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {lcStats ? lcStats.totalSolved : currentUser.solvedCount}
              </div>
            </div>
          </div>

          {lcStats && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verified @{lcStats.username}</span>
                {lcStats.ranking > 0 && (
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 ml-auto flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" /> Rank #{lcStats.ranking.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300 pt-1 flex gap-3 flex-wrap">
                <span className="text-emerald-400 font-semibold">Easy: {lcStats.easySolved}</span>
                <span className="text-amber-400 font-semibold">Med: {lcStats.mediumSolved}</span>
                <span className="text-rose-400 font-semibold">Hard: {lcStats.hardSolved}</span>
                <span className="text-cyan-400 font-bold">Total: {lcStats.totalSolved}</span>
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

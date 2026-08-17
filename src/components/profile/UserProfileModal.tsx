import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeProfile } from '../../services/leetcodeApi';
import type { LeetCodeProfileStats } from '../../types';
import { X, User, Code2, RefreshCw, CheckCircle2, Award, Zap, Flame, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

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

      <div className="relative w-full max-w-lg bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-6 z-10 overflow-hidden mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Profile & Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">Avatar</label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Current Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#4ade80]/60 shadow-md"
              />
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt=""
                    onClick={() => setAvatar(imgUrl)}
                    className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                      avatar === imgUrl ? 'border-[#4ade80] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
              placeholder="Your Name"
            />
          </div>

          {/* LeetCode Handle */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">LeetCode Username / Handle</label>
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
                  className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80] font-mono"
                  placeholder="e.g. touriste, neal_wu"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={handleSyncLeetCode}
                disabled={loadingSync}
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />}
              >
                {loadingSync ? 'Syncing...' : 'Sync LC'}
              </Button>
            </div>
            {syncError && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {syncError}
              </p>
            )}
          </div>

          {/* Stats Summary */}
          <div className="bg-[#101418] border border-[#3d4a3e] rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> Points
              </div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">{currentUser.points}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#ea580c]" /> Streak
              </div>
              <div className="text-sm font-bold text-[#ea580c] mt-0.5">{currentUser.streak} Days</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-[#4ade80]" /> Solved
              </div>
              <div className="text-sm font-bold text-[#4ade80] mt-0.5">
                {lcStats ? lcStats.totalSolved : currentUser.solvedCount}
              </div>
            </div>
          </div>

          {lcStats && (
            <div className="bg-[#101418] border border-[#4ade80]/30 rounded-xl p-3 text-xs text-[#4ade80] space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verified @{lcStats.username}</span>
                {lcStats.ranking > 0 && (
                  <span className="text-[10px] bg-[#1c2024] px-2 py-0.5 rounded text-slate-300 ml-auto flex items-center gap-1 font-mono">
                    <Trophy className="w-3 h-3 text-[#eab308]" /> Rank #{lcStats.ranking.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-300 pt-1 flex gap-3 flex-wrap font-mono">
                <span className="text-[#4ade80] font-semibold">Easy: {lcStats.easySolved}</span>
                <span className="text-amber-400 font-semibold">Med: {lcStats.mediumSolved}</span>
                <span className="text-rose-400 font-semibold">Hard: {lcStats.hardSolved}</span>
                <span className="text-cyan-400 font-bold">Total: {lcStats.totalSolved}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

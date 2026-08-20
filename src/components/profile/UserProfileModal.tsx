import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeProfile } from '../../services/leetcodeApi';
import type { LeetCodeProfileStats } from '../../types';
import { X, User, Code2, RefreshCw, CheckCircle2, Award, Zap, Flame, Trophy, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser, setToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lcStats, setLcStats] = useState<LeetCodeProfileStats | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setAvatar(currentUser.avatar);
      setSyncError('');
      setLcStats(null);
    }
  }, [isOpen, currentUser]);

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
      if (stats.realName && (!name || name === 'You')) setName(stats.realName);
      setToast({
        title: 'LeetCode Stats Synced!',
        message: `Verified @${stats.username}: avatar and stats synced from LeetCode.`,
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
      name: name.trim() || (lcStats?.realName) || (lcStats?.username) || currentUser.name || 'User',
      username: username.trim(),
      avatar,
      leetcodeTotalSolved: lcStats ? lcStats.totalSolved : currentUser.leetcodeTotalSolved,
    });
    setToast({ title: 'Profile Saved', message: 'Your settings have been saved.', type: 'success' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl p-6 z-10 overflow-hidden mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#3fb950]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Profile &amp; Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#21262d]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar (Attached from LeetCode only) */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt="LeetCode Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#2ea043]/60 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-[#161b22] rounded-full p-0.5 border border-[#30363d]">
                <ShieldCheck className="w-4 h-4 text-[#3fb950]" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white font-sans">LeetCode Profile Image</div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5 font-sans">
                Profile pictures are automatically attached and synchronized from your official LeetCode account.
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-sans">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#3fb950] font-sans"
              placeholder="Your Display Name"
            />
          </div>

          {/* LeetCode Handle */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 font-sans">LeetCode Username / Handle</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Code2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSyncError('');
                  }}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#3fb950] font-mono"
                  placeholder="e.g. tourist or neal_wu"
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
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {syncError}
              </p>
            )}
          </div>

          {/* Stats Summary */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] font-sans text-slate-400 flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-[#d29922]" /> Points
              </div>
              <div className="text-sm font-bold text-[#d29922] mt-0.5 font-sans">{currentUser.points}</div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-slate-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-[#f0883e]" /> Streak
              </div>
              <div className="text-sm font-bold text-[#f0883e] mt-0.5 font-mono">{currentUser.streak}d</div>
            </div>
            <div>
              <div className="text-[11px] font-sans text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-[#3fb950]" /> Solved
              </div>
              <div className="text-sm font-bold text-[#3fb950] mt-0.5 font-mono">
                {currentUser.roomSolvedCount ?? 0}
              </div>
            </div>
          </div>

          {lcStats && (
            <div className="bg-[#0d1117] border border-[#2ea043]/30 rounded-xl p-3 text-xs text-[#3fb950] space-y-1">
              <div className="flex items-center gap-2 font-bold font-sans">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verified @{lcStats.username}</span>
                {lcStats.ranking > 0 && (
                  <span className="text-[10px] bg-[#161b22] px-2 py-0.5 rounded text-slate-300 ml-auto flex items-center gap-1 font-mono">
                    <Trophy className="w-3 h-3 text-[#d29922]" /> Rank #{lcStats.ranking.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 pt-1 flex gap-3 flex-wrap font-mono">
                <span className="text-[#3fb950] font-semibold">Easy: {lcStats.easySolved}</span>
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

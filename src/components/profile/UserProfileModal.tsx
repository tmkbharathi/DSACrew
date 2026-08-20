import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchLeetCodeProfile } from '../../services/leetcodeApi';
import type { LeetCodeProfileStats } from '../../types';
import {
  X,
  User,
  Code2,
  RefreshCw,
  CheckCircle2,
  Award,
  Zap,
  Flame,
  Trophy,
  AlertCircle,
  ShieldCheck,
  Palette,
  Volume2,
  VolumeX,
  Gamepad2,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser, theme, setTheme, soundEnabled, setSoundEnabled, setToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [lcStats, setLcStats] = useState<LeetCodeProfileStats | null>(null);

  const [prefTheme, setPrefTheme] = useState<'dark' | 'illustrative'>(currentUser.preferences?.theme || theme);
  const [prefSound, setPrefSound] = useState<boolean>(
    typeof currentUser.preferences?.soundEnabled === 'boolean' ? currentUser.preferences.soundEnabled : soundEnabled
  );
  const [prefSpider, setPrefSpider] = useState<boolean>(
    typeof currentUser.preferences?.spiderVisible === 'boolean' ? currentUser.preferences.spiderVisible : true
  );

  React.useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setAvatar(currentUser.avatar);
      setSyncError('');
      setLcStats(null);
      setPrefTheme(currentUser.preferences?.theme || theme);
      setPrefSound(typeof currentUser.preferences?.soundEnabled === 'boolean' ? currentUser.preferences.soundEnabled : soundEnabled);
      setPrefSpider(typeof currentUser.preferences?.spiderVisible === 'boolean' ? currentUser.preferences.spiderVisible : true);
    }
  }, [isOpen, currentUser, theme, soundEnabled]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      preferences: {
        theme: prefTheme,
        soundEnabled: prefSound,
        spiderVisible: prefSpider,
      },
    });

    if (prefTheme !== theme) setTheme(prefTheme);
    if (prefSound !== soundEnabled) setSoundEnabled(prefSound);

    setToast({ title: 'Profile & Settings Saved', message: 'Your preferences have been updated.', type: 'success' });
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

          {/* Account Preferences (Theme, Sound, Spider Relaxer) */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>Account Preferences</span>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">Saved to Account</span>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-1 border-b border-[#30363d]/50">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <div>
                  <div className="text-xs text-slate-200 font-medium font-sans">Workspace Theme</div>
                  <div className="text-[10px] text-slate-400 font-sans">Illustrative (Warm) or Dark Mode</div>
                </div>
              </div>
              <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPrefTheme('illustrative')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    prefTheme === 'illustrative'
                      ? 'bg-[#2d6a4f] text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Warm
                </button>
                <button
                  type="button"
                  onClick={() => setPrefTheme('dark')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    prefTheme === 'dark'
                      ? 'bg-[#21262d] text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Audio Effects Toggle */}
            <div className="flex items-center justify-between py-1 border-b border-[#30363d]/50">
              <div className="flex items-center gap-2">
                {prefSound ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <div>
                  <div className="text-xs text-slate-200 font-medium font-sans">Sound Effects &amp; Audio</div>
                  <div className="text-[10px] text-slate-400 font-sans">Snake game &amp; notification chimes</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrefSound(!prefSound)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  prefSound
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#161b22] text-slate-400 border-[#30363d] hover:text-white'
                }`}
              >
                {prefSound ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                <span>{prefSound ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>

            {/* Spider Relaxer Toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-[#3fb950]" />
                <div>
                  <div className="text-xs text-slate-200 font-medium font-sans">Spider Relaxer</div>
                  <div className="text-[10px] text-slate-400 font-sans">Interactive crawler in bottom corner</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrefSpider(!prefSpider)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  prefSpider
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#161b22] text-slate-400 border-[#30363d] hover:text-white'
                }`}
              >
                {prefSpider ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                <span>{prefSpider ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>

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

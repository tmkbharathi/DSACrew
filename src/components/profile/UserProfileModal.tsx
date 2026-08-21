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
  const {
    currentUser,
    updateCurrentUser,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    spiderVisible,
    setSpiderVisible,
    setToast,
  } = useApp();
  const isIllustrative = theme === 'illustrative';

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
  const [prefSpider, setPrefSpider] = useState<boolean>(spiderVisible);

  React.useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setAvatar(currentUser.avatar);
      setSyncError('');
      setLcStats(null);
      setPrefTheme(currentUser.preferences?.theme || theme);
      setPrefSound(typeof currentUser.preferences?.soundEnabled === 'boolean' ? currentUser.preferences.soundEnabled : soundEnabled);
      setPrefSpider(spiderVisible);
    }
  }, [isOpen, currentUser, theme, soundEnabled, spiderVisible]);

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
      setSyncError('Please enter a LeetCode username.');
      return;
    }

    setLoadingSync(true);
    setSyncError('');
    try {
      const stats = await fetchLeetCodeProfile(username.trim());
      if (!stats) {
        setSyncError('Could not find LeetCode profile. Please check the handle.');
        setLoadingSync(false);
        return;
      }

      setLcStats(stats);
      if (stats.avatar) {
        setAvatar(stats.avatar);
      }
      setToast({
        title: 'Synced with LeetCode',
        message: `Successfully verified @${stats.username} with ${stats.totalSolved} solved problems!`,
        type: 'success',
      });
    } catch {
      setSyncError('Failed to fetch LeetCode profile. Try again later.');
    } finally {
      setLoadingSync(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateCurrentUser({
      name: name.trim(),
      username: username.trim(),
      avatar,
      preferences: {
        theme: prefTheme,
        soundEnabled: prefSound,
        spiderVisible: prefSpider,
      },
    });

    setSoundEnabled(prefSound);
    setSpiderVisible(prefSpider);
    if (prefTheme !== theme) setTheme(prefTheme);

    setToast({ title: 'Profile & Settings Saved', message: 'Your preferences have been updated.', type: 'success' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`fixed inset-0 backdrop-blur-md transition-colors ${
          isIllustrative ? 'bg-slate-900/40' : 'bg-slate-950/80'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 overflow-hidden mx-3 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#161b22] border-[#30363d] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
              <User className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              Profile &amp; Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isIllustrative ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar (Attached from LeetCode only) */}
          <div className={`border rounded-xl p-3.5 flex items-center gap-3.5 shadow-sm transition-colors ${
            isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#0d1117] border-[#30363d]'
          }`}>
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt="LeetCode Avatar"
                className={`w-14 h-14 rounded-full object-cover border-2 shadow-md ${
                  isIllustrative ? 'border-[#2d6a4f]/60' : 'border-[#2ea043]/60'
                }`}
              />
              <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 border ${
                isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
              }`}>
                <ShieldCheck className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-xs font-semibold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                LeetCode Profile Image
              </div>
              <p className={`text-[11px] leading-tight mt-0.5 font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                Profile pictures are automatically attached and synchronized from your official LeetCode account.
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className={`block text-xs font-medium mb-1 font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
              Display Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-lg px-3.5 py-2 text-xs sm:text-sm focus:outline-none font-sans transition-colors ${
                isIllustrative
                  ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                  : 'bg-[#0d1117] border-[#30363d] text-white focus:border-[#3fb950]'
              }`}
              placeholder="Your Display Name"
            />
          </div>

          {/* LeetCode Handle */}
          <div>
            <label className={`block text-xs font-medium mb-1 font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
              LeetCode Username / Handle
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Code2 className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSyncError('');
                  }}
                  className={`w-full border rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none font-mono transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                      : 'bg-[#0d1117] border-[#30363d] text-white focus:border-[#3fb950]'
                  }`}
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
          <div className={`border rounded-xl p-3.5 grid grid-cols-3 gap-2 text-center transition-colors ${
            isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#0d1117] border-[#30363d]'
          }`}>
            <div>
              <div className={`text-[11px] font-sans flex items-center justify-center gap-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                <Award className={`w-3 h-3 ${isIllustrative ? 'text-[#b07d3b]' : 'text-[#d29922]'}`} /> Points
              </div>
              <div className={`text-sm font-bold mt-0.5 font-sans ${isIllustrative ? 'text-[#b07d3b]' : 'text-[#d29922]'}`}>
                {currentUser.points}
              </div>
            </div>
            <div>
              <div className={`text-[11px] font-sans flex items-center justify-center gap-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                <Flame className={`w-3 h-3 ${isIllustrative ? 'text-[#d97706]' : 'text-[#f0883e]'}`} /> Streak
              </div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${isIllustrative ? 'text-[#d97706]' : 'text-[#f0883e]'}`}>
                {currentUser.streak}d
              </div>
            </div>
            <div>
              <div className={`text-[11px] font-sans flex items-center justify-center gap-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                <Zap className={`w-3 h-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} /> Solved
              </div>
              <div className={`text-sm font-bold mt-0.5 font-mono ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`}>
                {currentUser.roomSolvedCount ?? 0}
              </div>
            </div>
          </div>

          {lcStats && (
            <div className={`border rounded-xl p-3 text-xs space-y-1 transition-colors ${
              isIllustrative
                ? 'bg-[#d8f3dc]/30 border-[#b7e4c7] text-[#2d6a4f]'
                : 'bg-[#0d1117] border-[#2ea043]/30 text-[#3fb950]'
            }`}>
              <div className="flex items-center gap-2 font-bold font-sans">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Verified @{lcStats.username}</span>
                {lcStats.ranking > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded ml-auto flex items-center gap-1 font-mono ${
                    isIllustrative ? 'bg-white text-[#212d27] border border-[#b7e4c7]' : 'bg-[#161b22] text-slate-300'
                  }`}>
                    <Trophy className={`w-3 h-3 ${isIllustrative ? 'text-[#b07d3b]' : 'text-[#d29922]'}`} /> Rank #{lcStats.ranking.toLocaleString()}
                  </span>
                )}
              </div>
              <div className={`text-xs pt-1 flex gap-3 flex-wrap font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
                <span className={`${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'} font-semibold`}>Easy: {lcStats.easySolved}</span>
                <span className="text-amber-500 font-semibold">Med: {lcStats.mediumSolved}</span>
                <span className="text-rose-500 font-semibold">Hard: {lcStats.hardSolved}</span>
                <span className={`${isIllustrative ? 'text-[#2d6a4f]' : 'text-cyan-400'} font-bold`}>Total: {lcStats.totalSolved}</span>
              </div>
            </div>
          )}

          {/* Account Preferences (Theme, Sound, Spider Relaxer) */}
          <div className={`border rounded-xl p-3.5 space-y-3 transition-colors ${
            isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#0d1117] border-[#30363d]'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>Account Preferences</span>
              <span className={`text-[10px] font-mono ml-auto ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>Saved to Account</span>
            </div>

            {/* Theme Toggle */}
            <div className={`flex items-center justify-between py-1 border-b ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]/50'}`}>
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <div>
                  <div className={`text-xs font-medium font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>Workspace Theme</div>
                  <div className={`text-[10px] font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Illustrative (Warm) or Dark Mode</div>
                </div>
              </div>
              <div className={`flex items-center border rounded-lg p-0.5 text-[11px] ${
                isIllustrative ? 'bg-white border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
              }`}>
                <button
                  type="button"
                  onClick={() => setPrefTheme('illustrative')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    prefTheme === 'illustrative'
                      ? 'bg-[#2d6a4f] text-white font-bold shadow-sm'
                      : isIllustrative ? 'text-[#5c6b63] hover:text-[#212d27]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Warm
                </button>
                <button
                  type="button"
                  onClick={() => setPrefTheme('dark')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    prefTheme === 'dark'
                      ? isIllustrative ? 'bg-[#2d6a4f] text-white font-bold shadow-sm' : 'bg-[#21262d] text-emerald-400 font-bold border border-emerald-500/30'
                      : isIllustrative ? 'text-[#5c6b63] hover:text-[#212d27]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Audio Effects Toggle */}
            <div className={`flex items-center justify-between py-1 border-b ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]/50'}`}>
              <div className="flex items-center gap-2">
                {prefSound ? <Volume2 className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-emerald-400'}`} /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <div>
                  <div className={`text-xs font-medium font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>Sound Effects &amp; Audio</div>
                  <div className={`text-[10px] font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Snake game &amp; notification chimes</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrefSound(!prefSound)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  prefSound
                    ? isIllustrative
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isIllustrative
                    ? 'bg-white text-[#5c6b63] border-[#ede4d4] hover:text-[#212d27]'
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
                <Gamepad2 className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                <div>
                  <div className={`text-xs font-medium font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>Spider Relaxer</div>
                  <div className={`text-[10px] font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Interactive crawler in bottom corner</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrefSpider(!prefSpider)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1.5 ${
                  prefSpider
                    ? isIllustrative
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isIllustrative
                    ? 'bg-white text-[#5c6b63] border-[#ede4d4] hover:text-[#212d27]'
                    : 'bg-[#161b22] text-slate-400 border-[#30363d] hover:text-white'
                }`}
              >
                {prefSpider ? <Eye className={`w-3 h-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-emerald-400'}`} /> : <EyeOff className="w-3 h-3 text-slate-400" />}
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

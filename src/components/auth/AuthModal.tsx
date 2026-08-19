import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, LogIn, UserPlus, ShieldCheck, RefreshCw, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRegisterMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRegisterMode = false,
}) => {
  const { login, registerAccount } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(defaultRegisterMode);
  const [usernameInput, setUsernameInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setIsRegisterMode(defaultRegisterMode);
  }, [defaultRegisterMode, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setLoading(true);
    setError('');
    const res = await login(usernameInput.trim(), passwordInput);
    setLoading(false);

    if (res.success) {
      setUsernameInput('');
      setPasswordInput('');
      setError('');
      onClose();
      if (onSuccess) onSuccess();
      if (typeof (window as any).__setLandingView === 'function') {
        (window as any).__setLandingView(false);
      }
    } else {
      setError(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setLoading(true);
    setError('');
    const res = await registerAccount(
      nameInput.trim() || usernameInput.trim(),
      usernameInput.trim(),
      passwordInput
    );
    setLoading(false);

    if (res.success) {
      setNameInput('');
      setUsernameInput('');
      setPasswordInput('');
      setError('');
      onClose();
      if (onSuccess) onSuccess();
      if (typeof (window as any).__setLandingView === 'function') {
        (window as any).__setLandingView(false);
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">
              {isRegisterMode ? 'Register LeetCode Account' : 'Sign In to LeetTracker'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Toggle Tab */}
          <div className="grid grid-cols-2 p-1 bg-[#101418] rounded-xl border border-[#3d4a3e] text-xs font-semibold font-mono">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`py-2 rounded-lg transition-colors ${
                !isRegisterMode ? 'bg-[#4ade80] text-[#005e2d] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
              }}
              className={`py-2 rounded-lg transition-colors ${
                isRegisterMode ? 'bg-[#4ade80] text-[#005e2d] font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              New Account
            </button>
          </div>

          {!isRegisterMode ? (
            /* Sign In Mode */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LeetCode Handle / Username</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. tourist, neal_wu"
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-10 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-rose-400 text-xs bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 font-sans">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading}
                className="w-full"
                leftIcon={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              >
                {loading ? 'Verifying LeetCode Account...' : 'Sign In to Workspace'}
              </Button>
            </form>
          ) : (
            /* Register Mode */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Manikanda Bharathi"
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LeetCode Username / Handle</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. tourist, neal_wu"
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80] font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Must be an existing public LeetCode handle to sync your stats.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-10 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-rose-400 text-xs bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30 font-sans">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={loading}
                className="w-full"
                leftIcon={loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              >
                {loading ? 'Verifying LeetCode Account...' : 'Create & Verify Account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

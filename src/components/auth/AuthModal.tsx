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
  const { login, registerAccount, setIsLandingView, theme } = useApp();
  const [isRegisterMode, setIsRegisterMode] = useState(defaultRegisterMode);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('leettracker_remember_me');
      return saved !== 'false';
    } catch {
      return true;
    }
  });
  const [usernameInput, setUsernameInput] = useState(() => {
    try {
      return localStorage.getItem('leettracker_saved_username') || '';
    } catch {
      return '';
    }
  });
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState(() => {
    try {
      return localStorage.getItem('leettracker_saved_password') || '';
    } catch {
      return '';
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isIllustrative = theme === 'illustrative';

  React.useEffect(() => {
    setIsRegisterMode(defaultRegisterMode);
    if (isOpen && !isRegisterMode) {
      try {
        const savedUser = localStorage.getItem('leettracker_saved_username') || '';
        const savedPass = localStorage.getItem('leettracker_saved_password') || '';
        if (savedUser) setUsernameInput(savedUser);
        if (savedPass) setPasswordInput(savedPass);
      } catch {}
    }
  }, [defaultRegisterMode, isOpen, isRegisterMode]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    setLoading(true);
    setError('');
    const res = await login(usernameInput.trim(), passwordInput);
    setLoading(false);

    if (res.success) {
      if (rememberMe) {
        try {
          localStorage.setItem('leettracker_remember_me', 'true');
          localStorage.setItem('leettracker_saved_username', usernameInput.trim());
          localStorage.setItem('leettracker_saved_password', passwordInput);
        } catch {}
      } else {
        try {
          localStorage.setItem('leettracker_remember_me', 'false');
          localStorage.removeItem('leettracker_saved_username');
          localStorage.removeItem('leettracker_saved_password');
        } catch {}
      }
      setError('');
      onClose();
      if (onSuccess) onSuccess();
      setIsLandingView(false);
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
      setIsLandingView(false);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col mx-3 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
              <LogIn className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              {isRegisterMode ? 'Register Account' : 'Sign In to LeetTracker'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isIllustrative ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#262a2f]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Toggle Tab */}
          <div className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-semibold font-mono ${
            isIllustrative
              ? 'bg-[#fbf7ee] border-[#ede4d4]'
              : 'bg-[#101418] border-[#3d4a3e]'
          }`}>
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`py-2 rounded-lg transition-colors ${
                !isRegisterMode
                  ? isIllustrative
                    ? 'bg-[#2d6a4f] text-white font-bold shadow-sm'
                    : 'bg-[#4ade80] text-[#005e2d] font-bold shadow-sm'
                  : isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#212d27]'
                  : 'text-slate-400 hover:text-white'
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
                isRegisterMode
                  ? isIllustrative
                    ? 'bg-[#2d6a4f] text-white font-bold shadow-sm'
                    : 'bg-[#4ade80] text-[#005e2d] font-bold shadow-sm'
                  : isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#212d27]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Account
            </button>
          </div>

          {!isRegisterMode ? (
            /* Sign In Mode */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>LeetCode Handle / Username</label>
                <div className="relative">
                  <ShieldCheck className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. tourist, neal_wu"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none font-mono transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Password</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter your account password"
                    className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`rounded w-3.5 h-3.5 cursor-pointer ${
                      isIllustrative
                        ? 'accent-[#2d6a4f] border-[#ede4d4]'
                        : 'accent-[#2ea043] border-[#30363d]'
                    }`}
                  />
                  <span className={isIllustrative ? 'text-[#5c6b63] font-sans' : 'text-slate-300 font-sans'}>
                    Remember credentials
                  </span>
                </label>
              </div>

              {error && (
                <div className={`text-xs p-2.5 rounded-xl border font-sans ${
                  isIllustrative
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                }`}>
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
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Full Name</label>
                <div className="relative">
                  <UserIcon className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Manikanda Bharathi"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>LeetCode Username / Handle</label>
                <div className="relative">
                  <ShieldCheck className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. tourist, neal_wu"
                    className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none font-mono transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                </div>
                <p className={`text-[10px] font-mono mt-1 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                  Must be an existing public LeetCode handle to sync your stats.
                </p>
              </div>

              <div>
                <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Create Password</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Choose an account password"
                    className={`w-full rounded-xl pl-9 pr-10 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={`text-xs p-2.5 rounded-xl border font-sans ${
                  isIllustrative
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'text-rose-400 bg-rose-950/40 border-rose-500/30'
                }`}>
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
                {loading ? 'Validating LeetCode Handle...' : 'Create Account & Enter'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

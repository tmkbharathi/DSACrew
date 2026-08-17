import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { User } from '../../types';
import { X, LogIn, UserPlus, ShieldCheck, Check, RefreshCw, Lock, Eye, EyeOff, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRegisterMode?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, defaultRegisterMode = false }) => {
  const { currentUser, activeRoom, login, registerAccount } = useApp();
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

  const roomMembers = activeRoom ? activeRoom.members : [currentUser];

  const handleSelectUser = async (user: User) => {
    setLoading(true);
    const res = await login(user.username || user.name || user.id);
    setLoading(false);
    if (res.success) {
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

      <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">
              {isRegisterMode ? 'Register Account with LeetCode' : 'Sign In with LeetCode'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Toggle Tab */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`py-2 rounded-lg transition-colors ${
                !isRegisterMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
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
                isRegisterMode ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              New Account
            </button>
          </div>

          {!isRegisterMode ? (
            /* Sign In Mode */
            <div className="space-y-4">
              {roomMembers.length > 0 && roomMembers.some((m) => m.username) && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Quick Switch Member</label>
                  <div className="space-y-1.5">
                    {roomMembers
                      .filter((m) => m.username)
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          disabled={loading}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            currentUser.id === user.id
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                              : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                            <div>
                              <div className="text-xs font-semibold text-white flex items-center gap-1">
                                {user.name}
                                {user.systemRole === 'SuperAdmin' && (
                                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded border border-purple-500/30">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">@{user.username}</div>
                            </div>
                          </div>

                          {currentUser.id === user.id && (
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-4 h-4" /> Active
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800 pt-3">
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">LeetCode Username / Handle</label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="e.g. tourist or neal_wu"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="text-rose-400 text-xs bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {loading ? 'Verifying on LeetCode...' : 'Sign In to Workspace'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Register Mode: Name, LeetCode Username, Password */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Manikanda Bharathi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">LeetCode Username / Handle</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                    placeholder="e.g. tourist, neal_wu"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-amber-400/90 mt-1">
                  Must be an existing LeetCode handle. Invalid handles will not be added.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="text-rose-400 text-xs bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Verifying LeetCode Account...' : 'Create & Verify Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

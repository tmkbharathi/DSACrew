import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, KeyRound, Lock, Eye, EyeOff, User as UserIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { resetPasswordWithAdminKey } from '../../services/supabase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername?: string;
  onSuccess?: (username: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialUsername = '',
  onSuccess,
}) => {
  const { theme, setToast } = useApp();
  const isIllustrative = theme === 'illustrative';

  const [username, setUsername] = useState(initialUsername);
  const [adminKey, setAdminKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showAdminKey, setShowAdminKey] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialUsername) {
        setUsername(initialUsername);
      }
      setAdminKey('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialUsername]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUsername = username.trim();
    const cleanKey = adminKey.trim();
    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanUsername) {
      setError('Please enter your LeetCode username.');
      return;
    }

    if (!cleanKey) {
      setError('Please enter the Owner / Admin Recovery Key.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter a new password.');
      return;
    }

    if (cleanPass.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordWithAdminKey(cleanUsername, cleanKey, cleanPass);

      if (!result.success) {
        setError(result.message);
      } else {
        setSuccessMsg(result.message);
        setToast({
          title: 'Password Updated!',
          message: `Password for @${cleanUsername} was successfully reset.`,
          type: 'success',
        });

        setTimeout(() => {
          onSuccess?.(cleanUsername);
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border p-6 flex flex-col relative transition-all ${
          isIllustrative
            ? 'bg-[#f7f3eb] border-[#ede4d4] text-[#212d27]'
            : 'bg-[#181c20] border-[#3d4a3e] text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isIllustrative
                  ? 'bg-[#2d6a4f]/10 text-[#2d6a4f]'
                  : 'bg-[#4ade80]/10 text-[#4ade80]'
              }`}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">Reset Account Password</h2>
              <p
                className={`text-xs ${
                  isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
                }`}
              >
                Enter username & owner key to set a new password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isIllustrative
                ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#ede4d4]'
                : 'text-slate-400 hover:text-white hover:bg-[#262a2f]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Username Input */}
          <div>
            <label
              className={`block text-xs font-mono mb-1.5 ${
                isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
              }`}
            >
              LeetCode Username
            </label>
            <div className="relative">
              <UserIcon
                className={`w-4 h-4 absolute left-3 top-3 ${
                  isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'
                }`}
              />
              <input
                id="forgot-password-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. manikandabharathi"
                disabled={loading}
                className={`w-full rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white placeholder-slate-500 focus:border-[#4ade80]'
                }`}
              />
            </div>
          </div>

          {/* Admin / Owner Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`block text-xs font-mono ${
                  isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
                }`}
              >
                Owner / Admin Recovery Key
              </label>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isIllustrative
                    ? 'bg-[#ede4d4] text-[#5c6b63]'
                    : 'bg-[#262a2f] text-slate-400'
                }`}
              >
                Required
              </span>
            </div>
            <div className="relative">
              <KeyRound
                className={`w-4 h-4 absolute left-3 top-3 ${
                  isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'
                }`}
              />
              <input
                id="forgot-password-adminkey"
                type={showAdminKey ? 'text' : 'password'}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter master admin recovery key"
                disabled={loading}
                className={`w-full rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white placeholder-slate-500 focus:border-[#4ade80]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowAdminKey(!showAdminKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              className={`block text-xs font-mono mb-1.5 ${
                isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
              }`}
            >
              New Password
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3 top-3 ${
                  isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'
                }`}
              />
              <input
                id="forgot-password-new"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
                className={`w-full rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white placeholder-slate-500 focus:border-[#4ade80]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className={`block text-xs font-mono mb-1.5 ${
                isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
              }`}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <Lock
                className={`w-4 h-4 absolute left-3 top-3 ${
                  isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'
                }`}
              />
              <input
                id="forgot-password-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={loading}
                className={`w-full rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white placeholder-slate-500 focus:border-[#4ade80]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl font-sans leading-relaxed animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-sans leading-relaxed animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#212d27] hover:bg-[#ede4d4]'
                  : 'text-slate-400 hover:text-white hover:bg-[#262a2f]'
              }`}
            >
              Cancel
            </button>

            <button
              id="submit-reset-password-btn"
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 ${
                isIllustrative
                  ? 'bg-[#2d6a4f] hover:bg-[#212d27] text-white'
                  : 'bg-[#4ade80] hover:bg-[#3fb950] text-[#005e2d]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Save New Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

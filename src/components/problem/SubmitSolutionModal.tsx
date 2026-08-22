import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { verifyUserSubmission, extractSlugFromLeetCodeUrl } from '../../services/leetcodeApi';
import type { Problem } from '../../types';
import { X, CheckCircle2, FileText, ShieldCheck, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface SubmitSolutionModalProps {
  problem: Problem;
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitSolutionModal: React.FC<SubmitSolutionModalProps> = ({ problem, isOpen, onClose }) => {
  const { currentUser, submitSolution, setToast, theme } = useApp();

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<boolean | null>(null);
  const [verifyMessage, setVerifyMessage] = useState('');
  const isIllustrative = theme === 'illustrative';

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleVerifyLeetCode = React.useCallback(async (showNotification = true) => {
    if (!currentUser.username) {
      if (showNotification) {
        setToast({
          title: 'Handle Required',
          message: 'Please link your LeetCode handle in Profile settings first to verify submissions.',
          type: 'warning',
        });
      }
      return;
    }

    setVerifying(true);
    const result = await verifyUserSubmission(currentUser.username, problem.title);
    setVerifying(false);
    setVerifiedStatus(result.verified);
    setVerifyMessage(result.message);

    if (result.verified) {
      setNotes((prev) => prev || `Accepted solution verified via LeetCode @${currentUser.username}`);
    }

    if (showNotification) {
      setToast({
        title: result.verified ? 'Verified on LeetCode! ✨' : 'Verification Notice',
        message: result.message,
        type: result.verified ? 'success' : 'info',
      });
    }
  }, [currentUser.username, problem.title, setToast]);

  // Automatically trigger LeetCode verification upon opening modal
  React.useEffect(() => {
    if (isOpen) {
      setVerifiedStatus(null);
      setVerifyMessage('');
      setSubmissionUrl('');
      setNotes('');
      if (currentUser.username) {
        handleVerifyLeetCode(false);
      }
    }
  }, [isOpen, currentUser.username, handleVerifyLeetCode]);

  if (!isOpen) return null;

  const handleSubmissionUrlChange = async (urlVal: string) => {
    setSubmissionUrl(urlVal);
    const slug = extractSlugFromLeetCodeUrl(urlVal);
    if (slug || urlVal.includes('leetcode.com')) {
      if (currentUser.username) {
        handleVerifyLeetCode();
      } else {
        setToast({
          title: 'LeetCode Link Detected',
          message: 'Link entered! Add your LeetCode username in profile to auto-verify.',
          type: 'info',
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitSolution(problem.id, {
      notes: notes || (submissionUrl ? `LeetCode Solution: ${submissionUrl}` : undefined),
      verifiedLeetCode: verifiedStatus === true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 z-10 my-auto flex flex-col mx-3 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'}`}>
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                Mark Problem as Solved
              </h3>
            </div>
            <p className={`text-xs mt-1 font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
              Solution for <strong className={isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}>{problem.title}</strong>
            </p>
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

        {/* Form Body */}
        <div className="space-y-4">
          {/* Verification Banner */}
          <div
            className={`rounded-xl p-3.5 flex items-center justify-between gap-3 shrink-0 border ${
              isIllustrative
                ? 'bg-[#fbf7ee] border-[#ede4d4]'
                : 'bg-[#101418] border-[#3d4a3e]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className={`w-5 h-5 shrink-0 ${isIllustrative ? 'text-[#0284c7]' : 'text-cyan-400'}`} />
              <div>
                <div className={`text-xs font-semibold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>LeetCode Live Verification</div>
                <p className={`text-[11px] font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                  Linked handle: <span className={isIllustrative ? 'text-[#0284c7] font-bold' : 'text-cyan-400'}>@{currentUser.username || 'Not set'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleVerifyLeetCode()}
              disabled={verifying}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors shrink-0 font-mono shadow-sm ${
                isIllustrative
                  ? 'bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] border border-[#bae6fd]'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Checking...' : 'Verify LC'}</span>
            </button>
          </div>

          {verifiedStatus !== null && (
            <div
              className={`border text-xs p-3 rounded-xl flex items-center gap-2 ${
                verifiedStatus
                  ? isIllustrative
                    ? 'bg-[#d8f3dc] border-[#b7e4c7] text-[#2d6a4f]'
                    : 'bg-[#4ade80]/10 border-[#4ade80]/40 text-[#4ade80]'
                  : isIllustrative
                  ? 'bg-[#fef3c7] border-[#fde68a] text-[#d97706]'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{verifyMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* LeetCode Submission / Solution Link Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>LeetCode Link / Submission (Optional)</label>
                <span className={`text-[10px] font-mono flex items-center gap-1 ${isIllustrative ? 'text-[#0284c7]' : 'text-cyan-400'}`}>
                  <ExternalLink className="w-3 h-3" /> Paste URL to auto-fill &amp; verify
                </span>
              </div>
              <div className="relative">
                <ExternalLink className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => handleSubmissionUrlChange(e.target.value)}
                  placeholder="https://leetcode.com/problems/... or submission URL"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-mono focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Approach &amp; Key Notes (Optional)</label>
              <div className="relative">
                <FileText className={`w-4 h-4 absolute left-3 top-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Two-pointer approach with O(n) time, O(1) space."
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 shrink-0">
              <Button variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Mark Complete
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

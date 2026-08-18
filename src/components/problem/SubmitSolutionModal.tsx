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
  const { currentUser, submitSolution, setToast } = useApp();

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedStatus, setVerifiedStatus] = useState<boolean | null>(null);
  const [verifyMessage, setVerifyMessage] = useState('');

  if (!isOpen) return null;

  const handleVerifyLeetCode = async () => {
    if (!currentUser.username) {
      setToast({
        title: 'Handle Required',
        message: 'Please link your LeetCode handle in Profile settings first to verify submissions.',
        type: 'warning',
      });
      return;
    }

    setVerifying(true);
    const result = await verifyUserSubmission(currentUser.username, problem.title);
    setVerifying(false);
    setVerifiedStatus(result.verified);
    setVerifyMessage(result.message);

    if (result.verified && !notes) {
      setNotes(`Accepted solution verified via LeetCode @${currentUser.username}`);
    }

    setToast({
      title: result.verified ? 'Verified on LeetCode! ✨' : 'Verification Notice',
      message: result.message,
      type: result.verified ? 'success' : 'info',
    });
  };

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
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-5 sm:p-6 z-10 my-auto flex flex-col mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
              <h3 className="font-bold text-base sm:text-lg text-white font-sans">Mark Problem as Solved</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Solution for <span className="text-[#4ade80] font-semibold">{problem.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          {/* Verification Banner */}
          <div className="bg-[#101418] border border-[#3d4a3e] rounded-xl p-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">LeetCode Live Verification</div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Linked handle: <span className="text-cyan-400">@{currentUser.username || 'Not set'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyLeetCode}
              disabled={verifying}
              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0 font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Checking...' : 'Verify LC'}</span>
            </button>
          </div>

          {verifiedStatus !== null && (
            <div
              className={`border text-xs p-3 rounded-xl flex items-center gap-2 ${
                verifiedStatus
                  ? 'bg-[#4ade80]/10 border-[#4ade80]/40 text-[#4ade80]'
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
                <label className="block text-xs font-mono text-slate-400">LeetCode Link / Submission (Optional)</label>
                <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Paste URL to auto-fill & verify
                </span>
              </div>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => handleSubmissionUrlChange(e.target.value)}
                  placeholder="https://leetcode.com/problems/... or submission URL"
                  className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Approach & Key Notes (Optional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Two-pointer approach with O(n) time, O(1) space."
                  className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
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

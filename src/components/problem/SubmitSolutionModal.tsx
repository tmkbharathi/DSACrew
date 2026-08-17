import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { verifyUserSubmission } from '../../services/leetcodeApi';
import type { Problem } from '../../types';
import { X, CheckCircle2, Code2, Clock, FileText, ShieldCheck, RefreshCw, Sparkles, Cpu, HardDrive } from 'lucide-react';

interface SubmitSolutionModalProps {
  problem: Problem;
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { id: 'python', name: 'Python 3' },
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
];

export const SubmitSolutionModal: React.FC<SubmitSolutionModalProps> = ({ problem, isOpen, onClose }) => {
  const { currentUser, submitSolution, setToast } = useApp();

  const [language, setLanguage] = useState('python');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [timeSpent, setTimeSpent] = useState(20);
  const [runtimeInput, setRuntimeInput] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
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
    setToast({
      title: result.verified ? 'Verified on LeetCode!' : 'Verification Notice',
      message: result.message,
      type: result.verified ? 'success' : 'info',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSnippet.trim()) {
      setToast({ title: 'Code Required', message: 'Please paste your solution code snippet.', type: 'warning' });
      return;
    }

    submitSolution(problem.id, {
      language,
      codeSnippet,
      timeSpentMinutes: Number(timeSpent),
      runtimeMs: runtimeInput.trim() ? (runtimeInput.includes('ms') ? runtimeInput.trim() : `${runtimeInput.trim()} ms`) : undefined,
      memoryMb: memoryInput.trim() ? (memoryInput.includes('MB') ? memoryInput.trim() : `${memoryInput.trim()} MB`) : undefined,
      notes,
      verifiedLeetCode: verifiedStatus === true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg text-white">Mark Problem as Solved</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Submitting solution for <span className="text-emerald-400 font-semibold">{problem.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Verification banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">LeetCode Live Verification</div>
                <p className="text-[11px] text-slate-400">
                  Linked handle: <span className="text-cyan-400">@{currentUser.username || 'Not set'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleVerifyLeetCode}
              disabled={verifying}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Checking API...' : 'Verify on LeetCode'}
            </button>
          </div>

          {verifiedStatus !== null && (
            <div
              className={`border text-xs p-3 rounded-xl flex items-center gap-2 ${
                verifiedStatus
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{verifyMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Language</label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Time Taken (Minutes)</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={1}
                    max={240}
                    required
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Optional Actual Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Runtime (Optional)</label>
                <div className="relative">
                  <Cpu className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={runtimeInput}
                    onChange={(e) => setRuntimeInput(e.target.value)}
                    placeholder="e.g. 48 ms"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Memory (Optional)</label>
                <div className="relative">
                  <HardDrive className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={memoryInput}
                    onChange={(e) => setMemoryInput(e.target.value)}
                    placeholder="e.g. 17.5 MB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Solution Code Snippet</label>
              <textarea
                required
                rows={6}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="Paste your solution code snippet here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Approach & Key Takeaways / Notes</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Used two-pointer approach after sorting array. Edge case: negative numbers."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Solution
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

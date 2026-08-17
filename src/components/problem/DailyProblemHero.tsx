import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Problem } from '../../types';
import { SubmitSolutionModal } from './SubmitSolutionModal';
import { PostProblemModal } from './PostProblemModal';
import { ExternalLink, CheckCircle2, Clock, Tag, Sparkles, Code2, Flame, UserCheck, PlusCircle, Trash2 } from 'lucide-react';

interface DailyProblemHeroProps {
  problem?: Problem;
}

export const DailyProblemHero: React.FC<DailyProblemHeroProps> = ({ problem }) => {
  const { currentUser, activeRoom, deleteProblem } = useApp();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [selectedCodeSnippet, setSelectedCodeSnippet] = useState<{ name: string; code: string; lang: string } | null>(null);

  const isAdmin = currentUser.systemRole === 'SuperAdmin' || currentUser.role === 'Admin';

  if (!problem) {
    return (
      <div className="bg-[#1c2024]/80 backdrop-blur-md rounded-2xl border border-[#3d4a3e] flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center shadow-lg relative z-10 min-h-[360px]">
        <Sparkles className="w-14 h-14 text-[#4ade80] mb-5 opacity-90 animate-pulse" />
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-sans">No Daily Problem Active Yet</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-6 leading-relaxed">
          Be the hero for <span className="text-[#4ade80] font-semibold">{activeRoom?.name || 'your room'}</span>! Post today's LeetCode problem or auto-fetch the official challenge.
        </p>
        <button
          onClick={() => setIsPostOpen(true)}
          className="bg-[#4ade80] text-[#005e2d] hover:bg-[#6dfe9c] transition-all font-semibold px-6 py-3 rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)] hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Daily Problem</span>
        </button>
        <PostProblemModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />
      </div>
    );
  }

  const userSubmission = problem.submissions.find((s) => s.userId === currentUser.id);
  const isSolved = Boolean(userSubmission);

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Daily Challenge Card */}
      <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80]/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="bg-[#4ade80]/20 text-[#4ade80] text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border border-[#4ade80]/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#4ade80]" /> Daily Challenge
              </span>
              <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getDiffBadge(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              {problem.targetTimeMinutes && (
                <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {problem.targetTimeMinutes} mins
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="break-words">{problem.title}</span>
              {isSolved && (
                <span className="bg-[#4ade80]/20 text-[#4ade80] text-xs px-2.5 py-0.5 rounded-full border border-[#4ade80]/40 flex items-center gap-1 font-semibold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              )}
            </h2>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-2.5 sm:mt-3">
              {problem.tags.map((tag, i) => (
                <span key={i} className="bg-[#101418] text-slate-300 text-[11px] sm:text-xs px-2.5 py-1 rounded-lg border border-[#3d4a3e] flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                </span>
              ))}
            </div>

            <div className="text-[11px] sm:text-xs text-slate-400 mt-3 flex items-center gap-1.5 font-mono">
              <span>Posted by:</span>
              <img src={problem.postedBy.avatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
              <span className="text-slate-200 font-medium truncate">{problem.postedBy.name}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 shrink-0 pt-2 lg:pt-0">
            <a
              href={problem.url}
              target="_blank"
              rel="noreferrer"
              className="bg-[#101418] hover:bg-[#262a2f] text-white text-xs px-4 py-2.5 rounded-lg font-semibold border border-[#3d4a3e] flex items-center justify-center gap-2 transition-all"
            >
              Solve on LeetCode
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {!isSolved ? (
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="bg-[#4ade80] hover:bg-[#6dfe9c] text-[#005e2d] text-xs px-4 sm:px-5 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(74,222,128,0.15)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Solved
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="bg-[#101418] hover:bg-[#262a2f] text-[#4ade80] border border-[#4ade80]/30 text-xs px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Code2 className="w-4 h-4" />
                Update Submission
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => deleteProblem(problem.id)}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all"
                title="Delete Problem (Admin)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Room completions status */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#3d4a3e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#4ade80]" />
            <span className="text-xs font-semibold text-slate-300">Room Solved Status:</span>
            <span className="text-xs text-[#4ade80] font-bold font-mono">
              {problem.submissions.length} / {activeRoom?.members.length || 1} Members Completed
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {problem.submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() =>
                  setSelectedCodeSnippet({
                    name: sub.userName,
                    code: sub.codeSnippet,
                    lang: sub.language,
                  })
                }
                className="flex items-center gap-1.5 bg-[#101418] border border-[#4ade80]/40 rounded-lg px-2 py-1 text-xs text-slate-200 cursor-pointer hover:border-[#4ade80] transition-colors"
                title={`View solution by ${sub.userName}`}
              >
                <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />
                <span className="truncate max-w-[80px]">{sub.userName}</span>
                {sub.runtimeMs && <span className="text-[10px] text-slate-400 font-mono">({sub.runtimeMs})</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Snippet Modal */}
      {selectedCodeSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedCodeSnippet(null)} />
          <div className="relative w-full max-w-2xl bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-5 sm:p-6 shadow-2xl z-10 space-y-4 max-h-[85vh] flex flex-col mx-3">
            <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#4ade80]" />
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Solution by <span className="text-[#4ade80]">{selectedCodeSnippet.name}</span>
                </h3>
              </div>
              <span className="text-xs font-mono uppercase bg-[#101418] text-slate-400 px-2 py-0.5 rounded border border-[#3d4a3e]">
                {selectedCodeSnippet.lang}
              </span>
            </div>

            <div className="flex-1 overflow-auto bg-[#101418] border border-[#3d4a3e] rounded-lg p-4 font-mono text-xs text-[#4ade80] leading-relaxed">
              <pre>{selectedCodeSnippet.code}</pre>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedCodeSnippet(null)}
                className="px-4 py-2 bg-[#31353a] hover:bg-[#262a2f] text-slate-200 text-xs rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Solution Modal */}
      <SubmitSolutionModal problem={problem} isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
    </div>
  );
};

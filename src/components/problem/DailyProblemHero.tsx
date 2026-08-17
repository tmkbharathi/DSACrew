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
      <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-slate-800 my-4">
        <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-1">No Daily Problem Active Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
          Be the hero for <span className="text-emerald-400">{activeRoom?.name || 'your room'}</span>! Post today's LeetCode problem or auto-fetch the official challenge.
        </p>
        <button
          onClick={() => setIsPostOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Post Daily Problem
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Daily Challenge Card */}
      <div className="glass-panel bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-emerald-950/30 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400" /> Daily Challenge
              </span>
              <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border ${getDiffBadge(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              {problem.targetTimeMinutes && (
                <span className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {problem.targetTimeMinutes} mins
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="break-words">{problem.title}</span>
              {isSolved && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 font-semibold shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                </span>
              )}
            </h2>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-2.5 sm:mt-3">
              {problem.tags.map((tag, i) => (
                <span key={i} className="bg-slate-800/80 text-slate-300 text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-700/60 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" /> {tag}
                </span>
              ))}
            </div>

            <div className="text-[11px] sm:text-xs text-slate-400 mt-2.5 sm:mt-3 flex items-center gap-1.5">
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
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              Solve on LeetCode
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {!isSolved ? (
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs px-4 sm:px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all glow-emerald"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Solved
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitOpen(true)}
                className="bg-slate-800/80 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs px-3.5 sm:px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Code2 className="w-4 h-4" />
                Update Submission
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => deleteProblem(problem.id)}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all"
                title="Delete Problem (Admin)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Room completions status */}
        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Room Solved Status:</span>
            <span className="text-xs text-emerald-400 font-bold">
              {problem.submissions.length} / {activeRoom?.members.length || 1} Members Completed
            </span>
          </div>

          <div className="flex items-center gap-2">
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
                className="group relative cursor-pointer"
                title={`${sub.userName} solved in ${sub.timeSpentMinutes}m (Click to view code)`}
              >
                <img
                  src={sub.userAvatar}
                  alt={sub.userName}
                  className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500/80 group-hover:scale-110 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                  ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Snippet Modal Viewer */}
      {selectedCodeSnippet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedCodeSnippet(null)} />
          <div className="relative w-full max-w-2xl glass-panel bg-slate-900 border border-slate-800 rounded-2xl p-6 z-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" /> Solution by {selectedCodeSnippet.name}
                </h4>
                <span className="text-[11px] text-slate-400 uppercase font-mono">{selectedCodeSnippet.lang}</span>
              </div>
              <button
                onClick={() => setSelectedCodeSnippet(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              <code>{selectedCodeSnippet.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Modals */}
      <SubmitSolutionModal problem={problem} isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} />
      <PostProblemModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} />
    </div>
  );
};

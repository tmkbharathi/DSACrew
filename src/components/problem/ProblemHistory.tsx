import React from 'react';
import { useApp } from '../../context/AppContext';
import { ExternalLink, CheckCircle2, XCircle, Calendar, Clock, Tag, Trash2, History } from 'lucide-react';

export const ProblemHistory: React.FC = () => {
  const { activeRoom, currentUser, deleteProblem } = useApp();

  if (!activeRoom || activeRoom.dailyProblems.length === 0) {
    return (
      <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-8 text-center text-slate-400 font-mono text-sm">
        No problem history found for this room.
      </div>
    );
  }

  const isAdmin = currentUser.systemRole === 'SuperAdmin' || currentUser.role === 'Admin';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#4ade80]" />
          <h3 className="font-bold text-lg text-white font-sans">Scheduled Problem History</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono font-medium">
          Total Problems: {activeRoom.dailyProblems.length}
        </span>
      </div>

      <div className="space-y-3">
        {activeRoom.dailyProblems.map((prob) => {
          const userSub = prob.submissions.find((s) => s.userId === currentUser.id);
          const isSolved = Boolean(userSub);

          return (
            <div
              key={prob.id}
              className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 transition-all shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white text-base font-sans">{prob.title}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDiffBadge(prob.difficulty)}`}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap font-mono">
                    <span className="flex items-center gap-1 text-[#4ade80]">
                      <Calendar className="w-3.5 h-3.5" /> {prob.date}
                    </span>
                    {prob.targetTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {prob.targetTimeMinutes} mins
                      </span>
                    )}
                    <span>
                      {prob.submissions.length} / {activeRoom.members.length} Solved
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {prob.tags.map((t, i) => (
                      <span key={i} className="bg-[#101418] text-slate-300 text-[10px] px-2 py-0.5 rounded border border-[#3d4a3e] flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-400" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <a
                  href={prob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#101418] hover:bg-[#262a2f] text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-[#3d4a3e] flex items-center gap-1 transition-colors"
                >
                  LeetCode <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                {isAdmin && (
                  <button
                    onClick={() => deleteProblem(prob.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                    title="Delete Problem (Admin)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

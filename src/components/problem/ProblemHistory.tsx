import React from 'react';
import { useApp } from '../../context/AppContext';
import { ExternalLink, CheckCircle2, XCircle, Calendar, Clock, Tag, Trash2 } from 'lucide-react';

export const ProblemHistory: React.FC = () => {
  const { activeRoom, currentUser, deleteProblem } = useApp();

  if (!activeRoom || activeRoom.dailyProblems.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
        No problem history found for this room.
      </div>
    );
  }

  const isAdmin = currentUser.systemRole === 'SuperAdmin' || currentUser.role === 'Admin';

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
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-white">Daily Problem History</h3>
        <span className="text-xs text-slate-400 font-medium">
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
              className="glass-panel bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isSolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-white text-base">{prob.title}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDiffBadge(prob.difficulty)}`}>
                      {prob.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
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
                      <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-slate-400" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={prob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
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

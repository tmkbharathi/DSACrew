import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExternalLink, CheckCircle2, XCircle, Calendar, Tag, Trash2, History, Search } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const ProblemHistory: React.FC = () => {
  const { activeRoom, currentUser, deleteProblem } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  if (!activeRoom || activeRoom.dailyProblems.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No problems solved yet"
        description="Your scheduled challenges and completed solutions will appear here chronologically."
      />
    );
  }

  const isAdmin = currentUser.systemRole === 'SuperAdmin' || currentUser.role === 'Admin';

  const filteredProblems = activeRoom.dailyProblems.filter((prob) => {
    const matchesSearch =
      prob.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prob.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff = diffFilter === 'All' || prob.difficulty === diffFilter;

    const userSub = prob.submissions.find((s) => s.userId === currentUser.id);
    const isSolved = Boolean(userSub);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Solved' && isSolved) ||
      (statusFilter === 'Unsolved' && !isSolved);

    return matchesSearch && matchesDiff && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c2024] p-4 rounded-xl border border-[#3d4a3e]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#4ade80]" />
          <h3 className="font-bold text-base sm:text-lg text-white font-sans">Problem History</h3>
          <span className="text-xs font-mono text-slate-400 bg-[#101418] px-2 py-0.5 rounded border border-[#3d4a3e]">
            {filteredProblems.length} of {activeRoom.dailyProblems.length}
          </span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, tag..."
              className="bg-[#101418] border border-[#3d4a3e] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4ade80]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#101418] p-1 rounded-lg border border-[#3d4a3e]">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-2 py-1 text-[11px] font-mono rounded font-semibold transition-colors ${
                  diffFilter === d
                    ? 'bg-[#4ade80]/20 text-[#4ade80]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#101418] p-1 rounded-lg border border-[#3d4a3e]">
            {(['All', 'Solved', 'Unsolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-[11px] font-mono rounded font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Cards List */}
      {filteredProblems.length === 0 ? (
        <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-8 text-center text-slate-400 text-xs font-mono">
          No matching problems found with current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProblems.map((prob) => {
            const userSub = prob.submissions.find((s) => s.userId === currentUser.id);
            const isSolved = Boolean(userSub);

            const diffVariant =
              prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Hard' ? 'hard' : 'medium';

            return (
              <div
                key={prob.id}
                className="bg-[#1c2024] border border-[#3d4a3e] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 transition-all shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0">
                    {isSolved ? (
                      <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm sm:text-base font-sans leading-tight">
                        {prob.title}
                      </h4>
                      <Badge variant={diffVariant} size="sm">
                        {prob.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap font-mono pt-0.5">
                      <span className="flex items-center gap-1 text-[#4ade80]">
                        <Calendar className="w-3.5 h-3.5" /> {prob.date}
                      </span>
                      <span>
                        {prob.submissions.length} / {activeRoom.members.length} Solved
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                      {prob.tags.map((t, i) => (
                        <span
                          key={i}
                          className="bg-[#101418] text-slate-300 text-[10px] px-2 py-0.5 rounded border border-[#3d4a3e] flex items-center gap-1 font-mono"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#101418] hover:bg-[#262a2f] text-slate-200 text-xs px-3 py-2 rounded-lg border border-[#3d4a3e] flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <span>LeetCode</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => deleteProblem(prob.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-colors"
                      title="Delete Problem (Admin)"
                      aria-label="Delete Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

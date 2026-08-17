import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExternalLink, CheckCircle2, XCircle, Calendar, Tag, Trash2, History, Search } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const ProblemHistory: React.FC = () => {
  const { activeRoom, currentUser, deleteProblem, isHost } = useApp();

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

  const isAdmin = isHost;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] p-4 rounded-xl border border-[#30363d]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#3fb950]" />
          <h3 className="font-bold text-base sm:text-lg text-white font-sans">Problem History</h3>
          <span className="text-xs font-mono text-slate-400 bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
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
              className="bg-[#0d1117] border border-[#30363d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#3fb950]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  diffFilter === d
                    ? 'bg-[#2ea043]/20 text-[#3fb950] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-[#30363d]">
            {(['All', 'Solved', 'Unsolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-[#2ea043]/20 text-[#3fb950] font-semibold'
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
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center text-slate-400 text-xs font-sans">
            No challenges match the active filters. Try adjusting your search query or filters.
          </div>
        ) : (
          filteredProblems.map((prob) => {
            const userSub = prob.submissions.find((s) => s.userId === currentUser.id);
            const isSolved = Boolean(userSub);
            const difficultyVariant =
              prob.difficulty === 'Easy' ? 'easy' : prob.difficulty === 'Medium' ? 'medium' : 'hard';

            return (
              <div
                key={prob.id}
                className="bg-[#161b22] border border-[#30363d] hover:border-slate-600 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm group"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {prob.date}
                    </span>
                    <span className="text-slate-600">•</span>
                    <Badge variant={difficultyVariant} size="sm">
                      {prob.difficulty}
                    </Badge>
                    <span className="text-slate-600">•</span>
                    {isSolved ? (
                      <span className="text-xs text-[#3fb950] flex items-center gap-1 font-sans font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved ({userSub?.timeSpentMinutes} mins)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 flex items-center gap-1 font-sans">
                        <XCircle className="w-3.5 h-3.5" /> Unsolved
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-white truncate font-sans">
                    {prob.title}
                  </h4>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {prob.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-[#0d1117] text-slate-300 text-[11px] px-2 py-0.5 rounded border border-[#30363d] flex items-center gap-1 font-sans"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-[#0d1117] hover:bg-[#21262d] text-slate-300 hover:text-white rounded-lg border border-[#30363d] transition-colors"
                    title="Open on LeetCode"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => deleteProblem(prob.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                      title="Delete from History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExternalLink, CheckCircle2, XCircle, Calendar, Tag, Trash2, History, Search } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const ProblemHistory: React.FC = () => {
  const { activeRoom, currentUser, deleteProblem, isHost, theme } = useApp();
  const isIllustrative = theme === 'illustrative';

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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border shadow-sm ${
        isIllustrative ? 'bg-white border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
      }`}>
        <div className="flex items-center gap-2">
          <History className={`w-5 h-5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
          <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
            Problem History
          </h3>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
            isIllustrative
              ? 'bg-[#fbf7ee] text-[#5c6b63] border-[#ede4d4]'
              : 'bg-[#0d1117] text-slate-400 border-[#30363d]'
          }`}>
            {filteredProblems.length} of {activeRoom.dailyProblems.length}
          </span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, tag..."
              className={`rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none border ${
                isIllustrative
                  ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#212d27] placeholder-[#8d9a93] focus:border-[#2d6a4f]'
                  : 'bg-[#0d1117] border-[#30363d] text-white placeholder:text-slate-500 focus:border-[#3fb950]'
              }`}
            />
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#0d1117] border-[#30363d]'
          }`}>
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  diffFilter === d
                    ? isIllustrative
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] font-bold shadow-sm'
                      : 'bg-[#2ea043]/20 text-[#3fb950] font-semibold'
                    : isIllustrative
                    ? 'text-[#5c6b63] hover:text-[#212d27]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#0d1117] border-[#30363d]'
          }`}>
            {(['All', 'Solved', 'Unsolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === s
                    ? isIllustrative
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] font-bold shadow-sm'
                      : 'bg-[#2ea043]/20 text-[#3fb950] font-semibold'
                    : isIllustrative
                    ? 'text-[#5c6b63] hover:text-[#212d27]'
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
          <div className={`rounded-2xl p-8 text-center text-xs font-sans border ${
            isIllustrative
              ? 'bg-white border-[#ede4d4] text-[#5c6b63]'
              : 'bg-[#161b22] border-[#30363d] text-slate-400'
          }`}>
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
                className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm group border ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4] hover:border-[#2d6a4f]/50'
                    : 'bg-[#161b22] border-[#30363d] hover:border-slate-600'
                }`}
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs flex items-center gap-1 font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      <Calendar className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`} />
                      {prob.date}
                    </span>
                    <span className="text-slate-400">•</span>
                    <Badge variant={difficultyVariant} size="sm">
                      {prob.difficulty}
                    </Badge>
                    <span className="text-slate-400">•</span>
                    {isSolved ? (
                      <span className={`text-xs flex items-center gap-1 font-sans font-medium ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved ({userSub?.timeSpentMinutes} mins)
                      </span>
                    ) : (
                      <span className={`text-xs flex items-center gap-1 font-sans ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>
                        <XCircle className="w-3.5 h-3.5" /> Unsolved
                      </span>
                    )}
                  </div>

                  <h4 className={`font-bold text-sm sm:text-base truncate font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                    {prob.title}
                  </h4>

                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {prob.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg border flex items-center gap-1 font-sans ${
                          isIllustrative
                            ? 'bg-[#fbf7ee] text-[#212d27] border-[#ede4d4]'
                            : 'bg-[#0d1117] text-slate-300 border-[#30363d]'
                        }`}
                      >
                        <Tag className={`w-2.5 h-2.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-400'}`} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-2 rounded-xl border transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                        : 'bg-[#0d1117] hover:bg-[#21262d] text-slate-300 hover:text-white border-[#30363d]'
                    }`}
                    title="Open on LeetCode"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {(isHost || prob.postedBy.id === currentUser.id) && (
                    <button
                      onClick={() => deleteProblem(prob.id)}
                      className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Problem } from '../../types';
import { MessageSquare, Send, Code, Trash2, Pin } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProblemDiscussionProps {
  problem?: Problem;
}

export const ProblemDiscussion: React.FC<ProblemDiscussionProps> = ({ problem }) => {
  const { addComment, deleteComment, currentUser, isHost } = useApp();
  const [content, setContent] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');

  if (!problem) return null;

  const isAdmin = isHost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addComment(problem.id, content, showCodeInput ? codeSnippet : undefined);
    setContent('');
    setCodeSnippet('');
    setShowCodeInput(false);
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 sm:p-6 space-y-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#30363d] pb-3.5">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white font-sans leading-tight">
              Room Discussions &amp; Code Review
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Discussing: <span className="text-[#3fb950] font-semibold">{problem.title}</span>
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-[#0d1117] px-2.5 py-1 rounded-md border border-[#30363d]">
          {problem.comments.length} {problem.comments.length === 1 ? 'Reply' : 'Replies'}
        </span>
      </div>

      {/* Pinned Discussion Guidance */}
      <div className="bg-[#0d1117] border border-purple-500/30 rounded-xl p-3 flex items-start gap-2.5">
        <Pin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-sans">
          <span className="font-semibold text-purple-300">Pinned Topic:</span> Share your time/space complexities, edge case realizations, or alternative algorithms for <span className="text-white font-medium">"{problem.title}"</span>.
        </div>
      </div>

      {/* Post comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, algorithm analysis, or request help from teammates..."
            rows={3}
            className="w-full bg-[#0d1117] border border-[#30363d] text-white text-xs sm:text-sm rounded-xl p-3 focus:outline-none focus:border-[#3fb950] placeholder-slate-500 transition-colors"
          />

          {showCodeInput && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-sans block">
                Attach Code Snippet:
              </label>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste code snippet here..."
                rows={4}
                className="w-full bg-[#0d1117] border border-[#30363d] text-emerald-300 text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-[#3fb950] placeholder-slate-600 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors font-sans ${
              showCodeInput
                ? 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/40 font-semibold'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border-[#30363d]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showCodeInput ? 'Hide Code' : 'Attach Code'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-3 pt-2">
        {problem.comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-[#30363d] rounded-xl font-sans">
            No comments yet. Be the first to start the discussion for today's challenge!
          </div>
        ) : (
          problem.comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl p-3.5 space-y-2 relative group hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.userAvatar}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover border border-[#30363d]"
                  />
                  <span className="text-xs font-semibold text-white font-sans">{comment.userName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{comment.createdAt}</span>
                </div>

                {(isAdmin || comment.userId === currentUser.id) && (
                  <button
                    onClick={() => deleteComment(problem.id, comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                    title="Delete Comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {comment.content}
              </p>

              {comment.codeSnippet && (
                <pre className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-emerald-300 overflow-x-auto">
                  <code>{comment.codeSnippet}</code>
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

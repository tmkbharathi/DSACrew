import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Problem } from '../../types';
import { MessageSquare, Send, Code, Trash2, Pin } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProblemDiscussionProps {
  problem?: Problem;
}

export const ProblemDiscussion: React.FC<ProblemDiscussionProps> = ({ problem }) => {
  const { addComment, deleteComment, currentUser } = useApp();
  const [content, setContent] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');

  if (!problem) return null;

  const isAdmin = currentUser.systemRole === 'SuperAdmin' || currentUser.role === 'Admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addComment(problem.id, content, showCodeInput ? codeSnippet : undefined);
    setContent('');
    setCodeSnippet('');
    setShowCodeInput(false);
  };

  return (
    <div className="bg-[#1c2024] border border-[#3d4a3e] rounded-2xl p-4 sm:p-6 space-y-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3.5">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white font-sans leading-tight">
              Room Discussions & Code Review
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Discussing: <span className="text-[#4ade80] font-semibold">{problem.title}</span>
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-[#101418] px-2.5 py-1 rounded-md border border-[#3d4a3e]">
          {problem.comments.length} {problem.comments.length === 1 ? 'Reply' : 'Replies'}
        </span>
      </div>

      {/* Pinned Discussion Guidance */}
      <div className="bg-[#101418] border border-purple-500/30 rounded-xl p-3 flex items-start gap-2.5">
        <Pin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed font-sans">
          <span className="font-semibold text-purple-300">Pinned Topic:</span> Share your time/space complexities, edge case realizations, or alternative algorithms for <span className="text-white font-medium">"{problem.title}"</span>.
        </div>
      </div>

      {/* Post comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            required
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Ask a question or explain your approach for "${problem.title}"...`}
            className="w-full bg-[#101418] border border-[#3d4a3e] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#4ade80] resize-none"
          />
        </div>

        {showCodeInput && (
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Optional Code Snippet</label>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste code snippet here..."
              className="w-full bg-[#101418] border border-[#3d4a3e] rounded-xl p-3 text-xs font-mono text-[#4ade80] focus:outline-none focus:border-[#4ade80]"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
              showCodeInput
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-[#101418] text-slate-400 border-[#3d4a3e] hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showCodeInput ? 'Hide Code Snippet' : 'Attach Code Snippet'}</span>
            <span className="sm:hidden">{showCodeInput ? 'Hide Code' : 'Code'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            type="submit"
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Reply
          </Button>
        </div>
      </form>

      {/* Comment Thread List */}
      <div className="space-y-3 pt-1">
        {problem.comments.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-4 font-mono">
            No discussion yet. Be the first to start the conversation!
          </p>
        ) : (
          problem.comments.map((comment) => (
            <div key={comment.id} className="bg-[#101418] border border-[#3d4a3e] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={comment.userAvatar} alt="" className="w-6 h-6 rounded-full object-cover border border-[#3d4a3e]" />
                  <span className="text-xs font-bold text-white">{comment.userName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">{comment.createdAt}</span>
                  {(isAdmin || comment.userId === currentUser.id) && (
                    <button
                      onClick={() => deleteComment(problem.id, comment.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Delete comment"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-8">{comment.content}</p>

              {comment.codeSnippet && (
                <div className="pl-8 pt-1">
                  <div className="bg-[#0b0f13] border border-[#3d4a3e] rounded-lg p-2.5 text-[11px] font-mono text-[#4ade80] overflow-x-auto">
                    <code>{comment.codeSnippet}</code>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

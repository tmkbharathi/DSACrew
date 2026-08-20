import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Problem } from '../../types';
import { MessageSquare, Send, Code, Trash2, Pin } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProblemDiscussionProps {
  problem?: Problem;
}

export const ProblemDiscussion: React.FC<ProblemDiscussionProps> = ({ problem }) => {
  const { addComment, deleteComment, currentUser, isHost, theme } = useApp();
  const [content, setContent] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const isIllustrative = theme === 'illustrative';

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
    <div
      className={`rounded-2xl border p-4 sm:p-6 space-y-4 shadow-md ${
        isIllustrative
          ? 'bg-white border-[#ede4d4]'
          : 'bg-[#161b22] border-[#30363d]'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-3.5 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-purple-100 text-purple-700' : 'bg-purple-900/30 text-purple-400'}`}>
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-bold text-sm sm:text-base font-sans leading-tight ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              Room Discussion &amp; Code Review
            </h3>
            <p className={`text-xs font-sans mt-0.5 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
              Discuss, share &amp; grow together 💚
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-mono px-2.5 py-1 rounded-xl border ${
            isIllustrative
              ? 'bg-[#fbf7ee] text-[#5c6b63] border-[#ede4d4]'
              : 'text-slate-400 bg-[#0d1117] border-[#30363d]'
          }`}
        >
          {problem.comments.length} {problem.comments.length === 1 ? 'Reply' : 'Replies'}
        </span>
      </div>

      {/* Pinned Discussion Guidance */}
      <div
        className={`rounded-xl p-3.5 flex items-start gap-2.5 border ${
          isIllustrative
            ? 'bg-[#faf5ff] border-[#e9d5ff]'
            : 'bg-[#0d1117] border-purple-500/30'
        }`}
      >
        <Pin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <div className={`text-xs leading-relaxed font-sans ${isIllustrative ? 'text-[#581c87]' : 'text-slate-300'}`}>
          <span className="font-semibold text-purple-700">Pinned Topic:</span> Share your brute force approach, edge case testcases, or alternate algorithm for <strong className={isIllustrative ? 'text-[#212d27]' : 'text-white'}>"{problem.title}"</strong>.
        </div>
      </div>

      {/* Post comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, algorithm insights, or request help from teammates..."
            rows={3}
            className={`w-full text-xs sm:text-sm rounded-xl p-3 focus:outline-none transition-colors ${
              isIllustrative
                ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                : 'bg-[#0d1117] border border-[#30363d] text-white focus:border-[#3fb950] placeholder-slate-500'
            }`}
          />

          {showCodeInput && (
            <div className="space-y-1">
              <label className={`text-xs font-sans block ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                Attach Code Snippet:
              </label>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste code snippet here..."
                rows={4}
                className={`w-full text-xs font-mono rounded-xl p-3 focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#1b241e] border border-[#2d6a4f] text-[#d8f3dc] placeholder-slate-500'
                    : 'bg-[#0d1117] border border-[#30363d] text-emerald-300 focus:border-[#3fb950] placeholder-slate-600'
                }`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors font-sans ${
              showCodeInput
                ? isIllustrative
                  ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7] font-semibold'
                  : 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/40 font-semibold'
                : isIllustrative
                ? 'bg-[#fbf7ee] text-[#5c6b63] hover:text-[#212d27] border-[#ede4d4]'
                : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border-[#30363d]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showCodeInput ? 'Hide Code' : 'Attach Code'}</span>
          </button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-3 h-3" />}
            disabled={!content.trim()}
          >
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-3 pt-2">
        {problem.comments.length === 0 ? (
          <div className={`p-6 text-center text-xs font-sans rounded-xl border border-dashed ${
            isIllustrative
              ? 'bg-[#fbf7ee] text-[#8d9a93] border-[#ede4d4]'
              : 'bg-[#0d1117] text-slate-500 border-[#30363d]'
          }`}>
            No comments yet. Be the first to share an algorithm insight!
          </div>
        ) : (
          problem.comments.map((comment) => {
            const canDelete = currentUser.id === comment.userId || isAdmin;
            return (
              <div
                key={comment.id}
                className={`p-3.5 sm:p-4 rounded-xl border space-y-2.5 transition-all ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border-[#ede4d4]'
                    : 'bg-[#0d1117] border-[#30363d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.userAvatar}
                      alt=""
                      className={`w-6 h-6 rounded-full object-cover border ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'}`}
                    />
                    <span className={`text-xs font-semibold font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                      {comment.userName}
                    </span>
                    <span className={`text-[10px] font-sans ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`}>
                      {comment.createdAt}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => deleteComment(problem.id, comment.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className={`text-xs font-sans leading-relaxed whitespace-pre-wrap ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>
                  {comment.content}
                </p>

                {comment.codeSnippet && (
                  <div className="relative mt-2">
                    <pre className="bg-[#0f1411] border border-[#2d6a4f]/40 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
                      <code>{comment.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

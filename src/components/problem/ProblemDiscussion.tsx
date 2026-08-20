import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { Problem, FileAttachment } from '../../types';
import {
  MessageSquare,
  Send,
  Code,
  Trash2,
  Pin,
  Paperclip,
  X,
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  File,
  Download,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ProblemDiscussionProps {
  problem?: Problem;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ProblemDiscussion: React.FC<ProblemDiscussionProps> = ({ problem: propProblem }) => {
  const { addComment, deleteComment, currentUser, isHost, theme, setToast, activeRoom, selectedDate } = useApp();
  const [content, setContent] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isIllustrative = theme === 'illustrative';

  const todayStr = new Date().toISOString().split('T')[0];
  const currentDate = selectedDate || (propProblem?.date === selectedDate ? propProblem.date : todayStr);

  // Find all problems in room on this date strictly
  const problemsOnDate = activeRoom?.dailyProblems.filter((p) => p.date === currentDate) || [];
  const activeProblem = problemsOnDate.find((p) => p.id === activeRoom?.activeProblemId) || problemsOnDate[0] || undefined;

  // Collect all comments for this date
  const dailyComments = problemsOnDate.flatMap((p) => p.comments || []);

  const formatDisplayDate = (dStr: string) => {
    if (dStr === todayStr) return 'Today';
    const d = new Date(dStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isAdmin = isHost;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string, name: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-cyan-400" />;
    if (
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('json') ||
      mimeType.includes('python') ||
      mimeType.includes('html') ||
      mimeType.includes('css') ||
      /\.(js|ts|tsx|jsx|py|java|cpp|c|go|rs|sql|json|html|css|md)$/i.test(name)
    ) {
      return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
    if (
      mimeType.includes('zip') ||
      mimeType.includes('tar') ||
      mimeType.includes('rar') ||
      mimeType.includes('7z') ||
      /\.(zip|tar|gz|rar|7z)$/i.test(name)
    ) {
      return <FileArchive className="w-4 h-4 text-amber-400" />;
    }
    if (mimeType.includes('pdf') || mimeType.includes('text') || /\.(pdf|txt|doc|docx)$/i.test(name)) {
      return <FileText className="w-4 h-4 text-purple-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // 50 MB limit validation
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setToast({
          title: 'File Too Large',
          message: `"${file.name}" exceeds the 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please select files below 50MB.`,
          type: 'error',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const attachment: FileAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
        };

        setAttachments((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0 && !codeSnippet.trim()) return;

    const targetProblemId = activeProblem?.id || (problemsOnDate[0]?.id) || (activeRoom?.dailyProblems[0]?.id) || `day_${currentDate}`;

    addComment(
      targetProblemId,
      content.trim() || (attachments.length > 0 ? `Shared ${attachments.length} attachment(s)` : 'Shared code snippet'),
      showCodeInput ? codeSnippet : undefined,
      attachments.length > 0 ? attachments : undefined
    );

    setContent('');
    setCodeSnippet('');
    setAttachments([]);
    setShowCodeInput(false);
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-6 space-y-4 shadow-md transition-colors ${
        isIllustrative
          ? 'bg-white border-[#ede4d4]'
          : 'bg-[#161b22] border-[#30363d]'
      }`}
    >
      {/* Hidden native file input accepting any file type up to 50MB */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        aria-label="Upload file attachment"
      />

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
              Daily review for <span className="font-semibold text-purple-400">{formatDisplayDate(currentDate)}</span> &bull; Discuss &amp; share 💚
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
          {dailyComments.length} {dailyComments.length === 1 ? 'Reply' : 'Replies'}
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
          <span className="font-semibold text-purple-700">Pinned Topic:</span>{' '}
          {problemsOnDate.length === 1 ? (
            <>Share your brute force approach, edge case testcases, or alternate algorithm for <strong className={isIllustrative ? 'text-[#212d27]' : 'text-white'}>"{problemsOnDate[0].title}"</strong>.</>
          ) : problemsOnDate.length > 1 ? (
            <>Challenges for {formatDisplayDate(currentDate)}: {problemsOnDate.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ', '}
                <strong className={isIllustrative ? 'text-[#212d27]' : 'text-white'}>"{p.title}"</strong> ({p.difficulty})
              </span>
            ))}. Share your approaches, edge cases &amp; solutions!</>
          ) : (
            <>Daily review &amp; discussion for <strong className={isIllustrative ? 'text-[#212d27]' : 'text-white'}>{formatDisplayDate(currentDate)}</strong>. No challenges scheduled yet for this date. Share questions, notes, or attach files (&lt; 50MB).</>
          )}
        </div>
      </div>

      {/* Post comment form */}
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`space-y-3 p-1 rounded-2xl transition-all ${
          isDragging
            ? isIllustrative
              ? 'ring-2 ring-[#2d6a4f] bg-[#d8f3dc]/30'
              : 'ring-2 ring-[#3fb950] bg-[#2ea043]/10'
            : ''
        }`}
      >
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, algorithm insights, or request help from teammates (drag & drop files here)..."
            rows={3}
            className={`w-full text-xs sm:text-sm rounded-xl p-3 focus:outline-none transition-colors font-mono ${
              isIllustrative
                ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                : 'bg-[#0d1117] border border-[#30363d] text-white focus:border-[#3fb950] placeholder-slate-500'
            }`}
          />

          {/* Pending Attachments Preview Chips */}
          {attachments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className={`text-[11px] font-medium flex items-center justify-between font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                <span>Attached Files ({attachments.length}):</span>
                <span className="text-[10px] text-emerald-500 font-mono">Max 50MB per file</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-sans shadow-sm ${
                      isIllustrative
                        ? 'bg-white border-[#ede4d4] text-[#212d27]'
                        : 'bg-[#161b22] border-[#30363d] text-slate-200'
                    }`}
                  >
                    {getFileIcon(att.type, att.name)}
                    <span className="max-w-[150px] truncate font-medium" title={att.name}>
                      {att.name}
                    </span>
                    <span className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                      ({formatFileSize(att.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Attach Code Button */}
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

            {/* Attach File Button (< 50MB) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors font-sans ${
                attachments.length > 0
                  ? isIllustrative
                    ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7] font-semibold'
                    : 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/40 font-semibold'
                  : isIllustrative
                  ? 'bg-[#fbf7ee] text-[#5c6b63] hover:text-[#212d27] border-[#ede4d4]'
                  : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border-[#30363d]'
              }`}
              title="Upload any file below 50MB (images, code, documents, archives)"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach File (&lt; 50MB)</span>
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            leftIcon={<Send className="w-3 h-3" />}
            disabled={!content.trim() && attachments.length === 0 && !codeSnippet.trim()}
          >
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-3 pt-2">
        {dailyComments.length === 0 ? (
          <div
            className={`p-6 text-center text-xs font-mono rounded-xl border border-dashed ${
              isIllustrative
                ? 'bg-[#fbf7ee] text-[#8d9a93] border-[#ede4d4]'
                : 'bg-[#0d1117] text-slate-500 border-[#30363d]'
            }`}
          >
            No comments for this date yet. Be the first to share an algorithm insight!
          </div>
        ) : (
          dailyComments.map((comment) => {
            const canDelete = currentUser.id === comment.userId || isAdmin;
            let displayContent = comment.content;
            let displayAttachments = comment.attachments || [];

            if (comment.content && comment.content.includes('<!--ATTACHMENTS:')) {
              const match = comment.content.match(/<!--ATTACHMENTS:(.*?)-->/s);
              if (match) {
                try {
                  const parsed = JSON.parse(match[1]);
                  if (Array.isArray(parsed) && displayAttachments.length === 0) {
                    displayAttachments = parsed;
                  }
                  displayContent = comment.content.replace(/<!--ATTACHMENTS:(.*?)-->/s, '').trim();
                } catch {}
              }
            }

            const handleDownloadFile = (att: FileAttachment) => {
              if (!att.dataUrl) return;
              const link = document.createElement('a');
              link.href = att.dataUrl;
              link.download = att.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

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
                      onClick={() => deleteComment(activeProblem?.id || '', comment.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className={`text-xs font-sans leading-relaxed whitespace-pre-wrap ${isIllustrative ? 'text-[#212d27]' : 'text-slate-200'}`}>
                  {displayContent}
                </p>

                {/* Attached Code Snippet */}
                {comment.codeSnippet && (
                  <div className="relative mt-2">
                    <pre className="bg-[#0f1411] border border-[#2d6a4f]/40 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
                      <code>{comment.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Attached Files List in Comment */}
                {displayAttachments && displayAttachments.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2">
                      {displayAttachments.map((att) => {
                        const isImage = att.type.startsWith('image/') && att.dataUrl;
                        return (
                          <div key={att.id} className="space-y-1.5">
                            {/* Inline Image Preview */}
                            {isImage && (
                              <div className="relative group max-w-sm rounded-xl overflow-hidden border border-[#30363d] bg-black/40">
                                <img
                                  src={att.dataUrl}
                                  alt={att.name}
                                  className="max-h-56 w-auto object-contain cursor-pointer transition-transform group-hover:scale-[1.02]"
                                  onClick={() => setPreviewImage(att.dataUrl || null)}
                                />
                              </div>
                            )}

                            {/* File Download / Details Card */}
                            <div
                              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-xs font-sans ${
                                isIllustrative
                                  ? 'bg-white border-[#ede4d4] text-[#212d27]'
                                  : 'bg-[#161b22] border-[#30363d] text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {getFileIcon(att.type, att.name)}
                                <div className="min-w-0">
                                  <div className="font-semibold truncate max-w-[180px] sm:max-w-[240px]" title={att.name}>
                                    {att.name}
                                  </div>
                                  <div className={`text-[10px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                                    {formatFileSize(att.size)}
                                  </div>
                                </div>
                              </div>

                              {att.dataUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(att)}
                                  className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                                    isIllustrative
                                      ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7] hover:bg-[#b7e4c7]'
                                      : 'bg-[#2ea043]/15 text-[#3fb950] border-[#2ea043]/40 hover:bg-[#2ea043]/30'
                                  }`}
                                  title={`Download ${att.name}`}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Download</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#161b22] p-3 rounded-2xl border border-[#30363d] overflow-hidden flex flex-col items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-2 pb-2 border-b border-[#30363d]">
              <span className="text-xs text-slate-300 font-sans">Image Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  download="attachment_image.png"
                  className="bg-[#2ea043]/20 hover:bg-[#2ea043]/40 text-[#3fb950] border border-[#2ea043]/40 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

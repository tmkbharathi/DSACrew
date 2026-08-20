import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Users, Target, FileText, Sparkles, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_EMOJIS = [
  '⛺', '💻', '🚀', '🧠', '⚡', '🏆', 
  '🔥', '🎯', '☕', '🎮', '💎', '👑', 
  '🦉', '🦁', '🦊', '🐼', '🤖', '👾',
  '🌲', '🏔️', '🍕', '✨', '🥇', '🕹️'
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createRoom, setIsLandingView, theme } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoalMode, setSelectedGoalMode] = useState<string>('1');
  const [customGoal, setCustomGoal] = useState<number>(4);
  const [selectedLogo, setSelectedLogo] = useState<string>('⛺');
  const [logoTab, setLogoTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isIllustrative = theme === 'illustrative';
  const isImageLogo = selectedLogo.startsWith('http') || selectedLogo.startsWith('data:image');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setSelectedLogo(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setSelectedLogo(customUrl.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalGoal = selectedGoalMode === 'custom' ? Math.max(1, customGoal || 1) : Number(selectedGoalMode);
    createRoom(name, description, finalGoal, selectedLogo || '⛺');
    setName('');
    setDescription('');
    setSelectedGoalMode('1');
    setSelectedLogo('⛺');
    onClose();

    if (onSuccess) onSuccess();
    setIsLandingView(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 z-10 my-auto max-h-[90vh] flex flex-col mx-3 border transition-all overflow-y-auto ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              Create Practice Room
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isIllustrative ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#262a2f]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name & Logo Preview */}
          <div>
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Room Name</label>
            <div className="flex items-center gap-2.5">
              {/* Selected Logo Preview Badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner border ${
                  isIllustrative
                    ? 'bg-[#d8f3dc] border-[#b7e4c7]'
                    : 'bg-[#0d1117] border-[#30363d]'
                }`}
                title="Current Room Logo"
              >
                {isImageLogo ? (
                  <img src={selectedLogo} alt="Room Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{selectedLogo || '⛺'}</span>
                )}
              </div>

              <div className="relative flex-1">
                <Users className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily LeetCode Masters"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Room Logo Selector Section */}
          <div className={`p-3 rounded-xl border space-y-2.5 ${isIllustrative ? 'bg-[#faf5ea] border-[#ede4d4]' : 'bg-[#101418] border-[#30363d]'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-mono font-semibold flex items-center gap-1.5 ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                <ImageIcon className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
                <span>Room Logo / Icon</span>
              </label>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1">
                {(['presets', 'upload', 'url'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLogoTab(tab)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono capitalize transition-all ${
                      logoTab === tab
                        ? isIllustrative
                          ? 'bg-[#2d6a4f] text-white font-bold'
                          : 'bg-[#2ea043] text-white font-bold'
                        : isIllustrative
                        ? 'text-[#5c6b63] hover:text-[#212d27] hover:bg-[#ede4d4]'
                        : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                    }`}
                  >
                    {tab === 'presets' ? 'Emoji' : tab === 'upload' ? 'Upload' : 'Link'}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets View */}
            {logoTab === 'presets' && (
              <div className="grid grid-cols-8 gap-1.5 pt-0.5">
                {PRESET_EMOJIS.map((emoji) => {
                  const isSelected = selectedLogo === emoji;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedLogo(emoji)}
                      className={`h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                        isSelected
                          ? isIllustrative
                            ? 'bg-[#d8f3dc] ring-2 ring-[#2d6a4f] scale-110 shadow-sm'
                            : 'bg-[#2ea043]/30 ring-2 ring-[#3fb950] scale-110 shadow-sm'
                          : isIllustrative
                          ? 'bg-white hover:bg-[#fbf7ee] border border-[#ede4d4]'
                          : 'bg-[#161b22] hover:bg-[#21262d] border border-[#30363d]'
                      }`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Upload File View */}
            {logoTab === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-3 px-4 rounded-xl border border-dashed text-xs flex items-center justify-center gap-2 transition-all ${
                    isIllustrative
                      ? 'border-[#b7e4c7] bg-white hover:bg-[#d8f3dc]/30 text-[#2d6a4f]'
                      : 'border-[#30363d] bg-[#161b22] hover:bg-[#21262d] text-slate-300'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File (PNG, JPG, SVG, WebP)</span>
                </button>
              </div>
            )}

            {/* URL Link View */}
            {logoTab === 'url' && (
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <LinkIcon className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`} />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className={`w-full rounded-lg pl-8 pr-2 py-1.5 text-xs font-mono focus:outline-none border ${
                      isIllustrative
                        ? 'bg-white border-[#ede4d4] text-[#212d27] placeholder-[#8d9a93] focus:border-[#2d6a4f]'
                        : 'bg-[#161b22] border-[#30363d] text-white placeholder:text-slate-500 focus:border-[#3fb950]'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    isIllustrative
                      ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                      : 'bg-[#2ea043] hover:bg-[#3fb950] text-white'
                  }`}
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Description / Target</label>
            <div className="relative">
              <FileText className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this room's goal? (e.g. Daily practice for interview prep)"
                rows={2}
                className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none resize-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Daily Target Goal</label>
            <div className="space-y-2">
              <div className="relative">
                <Target className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                <select
                  value={selectedGoalMode}
                  onChange={(e) => setSelectedGoalMode(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                      : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                  }`}
                >
                  <option value="1">1 Problem per day</option>
                  <option value="2">2 Problems per day</option>
                  <option value="3">3 Problems per day</option>
                  <option value="custom">Any number (Custom target...)</option>
                </select>
              </div>

              {selectedGoalMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    placeholder="Enter target count (e.g. 5)"
                    className={`w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none font-mono transition-colors ${
                      isIllustrative
                        ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                        : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                    }`}
                  />
                  <span className={`text-xs font-sans shrink-0 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                    problems / day
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 shrink-0">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Create Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

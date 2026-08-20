import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Image as ImageIcon, Upload, Check, Sparkles, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EditRoomLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  currentLogo?: string;
}

const PRESET_EMOJIS = [
  '⛺', '💻', '🚀', '🧠', '⚡', '🏆', 
  '🔥', '🎯', '☕', '🎮', '💎', '👑', 
  '🦉', '🦁', '🦊', '🐼', '🤖', '👾',
  '🌲', '🏔️', '🍕', '✨', '🥇', '🕹️'
];

export const EditRoomLogoModal: React.FC<EditRoomLogoModalProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
  currentLogo = '⛺',
}) => {
  const { updateRoomLogo, theme } = useApp();
  const [selectedLogo, setSelectedLogo] = useState<string>(currentLogo || '⛺');
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isIllustrative = theme === 'illustrative';

  React.useEffect(() => {
    if (isOpen) {
      setSelectedLogo(currentLogo || '⛺');
      if (currentLogo && (currentLogo.startsWith('http') || currentLogo.startsWith('data:image'))) {
        setCustomUrl(currentLogo.startsWith('http') ? currentLogo : '');
      }
    }
  }, [isOpen, currentLogo]);

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
    if (customUrl.trim()) {
      setSelectedLogo(customUrl.trim());
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateRoomLogo(roomId, selectedLogo);
    setIsSaving(false);
    onClose();
  };

  const isImageLogo = selectedLogo.startsWith('http') || selectedLogo.startsWith('data:image');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 my-auto flex flex-col border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 shrink-0 ${
          isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'
            }`}>
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
                Change Room Logo
              </h3>
              <p className={`text-[11px] font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                {roomName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isIllustrative ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#fbf7ee]' : 'text-slate-400 hover:text-white hover:bg-[#262a2f]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className={`p-4 rounded-xl mb-4 border flex items-center gap-3.5 ${
          isIllustrative ? 'bg-[#faf5ea] border-[#ede4d4]' : 'bg-[#101418] border-[#30363d]'
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-[#d8f3dc] border border-[#b7e4c7] flex items-center justify-center text-2xl shrink-0 overflow-hidden shadow-inner">
            {isImageLogo ? (
              <img src={selectedLogo} alt="Room Logo" className="w-full h-full object-cover" />
            ) : (
              <span>{selectedLogo}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-[10px] font-mono uppercase tracking-wider ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
              PREVIEW IN SIDEBAR
            </div>
            <h4 className="font-bold text-sm truncate font-sans">{roomName}</h4>
            <div className={`text-[11px] flex items-center gap-1 mt-0.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`}>
              <Sparkles className="w-3 h-3" />
              <span>Click Save to update everyone's view</span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className={`flex rounded-xl p-1 mb-4 border ${
          isIllustrative ? 'bg-[#fbf7ee] border-[#ede4d4]' : 'bg-[#101418] border-[#30363d]'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'presets'
                ? isIllustrative
                  ? 'bg-white text-[#2d6a4f] shadow-sm'
                  : 'bg-[#21262d] text-white shadow-sm'
                : isIllustrative
                ? 'text-[#5c6b63] hover:text-[#212d27]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? isIllustrative
                  ? 'bg-white text-[#2d6a4f] shadow-sm'
                  : 'bg-[#21262d] text-white shadow-sm'
                : isIllustrative
                ? 'text-[#5c6b63] hover:text-[#212d27]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'url'
                ? isIllustrative
                  ? 'bg-white text-[#2d6a4f] shadow-sm'
                  : 'bg-[#21262d] text-white shadow-sm'
                : isIllustrative
                ? 'text-[#5c6b63] hover:text-[#212d27]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Image Link
          </button>
        </div>

        {/* Tab 1: Emoji Presets */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-6 gap-2 mb-4 max-h-48 overflow-y-auto p-1">
            {PRESET_EMOJIS.map((emoji) => {
              const isSelected = selectedLogo === emoji;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedLogo(emoji)}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all relative border ${
                    isSelected
                      ? isIllustrative
                        ? 'bg-[#d8f3dc] border-[#2d6a4f] scale-105 shadow-sm ring-2 ring-[#2d6a4f]/30'
                        : 'bg-[#2ea043]/20 border-[#3fb950] scale-105 shadow-sm ring-2 ring-[#3fb950]/30'
                      : isIllustrative
                      ? 'bg-[#fbf7ee] hover:bg-[#f4ede0] border-[#ede4d4]'
                      : 'bg-[#101418] hover:bg-[#21262d] border-[#30363d]'
                  }`}
                >
                  <span>{emoji}</span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isIllustrative
                  ? 'border-[#ede4d4] hover:border-[#2d6a4f] bg-[#fbf7ee]'
                  : 'border-[#30363d] hover:border-[#3fb950] bg-[#101418]'
              }`}
            >
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#3fb950]'}`} />
              <p className="text-xs font-semibold font-sans">Click to choose image from device</p>
              <p className={`text-[10px] mt-1 font-mono ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-400'}`}>
                Supports PNG, JPG, WebP, SVG, GIF
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Custom URL */}
        {activeTab === 'url' && (
          <div className="space-y-3 mb-4">
            <label className={`block text-xs font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
              Paste Direct Image URL:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:outline-none transition-colors border ${
                    isIllustrative
                      ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                      : 'bg-[#101418] border-[#30363d] text-white focus:border-[#3fb950]'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                  isIllustrative
                    ? 'bg-[#f4ede0] hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-slate-200 border-[#30363d]'
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/20">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'Saving...' : 'Save Room Logo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

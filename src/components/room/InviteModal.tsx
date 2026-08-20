import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Room } from '../../types';
import { X, Copy, Check, Share2, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface InviteModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ room, isOpen, onClose }) => {
  const { theme } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isIllustrative = theme === 'illustrative';

  if (!isOpen) return null;

  const joinLink = `${window.location.origin}?code=${room.code}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto mx-3 space-y-4 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-2 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              Invite Teammates
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

        <p className={`text-xs leading-relaxed font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-300'}`}>
          Share this room code with your friends or colleagues. Anyone with the code can join <strong className={isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}>{room.name}</strong>!
        </p>

        {/* Code Box */}
        <div
          className={`rounded-2xl p-5 text-center space-y-2 border ${
            isIllustrative
              ? 'bg-[#fbf7ee] border-[#ede4d4]'
              : 'bg-[#101418] border-[#3d4a3e]'
          }`}
        >
          <div className={`text-[10px] font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
            <Key className={`w-3 h-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}`} /> Room Invite Code
          </div>
          <div className={`text-3xl font-mono font-extrabold tracking-widest my-1 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}`}>
            {room.code}
          </div>
          <button
            onClick={() => copyToClipboard(room.code, 'code')}
            className={`text-xs px-4 py-2 rounded-xl font-bold inline-flex items-center gap-1.5 transition-colors font-mono shadow-sm ${
              isIllustrative
                ? 'bg-[#d8f3dc] hover:bg-[#b7e4c7] text-[#2d6a4f] border border-[#b7e4c7]'
                : 'bg-[#4ade80]/15 hover:bg-[#4ade80]/25 text-[#4ade80] border border-[#4ade80]/30'
            }`}
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Link Box */}
        <div className="space-y-1.5">
          <label className={`block text-xs font-mono ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Shareable Invite Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={joinLink}
              className={`w-full rounded-xl px-3 py-2 text-xs font-mono truncate focus:outline-none transition-colors ${
                isIllustrative
                  ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27]'
                  : 'bg-[#101418] border border-[#3d4a3e] text-slate-300'
              }`}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(joinLink, 'link')}
              leftIcon={copiedLink ? <Check className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-[#4ade80]'}`} /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedLink ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

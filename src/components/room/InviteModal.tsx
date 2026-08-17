import React, { useState } from 'react';
import type { Room } from '../../types';
import { X, Copy, Check, Share2, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface InviteModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ room, isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto mx-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Invite Teammates</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Share this room code with your friends or colleagues. Anyone with the code can join <span className="text-[#4ade80] font-semibold">{room.name}</span>!
        </p>

        {/* Code Box */}
        <div className="bg-[#101418] border border-[#3d4a3e] rounded-xl p-4 text-center space-y-2">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
            <Key className="w-3 h-3 text-[#4ade80]" /> Room Invite Code
          </div>
          <div className="text-3xl font-mono font-extrabold tracking-widest text-[#4ade80] my-1">
            {room.code}
          </div>
          <button
            onClick={() => copyToClipboard(room.code, 'code')}
            className="text-xs bg-[#4ade80]/15 hover:bg-[#4ade80]/25 text-[#4ade80] border border-[#4ade80]/30 px-3.5 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 transition-colors font-mono"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Link Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-slate-400">Shareable Invite Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={joinLink}
              className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg px-3 py-2 text-xs text-slate-300 font-mono truncate focus:outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(joinLink, 'link')}
              leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-[#4ade80]" /> : <Copy className="w-3.5 h-3.5" />}
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

import React, { useState } from 'react';
import type { Room } from '../../types';
import { X, Copy, Check, Share2, Key } from 'lucide-react';

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

      <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Invite Teammates to Room</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Share this room code with your friends or colleagues. Anyone with the code can join <span className="text-emerald-400 font-semibold">{room.name}</span>!
          </p>

          {/* Code box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1 flex items-center justify-center gap-1">
              <Key className="w-3 h-3 text-emerald-400" /> Room Invite Code
            </div>
            <div className="text-2xl font-mono font-bold tracking-widest text-emerald-400 my-1">{room.code}</div>
            <button
              onClick={() => copyToClipboard(room.code, 'code')}
              className="mt-2 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Code Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Link box */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Shareable Join Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={joinLink}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(joinLink, 'link')}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-xl font-medium border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, LogIn, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { joinRoomByCode, setIsLandingView, theme } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const isIllustrative = theme === 'illustrative';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return;

    const res = await joinRoomByCode(code);
    if (res.success) {
      setCode('');
      onClose();
      if (onSuccess) onSuccess();
      setIsLandingView(false);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto mx-3 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#3d4a3e] text-white'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isIllustrative ? 'border-[#ede4d4]' : 'border-[#3d4a3e]'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isIllustrative ? 'bg-[#d8f3dc] text-[#2d6a4f]' : 'bg-[#2ea043]/20 text-[#4ade80]'}`}>
              <LogIn className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-base sm:text-lg font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-white'}`}>
              Join Practice Room
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Enter Room Invite Code</label>
            <div className="relative">
              <KeyRound className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
              <input
                type="text"
                required
                maxLength={8}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="e.g. 7X9K2P or DP2026"
                className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm font-mono tracking-wider uppercase focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#2d6a4f] placeholder:text-[#8d9a93] focus:border-[#2d6a4f] focus:bg-white font-bold'
                    : 'bg-[#101418] border border-[#3d4a3e] text-[#4ade80] focus:border-[#4ade80]'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className={`text-xs p-3 rounded-xl flex items-center gap-2 font-sans border ${
              isIllustrative
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}>
              <AlertCircle className={`w-4 h-4 shrink-0 ${isIllustrative ? 'text-rose-600' : 'text-rose-400'}`} />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Join Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

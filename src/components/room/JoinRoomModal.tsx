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
  const { joinRoomByCode } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return;

    const res = joinRoomByCode(code);
    if (res.success) {
      setCode('');
      onClose();
      if (onSuccess) onSuccess();
      if (typeof (window as any).__setLandingView === 'function') {
        (window as any).__setLandingView(false);
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Join Practice Room</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Enter Room Invite Code</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
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
                className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-sm font-mono tracking-wider text-[#4ade80] uppercase focus:outline-none focus:border-[#4ade80]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg flex items-center gap-2 font-sans">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
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

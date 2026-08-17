import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, LogIn, KeyRound, AlertCircle } from 'lucide-react';

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

      <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">Join a Room</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Enter 6-Character Invite Code</label>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono tracking-wider text-cyan-400 uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

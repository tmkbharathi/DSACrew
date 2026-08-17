import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Users, Target, FileText, Sparkles } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createRoom } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyGoal, setDailyGoal] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createRoom(name, description, dailyGoal);
    setName('');
    setDescription('');
    onClose();

    if (onSuccess) onSuccess();
    if (typeof (window as any).__setLandingView === 'function') {
      (window as any).__setLandingView(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Create Practice Room</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Room Name</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Algo Masters 2026 🚀"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Description / Goals</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this room about? (e.g. Daily LeetCode practice for FAANG interviews)"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Daily Problem Goal</label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <select
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 LeetCode Problem per day</option>
                  <option value={2}>2 LeetCode Problems per day</option>
                  <option value={3}>3 LeetCode Problems per day (Hardcore)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
              >
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

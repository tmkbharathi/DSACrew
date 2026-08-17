import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Users, Target, FileText, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

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

      <div className="relative w-full max-w-md bg-[#1c2024] border border-[#3d4a3e] rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col mx-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3d4a3e] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#4ade80]" />
            <h3 className="font-bold text-base sm:text-lg text-white font-sans">Create Practice Room</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#262a2f]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Room Name</label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily LeetCode Masters"
                className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Description / Target</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this room's goal? (e.g. Daily practice for interview prep)"
                rows={3}
                className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80] resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Daily Target Goal</label>
            <div className="relative">
              <Target className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full bg-[#101418] border border-[#3d4a3e] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4ade80]"
              >
                <option value={1}>1 Problem per day</option>
                <option value={2}>2 Problems per day</option>
                <option value={3}>3 Problems per day</option>
              </select>
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

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
  const { createRoom, setIsLandingView, theme } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyGoal, setDailyGoal] = useState(1);
  const isIllustrative = theme === 'illustrative';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createRoom(name, description, dailyGoal);
    setName('');
    setDescription('');
    onClose();

    if (onSuccess) onSuccess();
    setIsLandingView(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 my-auto max-h-[85vh] flex flex-col mx-3 border transition-all ${
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
          <div>
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Room Name</label>
            <div className="relative">
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

          <div>
            <label className={`block text-xs font-mono mb-1 ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>Description / Target</label>
            <div className="relative">
              <FileText className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this room's goal? (e.g. Daily practice for interview prep)"
                rows={3}
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
            <div className="relative">
              <Target className={`w-4 h-4 absolute left-3 top-3 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-slate-500'}`} />
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none transition-colors ${
                  isIllustrative
                    ? 'bg-[#fbf7ee] border border-[#ede4d4] text-[#212d27] focus:border-[#2d6a4f]'
                    : 'bg-[#101418] border border-[#3d4a3e] text-white focus:border-[#4ade80]'
                }`}
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

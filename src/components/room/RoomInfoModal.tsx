import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Room } from '../../types';
import { X, Info, Target, Users, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface RoomInfoModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite: () => void;
}

export const RoomInfoModal: React.FC<RoomInfoModalProps> = ({
  room,
  isOpen,
  onClose,
  onOpenInvite,
}) => {
  const { theme, setIsLandingView } = useApp();
  const isIllustrative = theme === 'illustrative';

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto mx-3 space-y-4 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#1c2024] border-[#30363d] text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b pb-3 ${
            isIllustrative ? 'border-[#ede4d4]' : 'border-[#30363d]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isIllustrative
                  ? 'bg-[#d8f3dc] text-[#2d6a4f]'
                  : 'bg-[#2ea043]/20 text-[#4ade80]'
              }`}
            >
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3
                className={`font-bold text-base sm:text-lg font-sans leading-tight ${
                  isIllustrative ? 'text-[#212d27]' : 'text-white'
                }`}
              >
                Room Information
              </h3>
              <p
                className={`text-xs ${
                  isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
                }`}
              >
                Details &amp; study parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Header Info Box */}
        <div
          className={`p-4 rounded-xl border space-y-2 ${
            isIllustrative
              ? 'bg-[#faf7f0] border-[#ede4d4]'
              : 'bg-[#14181d] border-[#2a3037]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4
              className={`text-base font-bold font-sans ${
                isIllustrative ? 'text-[#1f2933]' : 'text-[#f2f4f1]'
              }`}
            >
              {room.name}
            </h4>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                isIllustrative
                  ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                  : 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/30'
              }`}
            >
              {room.code}
            </span>
          </div>

          <p
            className={`text-xs font-sans leading-relaxed ${
              isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'
            }`}
          >
            {room.description ||
              'A dedicated coding squad room for tracking daily LeetCode problems, code discussions, and progress.'}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isIllustrative
                ? 'bg-white border-[#ede4d4]'
                : 'bg-[#181d23] border-[#2a3037]'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span
                className={`block text-[10px] ${
                  isIllustrative ? 'text-[#8e9892]' : 'text-slate-400'
                }`}
              >
                Members
              </span>
              <strong className="font-semibold">
                {room.members.length} members
              </strong>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              isIllustrative
                ? 'bg-white border-[#ede4d4]'
                : 'bg-[#181d23] border-[#2a3037]'
            }`}
          >
            <Target className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span
                className={`block text-[10px] ${
                  isIllustrative ? 'text-[#8e9892]' : 'text-slate-400'
                }`}
              >
                Daily Goal
              </span>
              <strong className="font-semibold">
                {room.targetDailyGoal || 1} problem/day
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              onClose();
              setIsLandingView(true);
            }}
          >
            Switch Room
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            leftIcon={<Key className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onOpenInvite();
            }}
          >
            Join Code
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`bg-[#1c2024]/80 border border-[#3d4a3e] rounded-2xl flex flex-col items-center justify-center text-center shadow-lg ${
        compact ? 'py-8 px-4 sm:py-10 sm:px-6' : 'py-14 px-6 sm:py-16 sm:px-8'
      } ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[#4ade80]/10 text-[#4ade80] flex items-center justify-center mb-3.5 border border-[#4ade80]/20">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white font-sans mb-1.5 leading-snug">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed font-sans">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

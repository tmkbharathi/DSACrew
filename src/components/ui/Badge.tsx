import React from 'react';

export type BadgeVariant = 'easy' | 'medium' | 'hard' | 'solved' | 'working' | 'not-started' | 'missed' | 'neutral' | 'admin';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
  icon,
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const variantClasses: Record<BadgeVariant, string> = {
    easy: 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30',
    medium: 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/30',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    solved: 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40 font-semibold',
    working: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    'not-started': 'bg-slate-800 text-slate-400 border-slate-700',
    missed: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    neutral: 'bg-[#101418] text-slate-300 border-[#3d4a3e]',
    admin: 'bg-purple-500/15 text-purple-300 border-purple-500/40 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-mono border leading-none shrink-0 ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

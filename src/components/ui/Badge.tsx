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
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-semibold' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses: Record<BadgeVariant, string> = {
    easy: 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/40 font-bold',
    medium: 'bg-[#d29922]/20 text-[#e3b341] border-[#d29922]/40 font-bold',
    hard: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
    solved: 'bg-[#2ea043]/20 text-[#3fb950] border-[#2ea043]/40 font-bold',
    working: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold',
    'not-started': 'bg-[#21262d] text-slate-300 border-[#30363d]',
    missed: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    neutral: 'bg-[#161b22] text-slate-200 border-[#30363d]',
    admin: 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-sans border leading-none shrink-0 ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

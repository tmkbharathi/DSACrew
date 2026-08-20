import React from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    let isIllustrative = false;
    try {
      const app = useApp();
      isIllustrative = app?.theme === 'illustrative';
    } catch {
      isIllustrative = false;
    }

    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all select-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]/50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-3.5 sm:px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
      icon: 'p-2',
    };

    const illustrativeVariants: Record<ButtonVariant, string> = {
      primary:
        'bg-[#2d6a4f] text-white hover:bg-[#1b4332] active:bg-[#153427] shadow-sm font-bold',
      secondary:
        'bg-white text-[#212d27] hover:bg-[#fbf7ee] active:bg-[#ede4d4] border border-[#ede4d4] shadow-sm',
      outline:
        'bg-transparent text-[#212d27] hover:bg-[#fbf7ee] active:bg-[#ede4d4] border border-[#ede4d4]',
      ghost: 'bg-transparent text-[#5c6b63] hover:text-[#212d27] hover:bg-[#fbf7ee]',
      danger:
        'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 font-medium',
    };

    const darkVariants: Record<ButtonVariant, string> = {
      primary:
        'bg-[#2ea043] text-white hover:bg-[#3fb950] active:bg-[#238636] shadow-sm shadow-[#2ea043]/20 font-bold',
      secondary:
        'bg-[#161b22] text-slate-200 hover:bg-[#21262d] active:bg-[#30363d] border border-[#30363d]',
      outline:
        'bg-transparent text-slate-200 hover:bg-[#161b22] active:bg-[#21262d] border border-[#30363d]',
      ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-[#161b22]',
      danger:
        'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 font-medium',
    };

    const variantClasses = isIllustrative ? illustrativeVariants : darkVariants;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

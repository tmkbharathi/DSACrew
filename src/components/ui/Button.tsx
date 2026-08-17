import React from 'react';
import { Loader2 } from 'lucide-react';

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
    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all select-none rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4ade80]/50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-3.5 sm:px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
      icon: 'p-2',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-[#4ade80] text-[#005e2d] hover:bg-[#6dfe9c] active:bg-[#3bc26f] shadow-sm shadow-[#4ade80]/20 font-bold',
      secondary:
        'bg-[#1c2024] text-slate-200 hover:bg-[#262a2f] active:bg-[#31353a] border border-[#3d4a3e]',
      outline:
        'bg-transparent text-slate-200 hover:bg-[#1c2024] active:bg-[#262a2f] border border-[#3d4a3e]',
      ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-[#1c2024]',
      danger:
        'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 font-medium',
    };

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

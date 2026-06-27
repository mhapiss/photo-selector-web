import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-primary-700 active:bg-primary-800',
  secondary:
    'bg-white text-ink border border-slate-200 shadow-soft hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-ink hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-red-500 text-white shadow-soft hover:bg-red-600 active:bg-red-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[44px] h-[44px] px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'min-h-[44px] h-11 px-5 text-sm gap-2 rounded-lg',
  lg: 'min-h-[56px] h-14 px-6 text-base gap-2.5 rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  loading,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold tracking-[-0.01em] tap-scale select-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

/*
 * Design principles:
 * - Primary: solid brand blue, no gradients, no glow. Depth from a single inset highlight.
 * - Secondary: neutral surface with border. Clean.
 * - Ghost: transparent, no border. Hover reveals subtle fill.
 * - All active states: slight scale down + brightness. No bounce.
 */
const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white shadow-sm shadow-btn border border-black/10 dark:border-white/10 hover:brightness-105 active:brightness-95',
  secondary:
    'bg-surface text-ink border border-border shadow-xs hover:bg-card hover:border-border/80 active:bg-card active:brightness-95',
  ghost:
    'text-muted hover:text-ink hover:bg-surface active:bg-card border border-transparent',
  danger:
    'bg-danger text-white border border-danger/40 hover:brightness-110 active:brightness-90',
  success:
    'bg-success text-white border border-success/40 hover:brightness-110 active:brightness-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 min-h-[36px] px-3.5 text-[13px] font-medium gap-1.5 rounded-lg',
  md: 'h-11 min-h-[44px] px-5 text-[14px] font-semibold gap-2 rounded-xl',
  lg: 'h-[52px] min-h-[52px] px-6 text-[15px] font-semibold gap-2.5 rounded-xl',
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
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center select-none',
        'transition-all duration-200',
        'active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
        'disabled:opacity-40 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span
          className="h-4 w-4 rounded-full border-[1.5px] border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

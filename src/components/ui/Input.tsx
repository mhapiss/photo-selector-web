import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, leftIcon, rightElement, error, hint, id, className = '', ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-[13px] font-medium text-ink/70"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim z-10">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            'w-full h-11 min-h-[44px]',
            'rounded-xl',
            'text-[15px] font-normal text-ink',
            'placeholder:text-dim',
            'bg-surface shadow-xs',
            'transition-all duration-200',
            'focus:outline-none focus:ring-4',
            'touch-manipulation',
            leftIcon ? 'pl-10' : 'pl-4',
            rightElement ? 'pr-14' : 'pr-4',
            error
              ? 'border border-danger/60 focus:border-danger focus:ring-danger/20'
              : 'border border-border hover:border-border/80 focus:border-primary focus:ring-primary/30',
            className,
          ].filter(Boolean).join(' ')}
          {...rest}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-[12px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

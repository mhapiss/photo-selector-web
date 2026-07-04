import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface/50 p-1 backdrop-blur-md border border-border/50 shadow-sm">
      <button
        onClick={() => setTheme('light')}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
          theme === 'light' ? 'bg-background shadow-sm text-ink' : 'text-muted hover:text-ink hover:bg-surface'
        }`}
        aria-label="Light theme"
      >
        <Sun size={14} strokeWidth={2} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
          theme === 'system' ? 'bg-background shadow-sm text-ink' : 'text-muted hover:text-ink hover:bg-surface'
        }`}
        aria-label="System theme"
      >
        <Monitor size={14} strokeWidth={2} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
          theme === 'dark' ? 'bg-background shadow-sm text-ink' : 'text-muted hover:text-ink hover:bg-surface'
        }`}
        aria-label="Dark theme"
      >
        <Moon size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

import { ChevronLeft, Send } from 'lucide-react';
import type { AlbumMeta } from '../../types';

type GalleryHeaderProps = {
  meta: AlbumMeta;
  eventName: string;
  photoCount: number;
  selectedCount: number;
  onBack: () => void;
  onSend: () => void;
};

export function GalleryHeader({
  meta,
  eventName,
  photoCount,
  selectedCount,
  onBack,
  onSend,
}: GalleryHeaderProps) {
  const hasSelection = selectedCount > 0;
  const brandName = meta.photographerName;

  return (
    <header
      className="sticky top-0 z-30 border-b border-border/60 bg-card/80"
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4">
        {/* Back */}
        <button
          onClick={onBack}
          type="button"
          aria-label="Kembali"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface border border-border shadow-xs text-muted transition-all duration-200 hover:text-ink hover:bg-card active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 touch-manipulation"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </button>

        {/* Brand + Event */}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                {brandName}
              </p>
              <h2 className="truncate text-[14px] font-semibold leading-tight text-ink">
                {eventName}
              </h2>
            </div>
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-dim">
            <span>{photoCount} foto</span>
            {hasSelection && (
              <>
                <span>·</span>
                <span className="font-semibold text-primary">
                  {selectedCount} dipilih
                </span>
              </>
            )}
          </div>
        </div>

        {/* Send / Review */}
        <button
          onClick={onSend}
          type="button"
          disabled={!hasSelection}
          aria-label={hasSelection ? `Kirim ${selectedCount} foto` : 'Pilih foto dulu'}
          className={[
            'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5',
            'text-[13px] font-semibold',
            'transition-all duration-150',
            'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
            hasSelection
              ? 'bg-primary text-white shadow-sm shadow-btn border border-border hover:brightness-105 active:brightness-95 active:scale-[0.97]'
              : 'bg-surface text-dim border border-border cursor-not-allowed',
          ].join(' ')}
        >
          <Send size={13} strokeWidth={2} />
          <span className="hidden sm:inline">Review</span>
          {hasSelection && (
            <span className="grid h-4.5 min-w-[18px] place-items-center rounded-full bg-white/20 px-1 text-[10px] font-bold leading-none py-0.5">
              {selectedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

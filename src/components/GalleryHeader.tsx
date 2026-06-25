import { ChevronLeft, Send, CheckCircle2 } from 'lucide-react';

type GalleryHeaderProps = {
  eventName: string;
  photoCount: number;
  selectedCount: number;
  onBack: () => void;
  onSend: () => void;
};

export function GalleryHeader({
  eventName,
  photoCount,
  selectedCount,
  onBack,
  onSend,
}: GalleryHeaderProps) {
  const hasSelection = selectedCount > 0;

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/10 safe-top"
      style={{
        background: 'rgba(10,10,15,0.78)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        {/* Back */}
        <button
          onClick={onBack}
          type="button"
          aria-label="Back to album entry"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
        >
          <ChevronLeft size={21} strokeWidth={2.2} />
        </button>

        {/* Title + meta */}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-bold leading-tight tracking-tight text-white/95 sm:text-base">
            {eventName}
          </h2>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45 sm:text-xs">
            <span className="font-medium text-white/55">
              {photoCount} Photos
            </span>

            {hasSelection && (
              <>
                <span className="hidden text-white/20 sm:inline">•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                  <CheckCircle2 size={12} strokeWidth={2.2} />
                  {selectedCount} Selected
                </span>
              </>
            )}
          </div>
        </div>

        {/* Send */}
        <button
          onClick={onSend}
          type="button"
          disabled={!hasSelection}
          aria-label={
            hasSelection
              ? `Send ${selectedCount} selected photos`
              : 'Select photos first'
          }
          className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-bold transition-all duration-200 sm:px-4 ${
            hasSelection
              ? 'text-white'
              : 'cursor-not-allowed text-white/35'
          }`}
          style={
            hasSelection
              ? {
                  background:
                    'linear-gradient(135deg, rgba(37,211,102,0.95) 0%, rgba(26,168,83,0.95) 100%)',
                  boxShadow: '0 8px 24px rgba(37,211,102,0.28)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }
              : {
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }
          }
        >
          <Send size={15} strokeWidth={2.2} />
          <span className="hidden lg:inline">Send Selection</span>

          {hasSelection && (
            <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-white/20 px-1 text-[11px] font-bold text-white">
              {selectedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
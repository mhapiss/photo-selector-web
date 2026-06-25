import { ChevronLeft, Copy, Image as ImageIcon, User, CalendarDays, Check } from 'lucide-react';
import { Button } from './ui/Button';
import type { AlbumMeta, PhotoFile } from '../types';

type SummaryScreenProps = {
  meta: AlbumMeta;
  selectedPhotos: PhotoFile[];
  onBack: () => void;
  onSendWhatsApp: () => void;
};

export function SummaryScreen({
  meta,
  selectedPhotos,
  onBack,
  onSendWhatsApp,
}: SummaryScreenProps) {
  const filenames = selectedPhotos.map((p) => p.name);

  async function copyList() {
    try {
      await navigator.clipboard.writeText(filenames.join('\n'));
    } catch {
      // ignore — clipboard may be unavailable
    }
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-30 glass border-b border-slate-200/60">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            aria-label="Back to gallery"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-slate-100 tap-scale"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold leading-tight tracking-tight text-ink">
              Selection Summary
            </h2>
            <p className="text-xs text-slate-500">Review your picks before sending</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Meta cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 animate-fade-in-up">
          <MetaCard icon={<User size={16} />} label="Client" value={meta.clientName} />
          <MetaCard icon={<CalendarDays size={16} />} label="Event" value={meta.eventName} />
          <MetaCard
            icon={<ImageIcon size={16} />}
            label="Selected"
            value={`${selectedPhotos.length} photos`}
            accent
          />
        </div>

        {/* Thumbnails strip */}
        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <h3 className="mb-3 text-sm font-bold tracking-tight text-ink">Preview</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {selectedPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 shadow-soft animate-scale-in"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0.5 left-1 right-1 truncate text-[9px] font-semibold text-white/95 drop-shadow">
                  {photo.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filenames list */}
        <div className="mt-7 animate-fade-in-up" style={{ animationDelay: '160ms' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold tracking-tight text-ink">Selected Filenames</h3>
            <button
              onClick={copyList}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <Copy size={13} />
              Copy
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-soft">
            <ul className="divide-y divide-slate-100">
              {filenames.map((name, i) => (
                <li
                  key={name}
                  className="flex items-center gap-3 px-4 py-2.5 animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 25, 500)}ms` }}
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-50 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate font-mono text-[13px] text-ink">{name}</span>
                  <Check size={14} className="shrink-0 text-emerald-500" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <Button
            size="lg"
            fullWidth
            onClick={onSendWhatsApp}
            leftIcon={<WhatsAppIcon />}
            className="bg-[#25D366] text-white hover:bg-[#1FB855] active:bg-[#1AA851] shadow-card"
          >
            Send to WhatsApp
          </Button>

          <button
            onClick={onBack}
            className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            Edit selection
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Your selection will open in WhatsApp, ready to paste to your photographer.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-soft transition-colors ${
        accent ? 'border-primary-100 bg-primary-50' : 'border-slate-200 bg-surface'
      }`}
    >
      <div
        className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${
          accent ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold ${accent ? 'text-primary' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  );
}

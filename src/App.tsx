import { useState, useCallback, useRef } from 'react';
import { EntryScreen } from './components/EntryScreen';
import { GalleryScreen } from './components/GalleryScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { DoneScreen } from './components/DoneScreen';
import { buildWhatsAppMessage, openWhatsApp } from './lib/whatsapp';
import type { AlbumMeta, PhotoFile, Step } from './types';

export default function App() {
  const [step, setStep] = useState<Step>('entry');
  const [meta, setMeta] = useState<AlbumMeta | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const lastPhotos = useRef<PhotoFile[]>([]);

  // index by id for O(1) lookups when building the summary
  const photosById = useRef<Map<string, PhotoFile>>(new Map());

  const handleEntrySubmit = useCallback((m: AlbumMeta) => {
    setMeta(m);
    setSelectedIds(new Set());
    setSelectionOrder([]);
    setStep('gallery');
  }, []);

  const handlePhotosLoaded = useCallback((photos: PhotoFile[]) => {
    lastPhotos.current = photos;
    photosById.current = new Map(photos.map((p) => [p.id, p]));
  }, []);

  const togglePhoto = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSelectionOrder((order) => order.filter((x) => x !== id));
      } else {
        next.add(id);
        setSelectionOrder((order) => [...order, id]);
      }
      return next;
    });
  }, []);

  const selectedPhotos: PhotoFile[] = selectionOrder
    .map((id) => photosById.current.get(id))
    .filter((p): p is PhotoFile => Boolean(p));

  function handleSendWhatsApp() {
    if (!meta) return;
    const message = buildWhatsAppMessage(meta, selectedPhotos.map((p) => p.name));
    setWhatsappMessage(message);
    openWhatsApp('', message);
    setStep('done');
  }

  function handleReopenWhatsApp() {
    openWhatsApp('', whatsappMessage);
  }

  function handleRestart() {
    setMeta(null);
    setSelectedIds(new Set());
    setSelectionOrder([]);
    lastPhotos.current = [];
    photosById.current = new Map();
    setWhatsappMessage('');
    setStep('entry');
  }

  return (
    <div key={step} className="animate-page-enter min-h-[100dvh] bg-background">
      {step === 'entry' && <EntryScreen onSubmit={handleEntrySubmit} />}

      {step === 'gallery' && meta && (
        <GalleryScreen
          meta={meta}
          selectedIds={selectedIds}
          selectionOrder={selectionOrder}
          onToggle={togglePhoto}
          onBack={() => setStep('entry')}
          onReview={() => setStep('summary')}
          onPhotosLoaded={handlePhotosLoaded}
        />
      )}

      {step === 'summary' && meta && (
        <SummaryScreen
          meta={meta}
          selectedPhotos={selectedPhotos}
          onBack={() => setStep('gallery')}
          onSendWhatsApp={handleSendWhatsApp}
        />
      )}

      {step === 'done' && meta && (
        <DoneScreen
          clientName={meta.clientName}
          eventName={meta.eventName}
          selectedCount={selectedPhotos.length}
          message={whatsappMessage}
          onRestart={handleRestart}
          onReopenWhatsApp={handleReopenWhatsApp}
        />
      )}
    </div>
  );
}

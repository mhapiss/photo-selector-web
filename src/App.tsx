import { useAppFlow } from './hooks/useAppFlow';
import { EntryScreen } from './components/entry/EntryScreen';
import { GalleryScreen } from './components/gallery/GalleryScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { DoneScreen } from './components/DoneScreen';

export default function App() {
  const {
    step,
    setStep,
    meta,
    selectedIds,
    selectionOrder,
    whatsappMessage,
    selectedPhotos,
    handleEntrySubmit,
    handlePhotosLoaded,
    togglePhoto,
    handleSendWhatsApp,
    handleReopenWhatsApp,
    handleRestart,
  } = useAppFlow();

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

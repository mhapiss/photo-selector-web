import { useAppFlow } from './hooks/useAppFlow';
import { EntryPage } from './pages/EntryPage';
import { GalleryPage } from './pages/GalleryPage';
import { SummaryPage } from './pages/SummaryPage';
import { DonePage } from './pages/DonePage';

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
      {step === 'entry' && <EntryPage onSubmit={handleEntrySubmit} />}

      {step === 'gallery' && meta && (
        <GalleryPage
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
        <SummaryPage
          meta={meta}
          selectedPhotos={selectedPhotos}
          onBack={() => setStep('gallery')}
          onSendWhatsApp={handleSendWhatsApp}
        />
      )}

      {step === 'done' && meta && (
        <DonePage
          clientName={meta.clientName}
          eventName={meta.eventName}
          selectedCount={selectedPhotos.length}
          message={whatsappMessage.full}
          onRestart={handleRestart}
          onReopenWhatsApp={handleReopenWhatsApp}
        />
      )}
    </div>
  );
}

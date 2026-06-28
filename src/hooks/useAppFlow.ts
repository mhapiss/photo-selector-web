import { useState, useCallback, useRef } from 'react';
import type { AlbumMeta, PhotoFile, Step } from '../types';
import { buildWhatsAppMessage, openWhatsApp } from '../services/whatsappService';

export function useAppFlow() {
  const [step, setStep] = useState<Step>('entry');
  const [meta, setMeta] = useState<AlbumMeta | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  
  const lastPhotos = useRef<PhotoFile[]>([]);
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

  const handleSendWhatsApp = useCallback(() => {
    if (!meta) return;
    const message = buildWhatsAppMessage(meta, selectedPhotos.map((p) => p.name));
    setWhatsappMessage(message);
    openWhatsApp('', message);
    setStep('done');
  }, [meta, selectedPhotos]);

  const handleReopenWhatsApp = useCallback(() => {
    openWhatsApp('', whatsappMessage);
  }, [whatsappMessage]);

  const handleRestart = useCallback(() => {
    setMeta(null);
    setSelectedIds(new Set());
    setSelectionOrder([]);
    lastPhotos.current = [];
    photosById.current = new Map();
    setWhatsappMessage('');
    setStep('entry');
  }, []);

  return {
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
  };
}

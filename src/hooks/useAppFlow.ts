import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { AlbumMeta, PhotoFile, Step } from '../types';
import { buildWhatsAppMessage, openWhatsApp } from '../services/whatsappService';
import {
  getActiveSessionId,
  getSession,
  saveSession,
  setActiveSessionId,
} from '../services/storageService';

export function useAppFlow() {
  const [step, setStep] = useState<Step>('entry');
  const [meta, setMeta] = useState<AlbumMeta | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [whatsappMessage, setWhatsappMessage] = useState<{ short: string; full: string }>({ short: '', full: '' });
  
  const lastPhotos = useRef<PhotoFile[]>([]);
  const photosById = useRef<Map<string, PhotoFile>>(new Map());

  // Restore on mount
  useEffect(() => {
    const activeId = getActiveSessionId();
    if (activeId) {
      const session = getSession(activeId);
      if (session) {
        setMeta(session.meta);
        setSelectionOrder(session.selectionOrder);
        setSelectedIds(new Set(session.selectionOrder));
        setStep('gallery');
      } else {
        setActiveSessionId(null);
      }
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (meta && step !== 'entry' && step !== 'done') {
      saveSession(meta.folderId, meta, selectionOrder);
    }
  }, [meta, selectionOrder, step]);

  const handleEntrySubmit = useCallback((m: AlbumMeta) => {
    const existing = getSession(m.folderId);
    if (existing) {
      // Keep their selections, but update meta with new form data
      setMeta({ ...existing.meta, ...m });
      setSelectedIds(new Set(existing.selectionOrder));
      setSelectionOrder(existing.selectionOrder);
    } else {
      setMeta(m);
      setSelectedIds(new Set());
      setSelectionOrder([]);
    }
    setActiveSessionId(m.folderId);
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

  const selectedPhotos = useMemo(
    () => selectionOrder
      .map((id) => photosById.current.get(id))
      .filter((p): p is PhotoFile => Boolean(p)),
    [selectionOrder]
  );

  const handleSendWhatsApp = useCallback(() => {
    if (!meta) return;
    const message = buildWhatsAppMessage(meta, selectedPhotos.map((p) => p.name));
    setWhatsappMessage({ short: message.shortMessage, full: message.fullMessage });
    openWhatsApp(meta.photographerWhatsapp, message.shortMessage);
    setStep('done');
  }, [meta, selectedPhotos]);

  const handleReopenWhatsApp = useCallback(() => {
    if (!meta) return;
    openWhatsApp(meta.photographerWhatsapp, whatsappMessage.short);
  }, [meta, whatsappMessage]);

  const handleRestart = useCallback(() => {
    if (meta) {
      setActiveSessionId(null);
    }
    setMeta(null);
    setSelectedIds(new Set());
    setSelectionOrder([]);
    lastPhotos.current = [];
    photosById.current = new Map();
    setWhatsappMessage({ short: '', full: '' });
    setStep('entry');
  }, [meta]);

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

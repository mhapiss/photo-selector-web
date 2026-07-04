import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Camera, CheckCircle2, FolderOpen,
  Phone, Send, ShieldCheck, User, ClipboardPaste,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { extractFolderId } from '../../services/driveService';
import { loadSettings, saveSettings, getSession } from '../../services/storageService';
import type { AlbumMeta } from '../../types';
import { formVariants } from '../../utils/animations';

type EntryFormProps = {
  onSubmit: (meta: AlbumMeta) => void;
};

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [photographerName, setPhotographerName] = useState('');
  const [photographerWhatsapp, setPhotographerWhatsapp] = useState('');
  const [eventName, setEventName] = useState('');
  const [clientName, setClientName] = useState('');
  const [folderLink, setFolderLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [touched, setTouched] = useState(false);

  // Settings sync
  useEffect(() => {
    const s = loadSettings();
    if (s) {
      if (s.photographerName) setPhotographerName(s.photographerName);
      if (s.photographerWhatsapp) setPhotographerWhatsapp(s.photographerWhatsapp);
    }
  }, []);

  const folderId = extractFolderId(folderLink);

  // Detect existing session
  const [existingCount, setExistingCount] = useState<number | null>(null);
  useEffect(() => {
    if (folderId) {
      const sess = getSession(folderId);
      if (sess) {
        setExistingCount(sess.selectionOrder.length);
        if (sess.meta.clientName) setClientName(sess.meta.clientName);
        if (sess.meta.eventName) setEventName(sess.meta.eventName);
      } else {
        setExistingCount(null);
      }
    } else {
      setExistingCount(null);
    }
  }, [folderId]);

  const linkInvalid = touched && folderLink.length > 0 && !folderId;
  const phoneDigits = photographerWhatsapp.replace(/[^0-9]/g, '');
  const phoneInvalid = touched && photographerWhatsapp.length > 0 && phoneDigits.length < 9;
  const formValid =
    Boolean(photographerName.trim()) &&
    phoneDigits.length >= 9 &&
    Boolean(eventName.trim()) &&
    Boolean(clientName.trim()) &&
    Boolean(folderId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!folderLink.trim().startsWith('https://')) {
      setLinkError('Hanya link HTTPS yang diperbolehkan.');
      return;
    }
    if (!folderId) { setLinkError('Tempel link folder Google Drive yang valid.'); return; }
    if (!formValid) return;

    saveSettings({
      photographerName: photographerName.trim(),
      photographerWhatsapp: photographerWhatsapp.trim(),
    });

    onSubmit({
      photographerName: photographerName.trim(),
      photographerWhatsapp: photographerWhatsapp.trim(),
      eventName: eventName.trim(),
      clientName: clientName.trim(),
      folderLink: folderLink.trim(),
      folderId,
    });
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setFolderLink(text);
      if (linkError) setLinkError('');
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
      setLinkError('Gagal membaca clipboard. Coba paste manual (Ctrl+V).');
    }
  }

  return (
    <motion.div className="order-1 lg:order-2 relative" variants={formVariants}>
      {/* Outer Glow */}
      <div className="absolute -inset-4 rounded-[32px] bg-primary/20 blur-[64px] opacity-30 pointer-events-none" />
      
      <form
        onSubmit={handleSubmit}
        aria-label="Formulir pembuatan galeri"
        className="relative rounded-[24px] border border-border/50 bg-surface/60 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:border-border/80 overflow-hidden group"
        style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.3)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
        <div className="absolute -inset-px rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        {/* Header */}
        <div className="relative mb-6 z-10">
          <h2 className="text-[17px] font-bold text-ink tracking-tight">Buat Galeri Klien</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            Tanpa login · tanpa upload · langsung dari Google Drive
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Input
              label="Nama Fotografer"
              leftIcon={<Camera size={15} />}
              placeholder="isi nama fotografer"
              value={photographerName}
              onChange={(e) => setPhotographerName(e.target.value)}
              autoComplete="name"
              maxLength={70}
              required
            />
            <Input
              label="WhatsApp Fotografer"
              leftIcon={<Phone size={15} />}
              placeholder="di mulai dari 62"
              value={photographerWhatsapp}
              onChange={(e) => setPhotographerWhatsapp(e.target.value)}
              onBlur={() => setTouched(true)}
              error={phoneInvalid ? 'Masukkan nomor WhatsApp dengan kode negara.' : undefined}
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Input
              label="Nama Acara"
              leftIcon={<CalendarDays size={15} />}
              placeholder="Isi nama acara"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              maxLength={90}
              required
            />
            <Input
              label="Nama Klien"
              leftIcon={<User size={15} />}
              placeholder="Isi nama kamu"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              autoComplete="name"
              maxLength={70}
              required
            />
          </div>

          <div>
            <Input
              label="Link Folder Google Drive"
              leftIcon={<FolderOpen size={15} />}
              placeholder="paste link google drive dari fotografer"
              value={folderLink}
              onChange={(e) => { setFolderLink(e.target.value); if (linkError) setLinkError(''); }}
              onBlur={() => setTouched(true)}
              error={linkInvalid ? linkError || 'Link tidak valid.' : undefined}
              hint={!linkInvalid ? 'Foto dibaca langsung dari Drive. Tidak ada upload.' : undefined}
              inputMode="url"
              autoComplete="url"
              required
              rightElement={
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 rounded-lg bg-surface hover:bg-surface-hover px-2.5 py-1.5 border border-border/80 text-[11px] font-semibold text-ink transition-colors hover:border-primary/50"
                  aria-label="Paste Link"
                >
                  <ClipboardPaste size={12} className="text-primary" />
                  Paste
                </button>
              }
            />
            <AnimatePresence>
              {folderId && !linkInvalid && (
                <motion.div
                  className="mt-2 flex items-center gap-1.5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <CheckCircle2 size={12} className="text-success" />
                  <span className="text-[12px] font-medium text-success">
                    Folder terdeteksi
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-5">
          <Button
            type="submit"
            size="lg"
            fullWidth
            rightIcon={<Send size={16} strokeWidth={2} />}
            disabled={!formValid}
          >
            {existingCount !== null ? `Lanjutkan Pilihan (${existingCount} foto)` : 'Buka Galeri'}
          </Button>
        </div>

        <p className="mt-3.5 flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-dim" strokeWidth={1.8} />
          <span className="text-[11px] text-muted">
            Google Drive tetap jadi sumber foto utama.
          </span>
        </p>
      </form>
    </motion.div>
  );
}

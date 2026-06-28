import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, CalendarDays, FolderOpen, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { extractFolderId } from '../../services/driveService';
import type { AlbumMeta } from '../../types';
import { formVariants } from '../../utils/animations';

type EntryFormProps = {
  onSubmit: (meta: AlbumMeta) => void;
};

export function EntryForm({ onSubmit }: EntryFormProps) {
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [folderLink, setFolderLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [touched, setTouched] = useState(false);

  const folderId = extractFolderId(folderLink);
  const linkInvalid = touched && folderLink.length > 0 && !folderId;
  const formValid = !!clientName.trim() && !!eventName.trim() && !!folderId;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!folderId) {
      setLinkError('Tempel link folder Google Drive yang valid.');
      return;
    }
    if (!clientName.trim() || !eventName.trim()) return;
    
    onSubmit({
      clientName: clientName.trim(),
      eventName: eventName.trim(),
      folderLink: folderLink.trim(),
      folderId,
    });
  }

  return (
    <motion.div className="order-1 lg:order-2" variants={formVariants}>
      <motion.form
        onSubmit={handleSubmit}
        aria-label="Formulir detail album foto"
        className="relative overflow-hidden rounded-3xl p-5 sm:p-8"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(24px)',
          boxShadow:
            '0 4px 24px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        whileHover={{
          boxShadow:
            '0 4px 24px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
          transition: { duration: 0.3 },
        }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
        />

        <div className="mb-6 flex items-center gap-3 sm:mb-7">
          <motion.div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(140,60,240,0.4) 0%, rgba(80,120,230,0.3) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 12px rgba(120,40,200,0.3)',
            }}
            animate={{
              boxShadow: [
                '0 0 12px rgba(120,40,200,0.3)',
                '0 0 22px rgba(120,40,200,0.55)',
                '0 0 12px rgba(120,40,200,0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Sparkles size={14} className="text-white/80" strokeWidth={2} />
          </motion.div>
          <div>
            <h2 className="text-[14px] font-semibold tracking-tight text-white/90 sm:text-[15px]">
              Detail Album
            </h2>
            <p className="text-[11px] text-white/35">Isi info berikut untuk memulai</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="group relative">
            <Input
              label="Nama Klien"
              leftIcon={
                <User size={16} className="text-white/40 transition-colors group-focus-within:text-white/70" aria-hidden="true" />
              }
              placeholder="Nama Client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              autoComplete="name"
              maxLength={60}
            />
          </div>

          <div className="group relative">
            <Input
              label="Nama Acara"
              leftIcon={
                <CalendarDays size={16} className="text-white/40 transition-colors group-focus-within:text-white/70" aria-hidden="true" />
              }
              placeholder="Nama Acara & Tanggal"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="group relative">
            <Input
              label="Link Folder Google Drive"
              leftIcon={
                <FolderOpen size={16} className="text-white/40 transition-colors group-focus-within:text-white/70" aria-hidden="true" />
              }
              placeholder="Link Google Drive"
              value={folderLink}
              onChange={(e) => {
                setFolderLink(e.target.value);
                if (linkError) setLinkError('');
              }}
              onBlur={() => setTouched(true)}
              error={
                linkInvalid
                  ? linkError || 'Tempel link folder Google Drive yang valid.'
                  : undefined
              }
              hint={
                !linkInvalid
                  ? 'Tempel link "Bagikan" dari folder Google Drive-mu.'
                  : undefined
              }
              inputMode="url"
              autoComplete="url"
            />
            <AnimatePresence>
              {folderId && !linkInvalid && (
                <motion.div
                  className="mt-2 flex items-center gap-1.5"
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <CheckCircle2 size={13} className="text-emerald-400" aria-hidden="true" />
                  <span className="text-[12px] font-medium text-emerald-400">
                    Folder terdeteksi — siap dibuka
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div className="mt-5 sm:mt-6" whileTap={{ scale: 0.985 }}>
          <Button
            type="submit"
            size="lg"
            fullWidth
            rightIcon={
              <motion.span
                aria-hidden="true"
                animate={formValid ? { x: [0, 3, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowRight size={18} strokeWidth={2} />
              </motion.span>
            }
            disabled={!formValid}
          >
            Buka Album
          </Button>
        </motion.div>

        <motion.p
          className="mt-4 flex items-center justify-center gap-1.5 sm:mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <ShieldCheck size={13} className="text-white/20" strokeWidth={1.8} aria-hidden="true" />
          <span className="text-[11px] text-white/20">
            Link-mu hanya digunakan untuk memuat pratinjau foto.
          </span>
        </motion.p>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          aria-hidden="true"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          }}
        />
      </motion.form>
    </motion.div>
  );
}

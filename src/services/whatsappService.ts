import type { AlbumMeta } from '../types';

/**
 * Builds a professional pre-filled WhatsApp message.
 */
export function buildWhatsAppMessage(meta: AlbumMeta, filenames: string[]): { shortMessage: string; fullMessage: string } {
  const safePhotographerName = meta.photographerName.trim() || 'Fotografer';
  const safeClientName = meta.clientName.trim() || '-';
  const safeEventName = meta.eventName.trim() || '-';

  const baseHeader = [
    `Halo ${safePhotographerName} 👋`,
    '',
    'Saya sudah selesai memilih foto.',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
    `Nama Client : ${safeClientName}`,
    '',
    `Acara : ${safeEventName}`,
    '',
    `Total Dipilih : ${filenames.length} Foto`,
    '',
    '━━━━━━━━━━━━━━━━━━',
    '',
  ];

  const baseFooter = [
    '',
    'Terima kasih 🙏',
    '',
    'Powered by Photo Selector',
  ];

  const fullFiles = filenames.length > 0 ? filenames : ['-'];
  
  const shortLimit = 20;
  const shortFiles = filenames.length > shortLimit 
    ? [...filenames.slice(0, shortLimit), '', `... dan ${filenames.length - shortLimit} foto lainnya. (Daftar lengkap bisa di-copy dari web)`] 
    : fullFiles;

  return {
    shortMessage: [...baseHeader, ...shortFiles, ...baseFooter].join('\n'),
    fullMessage: [...baseHeader, ...fullFiles, ...baseFooter].join('\n')
  };
}

/**
 * Opens WhatsApp with the pre-filled message.
 */
export function openWhatsApp(phoneOrEmpty: string, message: string): void {
  const encoded = encodeURIComponent(message);
  const cleanedPhone = phoneOrEmpty.replace(/[^0-9]/g, '').trim();

  const target = cleanedPhone
    ? `https://wa.me/${cleanedPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(target, '_blank', 'noopener,noreferrer');
}

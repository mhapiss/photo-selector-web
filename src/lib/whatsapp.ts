import type { AlbumMeta } from '../types';

/**
 * Builds a professional pre-filled WhatsApp message.
 */
export function buildWhatsAppMessage(meta: AlbumMeta, filenames: string[]): string {
  const safeEventName = meta.eventName.trim() || '-';

  const formattedFiles =
    filenames.length > 0
      ? filenames.map((name, index) => `${index + 1}. ${name}`)
      : ['- Belum ada foto yang dipilih'];

  return [
    'Halo Kak,',
    '',
    'Saya ingin mengirimkan daftar foto yang telah saya pilih.',
    '',
    `Nama Acara: ${safeEventName}`,
    '',
    'Foto Terpilih:',
    ...formattedFiles,
    '',
    `Total Foto Terpilih: ${filenames.length}`,
    '',
    'Mohon dibantu untuk proses selanjutnya.',
    'Terima kasih banyak.',
  ].join('\n');
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
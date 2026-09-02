/**
 * Font web — didefinisikan SEKALI di sini.
 *
 * Dipisah dari app/layout.tsx karena `app/global-error.tsx` merender <html> dan
 * <body>-nya SENDIRI (ia menggantikan root layout, bukan dirender di dalamnya),
 * jadi ia harus memasang variabel font yang sama. Menyalin konfigurasinya ke
 * sana bukan cuma duplikasi teks: next/font memberi cache-key dari argumen
 * pemanggilan, jadi dua pemanggilan `Space_Grotesk()` yang beda satu opsi saja
 * akan menghasilkan DUA file font berbeda yang di-preload berdampingan.
 */

import { GeistSans } from 'geist/font/sans';
import { Space_Grotesk } from 'next/font/google';

/**
 * Display face — Space Grotesk (OFL). Grotesk geometrik modern; pendekatan
 * bebas untuk Aeonik yang dipakai referensi pada nama hero raksasa. Body/system
 * tetap Geist (netral, enak dibaca). `display: swap` → teks tampil pakai
 * fallback dulu, tak ada FOIT.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

/** Kelas yang memasang --font-geist-sans & --font-space-grotesk ke <html>. */
export const FONT_VARS = `${GeistSans.variable} ${spaceGrotesk.variable}`;

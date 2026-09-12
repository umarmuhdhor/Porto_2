import { defineConfig } from 'vitest/config';

/**
 * Vitest — dipakai untuk modul PURE saja (lihat lib/*.test.ts).
 *
 * Sengaja tanpa jsdom/happy-dom: yang diuji di sini aturan yang tidak menyentuh
 * DOM sama sekali, dan memasang environment browser palsu cuma menambah lapisan
 * yang bisa berbohong tentang perilaku aslinya. Komponen React diverifikasi
 * lewat browser sungguhan (lihat catatan audit di docs/BACKLOG.md), bukan di
 * sini.
 *
 * Ekstensi `.mts`, bukan `.ts`: file config dimuat sebagai CommonJS kalau
 * package.json tidak `"type": "module"`, dan Vite memperingatkan setiap kali
 * ada sintaks ESM di dalamnya. `.mts` menghilangkan peringatan itu tanpa
 * mengubah apa pun di package.json.
 */
export default defineConfig({
  resolve: {
    // Alias yang sama dengan tsconfig `paths`, supaya test mengimpor modul
    // dengan jalur yang persis sama dengan kode produksi (`@/lib/...`).
    alias: { '@': import.meta.dirname },
  },
  test: {
    environment: 'node',
    // `app/**` ikut supaya route handler bisa diuji di tempatnya. Yang diuji
    // di sana tetap logika server murni (keputusan handler + query yang
    // dikirim ke Supabase palsu) — bukan komponen React, jadi environment
    // `node` di atas masih berlaku.
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
  },
});

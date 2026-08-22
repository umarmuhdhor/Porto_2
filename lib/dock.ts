/**
 * Penyiaran antar dock mengambang (AssistantDock kiri-atas, GuestbookDock
 * kanan-atas).
 *
 * Keduanya `fixed` selebar `min(24rem, 100vw - 2rem)`, jadi di layar sempit dua
 * panel terbuka akan saling menutupi. Yang baru dibuka menyiarkan `dock:open`
 * dengan id-nya; dock lain yang mendengar id berbeda menutup diri.
 *
 * Lewat window event, BUKAN state bersama: tiap dock tetap komponen berdiri
 * sendiri yang bisa dipasang/dilepas di layout tanpa provider baru, dan tidak
 * ada satu pun dari keduanya yang perlu tahu dock lain ada.
 */

export const DOCK_OPEN_EVENT = 'dock:open';

export type DockId = 'assistant' | 'guestbook';

export function announceDockOpen(id: DockId) {
  window.dispatchEvent(new CustomEvent(DOCK_OPEN_EVENT, { detail: { id } }));
}

/** Pasang pendengar; `onOther` dipanggil saat dock LAIN yang terbuka. */
export function onOtherDockOpen(self: DockId, onOther: () => void): () => void {
  function handle(event: Event) {
    const detail = (event as CustomEvent<{ id: DockId }>).detail;
    if (detail?.id !== self) onOther();
  }
  window.addEventListener(DOCK_OPEN_EVENT, handle);
  return () => window.removeEventListener(DOCK_OPEN_EVENT, handle);
}

'use client';

/**
 * Kursor pengunjung lain secara live (Supabase Realtime).
 *
 * BUKAN lewat database: posisi kursor dikirim sebagai Broadcast — pesan
 * ephemeral yang diteruskan antar-klien tanpa pernah ditulis ke tabel. Yang
 * dipakai dari database cuma NOL. Karena itu koneksinya memakai ANON key (aman
 * di browser), bukan service role, dan tabel `guestbook` tetap tertutup rapat.
 *
 * Presence dipakai HANYA untuk daftar hadir/pergi. Posisi tidak lewat presence
 * karena setiap `track()` menyiarkan ulang seluruh state channel ke semua orang —
 * biaya yang membengkak kuadratik saat ramai. Broadcast mengirim satu pesan
 * kecil, jadi posisi lewat broadcast, roster lewat presence.
 *
 * TIGA hal yang menahan biaya & performa:
 *  1. laju kirim dibatasi BROADCAST_MS (lib/live-cursors.ts) — lihat catatan
 *     biaya di sana;
 *  2. posisi peer disimpan di ref + ditulis langsung ke `style.transform` dalam
 *     loop rAF. React hanya re-render saat ada peer masuk/keluar, bukan tiap
 *     gerakan mouse — kalau tidak, satu peer aktif memicu ~14 render/detik;
 *  3. modul realtime di-`import()` di dalam efek, jadi ~40kb klien Supabase
 *     tidak ikut bundle awal dan tak pernah diunduh perangkat sentuh.
 *
 * KOORDINAT dikirim sebagai fraksi 0..1 terhadap ukuran DOKUMEN, bukan piksel:
 * tiap pengunjung punya viewport berbeda dan halaman ini penuh section setinggi
 * viewport, jadi piksel absolut akan menaruh kursor di section yang salah.
 * Fraksi membuatnya mendarat di tempat yang setara secara relatif — dekat, bukan
 * presisi piksel, dan itu memang batas wajar fitur ini.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  BROADCAST_MS,
  LERP,
  channelFor,
  identityFor,
  type CursorPayload,
} from '@/lib/live-cursors';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Posisi target (dari broadcast) + posisi terlihat (hasil interpolasi). */
interface PeerState {
  targetX: number;
  targetY: number;
  renderX: number;
  renderY: number;
  /** false sampai broadcast pertama — peer yang belum pernah bergerak tak digambar. */
  seen: boolean;
}

export function LiveCursors() {
  const pathname = usePathname();

  // Daftar id SAJA yang jadi state React. Posisinya sengaja di luar React.
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const peers = useRef(new Map<string, PeerState>());
  const nodes = useRef(new Map<string, HTMLDivElement | null>());

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
    // Perangkat sentuh tak punya kursor untuk dibagikan, dan menampilkan kursor
    // orang lain di sana cuma menambah koneksi yang tidak menghasilkan apa-apa.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (typeof crypto === 'undefined' || !crypto.randomUUID) return;

    const selfId = crypto.randomUUID();
    // Ref di-salin ke variabel lokal: cleanup berjalan setelah render berikutnya,
    // dan membaca `.current` di sana berarti membaca nilai yang mungkin sudah
    // berganti. Map-nya sendiri stabil, jadi salinan ini sekaligus mematikan
    // peringatan react-hooks tanpa mengubah perilaku.
    const peerMap = peers.current;
    const nodeMap = nodes.current;
    let disposed = false;
    let detach: (() => void) | null = null;

    void (async () => {
      const { createClient } = await import('@supabase/supabase-js');
      if (disposed) return;

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
        // Plafon sisi klien; laju sebenarnya ditentukan throttle di bawah.
        realtime: { params: { eventsPerSecond: Math.ceil(1000 / BROADCAST_MS) } },
      });

      const channel = supabase.channel(channelFor(pathname), {
        config: { presence: { key: selfId } },
      });

      function forget(id: string) {
        peerMap.delete(id);
        nodeMap.delete(id);
        setPeerIds((prev) => (prev.includes(id) ? prev.filter((peer) => peer !== id) : prev));
      }

      channel
        .on('broadcast', { event: 'cursor' }, ({ payload }) => {
          const cursor = payload as CursorPayload;
          if (!cursor?.id || cursor.id === selfId) return;

          const existing = peerMap.get(cursor.id);
          if (existing) {
            existing.targetX = cursor.x;
            existing.targetY = cursor.y;
            existing.seen = true;
            return;
          }
          // Peer baru: mulai TEPAT di posisi targetnya, bukan di (0,0) — kalau
          // tidak, kursor tampil melesat dari pojok kiri atas saat pertama muncul.
          peerMap.set(cursor.id, {
            targetX: cursor.x,
            targetY: cursor.y,
            renderX: cursor.x,
            renderY: cursor.y,
            seen: true,
          });
          setPeerIds((prev) => (prev.includes(cursor.id) ? prev : [...prev, cursor.id]));
        })
        .on('presence', { event: 'leave' }, ({ key }) => forget(key as string))
        .on('presence', { event: 'sync' }, () => {
          // Jaring pengaman untuk peer yang hilang tanpa event `leave`
          // (tab ditutup paksa, jaringan putus): apa pun yang tak ada lagi di
          // roster dibuang, sehingga tak ada kursor hantu yang menetap.
          const roster = new Set(Object.keys(channel.presenceState()));
          peerMap.forEach((_, id) => {
            if (!roster.has(id)) forget(id);
          });
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') void channel.track({ at: Date.now() });
        });

      // ——— Kirim posisi sendiri (throttled) ———
      let lastSent = 0;
      let pendingX = 0;
      let pendingY = 0;
      let hasPending = false;

      // Memakai ukuran dokumen yang DI-CACHE (lihat docW/docH di bawah) — sama
      // seperti loop render, membacanya langsung di sini berarti satu reflow
      // paksa tiap gerakan mouse.
      function onPointerMove(event: PointerEvent) {
        pendingX = (event.clientX + window.scrollX) / docW;
        pendingY = (event.clientY + window.scrollY) / docH;
        hasPending = true;
      }

      // ——— Loop render: interpolasi + tulis transform langsung ke DOM ———
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let raf = 0;

      /**
       * Ukuran dokumen di-CACHE, tidak dibaca ulang tiap frame. `scrollWidth`/
       * `scrollHeight` adalah properti yang memaksa layout sinkron: membacanya
       * di dalam loop rAF berarti satu reflow paksa per frame SELAMA HALAMAN
       * HIDUP — termasuk saat user sedang men-scroll dan tak ada satu pun peer.
       * Nilainya cuma berubah saat layout berubah, jadi resize yang memperbarui.
       */
      let docW = document.documentElement.scrollWidth;
      let docH = document.documentElement.scrollHeight;
      const remeasure = () => {
        docW = document.documentElement.scrollWidth;
        docH = document.documentElement.scrollHeight;
      };
      window.addEventListener('resize', remeasure, { passive: true });
      // Tinggi dokumen halaman ini ditentukan panel sticky yang tingginya vh —
      // ia ikut berubah tanpa event resize (mis. font selesai dimuat), jadi
      // ukurannya diamati juga lewat ResizeObserver di <body>.
      const ro =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(remeasure) : null;
      ro?.observe(document.body);

      function frame(now: number) {
        raf = requestAnimationFrame(frame);

        if (hasPending && now - lastSent >= BROADCAST_MS) {
          lastSent = now;
          hasPending = false;
          void channel.send({
            type: 'broadcast',
            event: 'cursor',
            payload: { id: selfId, x: pendingX, y: pendingY } satisfies CursorPayload,
          });
        }

        // Sendirian di halaman = tidak ada yang digambar. Ini kondisi yang
        // PALING SERING terjadi, jadi loop keluar sebelum menyentuh DOM sama
        // sekali alih-alih mengiterasi map kosong tiap frame.
        if (peerMap.size === 0) return;

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        peerMap.forEach((peer, id) => {
          const node = nodeMap.get(id);
          if (!node || !peer.seen) return;

          if (reduce) {
            peer.renderX = peer.targetX;
            peer.renderY = peer.targetY;
          } else {
            peer.renderX += (peer.targetX - peer.renderX) * LERP;
            peer.renderY += (peer.targetY - peer.renderY) * LERP;
          }

          // Overlay `fixed`, jadi scroll SENDIRI harus dikurangkan tiap frame —
          // itu yang bikin kursor peer tetap menempel ke tempat yang sama di
          // halaman saat kita men-scroll, bukan ikut menempel ke layar.
          const x = peer.renderX * docW - scrollX;
          const y = peer.renderY * docH - scrollY;
          node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          node.style.opacity = '1';
        });
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      raf = requestAnimationFrame(frame);

      detach = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', remeasure);
        ro?.disconnect();
        cancelAnimationFrame(raf);
        void supabase.removeChannel(channel);
      };
    })();

    return () => {
      disposed = true;
      detach?.();
      peerMap.clear();
      nodeMap.clear();
      setPeerIds([]);
    };
  }, [pathname]);

  if (peerIds.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 'var(--z-cursor)' }}
    >
      {peerIds.map((id) => {
        const { name, hue } = identityFor(id);
        return (
          <div
            key={id}
            ref={(node) => {
              nodes.current.set(id, node);
            }}
            // opacity 0 sampai frame pertama menuliskan transform — tanpa ini
            // kursor berkedip di pojok kiri atas selama satu frame.
            className="absolute top-0 left-0 opacity-0 will-change-transform"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M5 3l14 8.5-6.2 1.3L9.6 19 5 3z"
                fill={`hsl(${hue} 85% 60%)`}
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={1}
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="font-system absolute top-5 left-4 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium whitespace-nowrap"
              style={{ background: `hsl(${hue} 85% 60%)`, color: 'hsl(0 0% 8%)' }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Garis frame vertikal kiri & kanan yang selalu terlihat sepanjang scroll.
 * DESIGN §2.3 / §3. Fixed, pointer-events-none, di atas konten tapi tidak
 * menghalangi interaksi.
 */
export function FrameLines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 'var(--z-frame)' }}
    >
      <span
        className="absolute top-0 bottom-0 w-[2px] bg-black/15"
        style={{ left: 'var(--frame-inset)' }}
      />
      <span
        className="absolute top-0 bottom-0 w-[2px] bg-black/15"
        style={{ right: 'var(--frame-inset)' }}
      />
    </div>
  );
}

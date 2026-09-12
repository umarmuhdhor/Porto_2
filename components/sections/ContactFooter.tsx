/**
 * Section penutup / kontak — mirror 1:1 footer referensi (nithinmwarrier.com).
 *
 * SUSUNAN LAYER (bawah → atas), sama persis dengan referensi:
 *   1. bidang accent-soft + medan titik
 *   2. strip tangga krem di tepi atas (StaircaseBlinds)
 *   3. isi ber-parallax (FooterParallax):
 *        panggung  → watermark nama
 *        garis     → dua paruh yang digambar dari tepi ke tengah
 *        blok bawah→ CTA kiri, "Reach out" + sosial kanan, kredit
 *
 * ANGKA-ANGKA (clamp, gap, opacity, ukuran ikon) diambil dari computed style
 * referensi, bukan dikira-kira — lihat komentar di titik pemakaiannya.
 *
 * DUA HAL YANG SENGAJA TIDAK DISALIN:
 *   - Huruf. Referensi memakai Trobika (display) & Aeonik (teks). Keduanya font
 *     komersial dan tidak ada di project ini, jadi perannya diisi Space Grotesk
 *     & Geist. Ukuran, tracking, leading, dan warna identik; bentuk hurufnya
 *     yang berbeda. Berat display dinaikkan ke 700 karena Trobika pada berat
 *     normal sudah setebal grotesk bold — memakai 400 akan terbaca jauh lebih
 *     kurus dari referensi.
 *   - Figur avatar. Referensi menaruh karakter pixel-art di tengah panggung
 *     footer; di sini panggungnya sengaja DIBIARKAN KOSONG dan diisi watermark
 *     nama saja. Maskot pixel-art-nya pernah ada di sini lalu dicabut atas
 *     permintaan — jangan dikembalikan tanpa diminta.
 */

import { SITE } from '@/content/site';
import { StaircaseBlinds } from '@/components/ui/StaircaseBlinds';
import { FitWatermark } from '@/components/ui/FitWatermark';
import { RiseGroup, RiseText, Rise } from '@/components/ui/RiseText';
import { FooterParallax } from '@/components/sections/FooterParallax';
import { ContactChromeToggle } from '@/components/sections/ContactChromeToggle';

const { emailUser: MAIL_USER, emailHost: MAIL_HOST, email: EMAIL } = SITE;
const {
  github: GITHUB,
  instagram: INSTAGRAM,
  linkedin: LINKEDIN,
  youtube: YOUTUBE,
} = SITE;

/** Nama watermark, satu baris per elemen array. */
const WATERMARK = SITE.nameLines;

/** Tinta footer — #242424, BUKAN --color-ink (#0a0a0a). Referensi memakai abu
 *  sangat gelap di sini; hitam pekat di atas kuning terbaca lebih keras. */
const INK = 'var(--color-dark)';

/** Font & metrik teks kecil (peran "Aeonik" di referensi). */
const BODY = { fontFamily: 'var(--font-body)', letterSpacing: '-0.03em', color: INK } as const;
/** Font & metrik teks display (peran "Trobika" di referensi). */
const DISPLAY = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: INK,
} as const;

/** Ikon sosial: 48px, stroke 2, ujung bulat — persis set yang dipakai referensi. */
const ICON = {
  width: 48,
  height: 48,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function ContactFooter() {
  return (
    <footer
      className="page-section relative flex min-h-[100svh] flex-col overflow-hidden"
      style={{ background: 'var(--color-accent-soft)', color: INK }}
    >
      <ContactChromeToggle />

      {/* Medan titik halus (mirror referensi) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,10,0.10) 1.4px, transparent 1.4px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Tepi bertangga krem→accent. Referensi menahan strip ini setinggi ~56%
          tinggi footer (450px dari 800px) — jauh lebih dalam dari default 30vh,
          dan itu yang membuat tangganya terbaca sebagai bidang yang menarik
          diri, bukan sekadar pita di tepi atas. Tuntas sedikit lebih awal dari
          default ('top 12%'): footer tidak berhenti di tengah layar seperti
          panggung sticky, jadi menunggu sampai tepinya menyentuh puncak layar
          berarti tangganya baru rampung ketika CTA sudah lewat separuh layar. */}
      <StaircaseBlinds height="56vh" end="top 12%" />

      <FooterParallax
        className="relative z-[3] flex flex-1 flex-col"
        style={{ paddingInline: 'var(--frame-inset)' }}
      >
        {/* ——— Panggung: watermark ——— */}
        <div className="relative flex flex-1 items-center justify-center">
          {/* Watermark. opacity 0.1 di mobile / 0.2 di desktop, dan kotaknya
              melebihi layar (150%) di mobile supaya nama tetap terbaca sebagai
              tekstur besar, bukan teks kecil di tengah. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center opacity-10 md:opacity-20"
          >
            <FitWatermark lines={WATERMARK} className="relative w-[150%] md:w-[85%]" />
          </div>

        </div>

        {/* Semua yang di bawah panggung masuk ke SATU grup reveal: garis, CTA,
            sosial, dan kredit menyala sebagai satu kejadian saat footer masuk
            layar. Grup terpisah per baris berarti empat observer yang
            melaporkan hal yang sama. */}
        <RiseGroup>
          {/* ——— Garis pembatas: dua paruh, digambar dari tepi ke tengah ——— */}
          <div aria-hidden className="relative z-[3] flex w-full">
            <span className="rise-line h-px flex-1 origin-left" style={{ background: '#ACACAC' }} />
            <span
              className="rise-line h-px flex-1 origin-right"
              style={{ background: '#ACACAC' }}
            />
          </div>

          {/* ——— Blok bawah ——— */}
          <div
            className="relative px-0 md:px-[clamp(16px,4vh,56px)]"
            style={{ paddingBlock: 'clamp(12px, 3vh, 56px)' }}
          >
            <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
              {/* CTA kiri */}
              <div className="text-center md:text-left">
                <p
                  style={{
                    ...BODY,
                    fontSize: 'clamp(16px, 2vw, 48px)',
                    lineHeight: 1.2,
                  }}
                >
                  <RiseText inline text="Let's build something" />
                </p>
                <div
                  style={{
                    ...DISPLAY,
                    fontSize: 'clamp(32px, 3.8vw, 88px)',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                    marginTop: 9,
                  }}
                >
                  <RiseText
                    className="justify-center md:justify-start"
                    text="meaningful"
                    delay={0.06}
                  />
                  <RiseText
                    className="justify-center md:justify-start"
                    text="and memorable"
                    delay={0.12}
                  />
                </div>
              </div>

              {/* Reach out kanan */}
              <div className="flex flex-col items-center md:items-end">
                <p
                  className="justify-center md:justify-end"
                  style={{
                    ...BODY,
                    fontSize: 'clamp(18px, 1.25vw, 24px)',
                    lineHeight: 1,
                    marginBottom: 20,
                    display: 'flex',
                  }}
                >
                  <RiseText inline text="Reach out" delay={0.18} />
                </p>

                <div
                  className="justify-center md:justify-end"
                  style={{ display: 'flex', gap: 20, position: 'relative', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: 20 }}>
                    {/* GitHub duluan: ini portofolio developer, dan tautan yang
                        paling mungkin diklik perekrut adalah kodenya. */}
                    <Rise delay={0.24}>
                      <a
                        href={GITHUB}
                        aria-label="GitHub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-ink inline-flex focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        <svg {...ICON} aria-hidden>
                          <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
                        </svg>
                      </a>
                    </Rise>

                    <Rise delay={0.3}>
                      <a
                        href={INSTAGRAM}
                        aria-label="Instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-ink inline-flex focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        <svg {...ICON} aria-hidden>
                          <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                          <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                          <path d="M16.5 7.5v.01" />
                        </svg>
                      </a>
                    </Rise>

                    <Rise delay={0.36}>
                      <a
                        href={LINKEDIN}
                        aria-label="LinkedIn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-ink inline-flex focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        <svg {...ICON} aria-hidden>
                          <path d="M8 11v5" />
                          <path d="M8 8v.01" />
                          <path d="M12 16v-5" />
                          <path d="M16 16v-3a2 2 0 1 0 -4 0" />
                          <path d="M3 7a4 4 0 0 1 4 -4h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4z" />
                        </svg>
                      </a>
                    </Rise>
                    {/* YouTube terakhir: kanal matematika, bukan kerja
                        engineering — relevan sebagai bukti mengajar, tapi
                        bukan tautan yang dicari perekrut lebih dulu. */}
                    <Rise delay={0.42}>
                      <a
                        href={YOUTUBE}
                        aria-label="YouTube"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-ink inline-flex focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        <svg {...ICON} aria-hidden>
                          <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4z" />
                          <path d="M10 9l5 3l-5 3z" />
                        </svg>
                      </a>
                    </Rise>
                  </div>

                  {/* Email: ikon "@" yang melebar jadi alamat lengkap saat
                      disentuh. Padding+margin negatif yang sepasang memberi
                      area hover yang lebih longgar dari ikonnya tanpa menggeser
                      layout — kalau tidak, alamatnya berkedip tiap kali kursor
                      menyerempet tepi ikon.

                      BEDA DARI REFERENSI: di sana ini <span> berkursor custom;
                      di sini <a href="mailto:"> supaya benar-benar bisa diklik
                      dan punya jalur keyboard (alamat ikut melebar saat fokus). */}
                  <div style={{ padding: 20, margin: -20, position: 'relative' }}>
                    <Rise delay={0.42}>
                      <a
                        href={`mailto:${EMAIL}`}
                        aria-label={`Email ${EMAIL}`}
                        className="mail-widget focus-visible:outline-ink inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-4"
                        style={{ color: INK }}
                      >
                        <span
                          aria-hidden
                          className="mail-reveal"
                          style={{ ...BODY, fontSize: 'clamp(18px, 2vw, 40px)', lineHeight: 1.3 }}
                        >
                          {MAIL_USER}
                        </span>
                        <svg {...ICON} aria-hidden>
                          <circle cx="12" cy="12" r="4" />
                          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                        </svg>
                        <span
                          aria-hidden
                          className="mail-reveal"
                          style={{ ...BODY, fontSize: 'clamp(18px, 2vw, 40px)', lineHeight: 1.3 }}
                        >
                          {MAIL_HOST}
                        </span>
                      </a>
                    </Rise>
                  </div>
                </div>
              </div>
            </div>

            {/* Kredit sudut bawah */}
            <div
              className="flex w-full flex-row items-center px-[24px] md:px-0"
              style={{ marginTop: 'clamp(20px, 6vh, 120px)', opacity: 0.6 }}
            >
              <p
                className="rise-fade flex-1 text-left"
                style={{ ...BODY, fontSize: 'clamp(12px, 1.25vw, 24px)', lineHeight: 1 }}
              >
                Designed in <span style={{ fontWeight: 700 }}>Figma</span>
              </p>
              <p
                className="rise-fade flex-1 text-right"
                style={{ ...BODY, fontSize: 'clamp(12px, 1.25vw, 24px)', lineHeight: 1 }}
              >
                Created with <span style={{ fontWeight: 700 }}>Claude Code</span>
              </p>
            </div>
          </div>
        </RiseGroup>
      </FooterParallax>
    </footer>
  );
}

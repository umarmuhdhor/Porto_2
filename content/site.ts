/**
 * Identitas situs — SATU sumber kebenaran.
 *
 * Sebelum file ini ada, nama/role/email/handle sosial ditulis ulang di tujuh
 * tempat: metadata layout, label hero, watermark & tombol sosial footer, link
 * CONTACT di nav, monogram badge, dan enam kali di dalam jawaban chatbot.
 * Konsekuensinya bukan cuma repot — email yang diganti di footer tapi lupa di
 * chatbot menghasilkan situs yang menyebut dua alamat berbeda, dan tidak ada
 * satu pun yang akan gagal build untuk memberi tahu.
 *
 * ATURAN: jangan pernah menulis nama, email, atau URL sosial langsung di
 * komponen. Impor dari sini.
 *
 * Yang SENGAJA tidak masuk ke sini: isi jendela `AboutWindows`. Kalimatnya
 * membawa penanda `<Hl>` per frasa (bagian dari komposisinya, bukan sekadar
 * teks), jadi memindahkannya ke data polos akan menghapus penekanan itu atau
 * memaksa markup masuk ke file konfigurasi. Itu tinggal di komponennya.
 */

const EMAIL_USER = 'muhdhorcs';
const EMAIL_HOST = 'gmail.com';

/**
 * Handle sosial — DIVERIFIKASI ke akun aslinya (2026-08-22).
 *
 * Ditulis satu per satu, TIDAK diturunkan dari satu konstanta bersama: handle
 * Instagram-nya ternyata beda sendiri ("umarmuhd._", bukan "umarmuhdhor").
 * Versi sebelumnya menempelkan satu nilai ke ketiga URL dan menghasilkan tautan
 * Instagram yang mati — jangan disatukan lagi hanya karena dua di antaranya
 * kebetulan sama.
 */
const GITHUB_HANDLE = 'umarmuhdhor';
const LINKEDIN_HANDLE = 'umarmuhdhor';
const INSTAGRAM_HANDLE = 'umarmuhd._';
/**
 * Kanal YouTube matematika ("Tidak Sulit"). Handle-nya TIDAK ada hubungannya
 * dengan nama — ditulis apa adanya dari DATA-PORTO (data/contact.json), dan
 * termasuk tanda `@`-nya, karena itu memang bagian dari URL-nya.
 */
const YOUTUBE_HANDLE = '@tidaksulit6688';

const NAME = 'Umar Muhdhor';

/**
 * Peran ditulis sebagai DUA bagian, bukan satu kalimat: hero memasangnya
 * mengapit nama di kiri & kanan garis frame, jadi pemisahannya adalah data,
 * bukan keputusan layout yang boleh ditebak komponen lewat `split('&')`.
 * `ROLE` (bergabung) tetap dipakai untuk metadata & JSON-LD yang butuh satu baris.
 */
const ROLE_PARTS = ['iOS Developer', 'AI Automation'] as const;
const ROLE = ROLE_PARTS.join(' & ');

export const SITE = {
  name: NAME,
  role: ROLE,
  /** Dua sisi label hero — kiri & kanan nama. */
  roleParts: ROLE_PARTS,

  /**
   * Nama dipecah per baris untuk watermark raksasa di footer. Ukurannya
   * dihitung agar baris terpanjang memenuhi kotaknya (lihat FitWatermark),
   * jadi jumlah baris bebas — bukan dua saja.
   */
  nameLines: ['UMAR', 'MUHDHOR'],

  /** Monogram badge tepi kanan. */
  monogram: 'UM.',

  location: 'Bali, Indonesia',

  /**
   * Email dipecah user/host karena footer merendernya sebagai dua potong yang
   * melebar mengapit ikon "@" saat di-hover.
   */
  emailUser: EMAIL_USER,
  emailHost: EMAIL_HOST,
  email: `${EMAIL_USER}@${EMAIL_HOST}`,
  mailto: `mailto:${EMAIL_USER}@${EMAIL_HOST}`,

  githubHandle: GITHUB_HANDLE,
  linkedinHandle: LINKEDIN_HANDLE,
  instagramHandle: INSTAGRAM_HANDLE,
  youtubeHandle: YOUTUBE_HANDLE,

  github: `https://github.com/${GITHUB_HANDLE}`,
  linkedin: `https://www.linkedin.com/in/${LINKEDIN_HANDLE}/`,
  instagram: `https://www.instagram.com/${INSTAGRAM_HANDLE}/`,
  youtube: `https://www.youtube.com/${YOUTUBE_HANDLE}`,

  seo: {
    title: `${NAME} — ${ROLE}`,
    // Kalimat role SENGAJA ditulis utuh, bukan diturunkan dari `ROLE` lewat
    // `toLowerCase()`: "iOS Developer" akan jadi "ios developer" dan kapital
    // merek Apple-nya hilang di seluruh hasil pencarian.
    // Apple Developer Academy disebut EKSPLISIT: ini pembeda terkuat yang ada,
    // dan kalimat inilah yang muncul di hasil pencarian serta di setiap preview
    // tautan (WhatsApp, LinkedIn, Slack). Tanpa itu deskripsinya terbaca sama
    // seperti ribuan portofolio mobile lain.
    description: `Mobile app work by ${NAME} — an iOS developer at the Apple Developer Academy in Bali, Indonesia, building reliable, easy-to-use apps with Swift and Flutter.`,
  },
} as const;

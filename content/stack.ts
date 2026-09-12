/**
 * Tech stack — isi section `#stack` (components/sections/ValueSection.tsx).
 *
 * SUMBER: DATA-PORTO `data/skills.json`. Kalau file itu berubah, file ini yang
 * disamakan dengan tangan — situs ini tidak meng-import DATA-PORTO saat build.
 *
 * SATU TAMBAHAN DI LUAR skills.json: **SwiftUI**. Ia tidak terdaftar sebagai
 * skill di sana, tapi muncul di `stack.frontend` empat project (Load Away,
 * Hisplora, PopShot!!, Balive) — jadi buktinya ada, cuma barisnya yang lupa
 * ditulis. Menampilkan ARKit, HealthKit, dan watchOS TANPA SwiftUI akan terbaca
 * aneh bagi siapa pun yang mengenal platformnya, seolah framework UI-nya sengaja
 * dihindari.
 *
 * YANG SENGAJA TIDAK MASUK: kategori `soft` di skills.json (Leadership, Public
 * Speaking, Teaching & Mentoring, Event Management, Team Collaboration). Semua
 * benar dan semua relevan — tapi bukan stack, dan menyelipkannya di antara
 * Swift dan Supabase membuat seluruh daftarnya berhenti berarti "yang saya
 * pakai untuk membangun". Kerja mengajarnya sudah punya dua case study sendiri.
 *
 * Kategori `design` (satu item, UI/UX Design) digabung ke "Tools & Practice":
 * satu grup berisi satu chip terbaca seperti grup yang isinya hilang.
 */

export interface StackGroup {
  /** Label kolom kiri. Pendek — ia dirender uppercase ber-tracking lebar. */
  label: string;
  /**
   * Urutannya DIPILIH, bukan diurutkan dari `level` di skills.json.
   * Mengurutkan Languages by level akan menaruh Swift (level 3) di belakang
   * Java dan PHP, dan Swift adalah satu-satunya bahasa di daftar itu yang
   * menjelaskan kenapa orang membuka situs ini. Yang paling dekat dengan posisi
   * yang dituju berdiri duluan.
   */
  items: readonly string[];
}

/** Urutan grup = urutan tampil. */
export const STACK: readonly StackGroup[] = [
  {
    label: 'Languages',
    items: ['Swift', 'Dart', 'Python', 'PHP', 'Java'],
  },
  {
    label: 'Frameworks',
    items: [
      'SwiftUI',
      'Flutter',
      'ARKit',
      'HealthKit',
      'watchOS',
      'React',
      'React Native',
      'Laravel',
      'Strapi',
      'FlutterFlow',
    ],
  },
  {
    // Kedua di daftar, bukan terakhir: separuh label peran di hero berbunyi
    // "AI Automation", dan mengubur barisnya di bawah database membuat halaman
    // ini membantah header-nya sendiri.
    label: 'AI & Automation',
    items: ['Claude API', 'MCP', 'n8n', 'TensorFlow', 'Keras', 'scikit-learn'],
  },
  {
    label: 'Data',
    items: ['Supabase', 'Firebase', 'MySQL'],
  },
  {
    label: 'Tools & Practice',
    items: ['Git', 'REST API', 'WebSocket', 'UI/UX Design'],
  },
];

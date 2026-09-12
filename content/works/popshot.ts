import type { Work } from './types';

/**
 * PopShot!! — app dokumentasi perjalanan berbasis challenge untuk grup, dibangun
 * di Apple Developer Academy oleh tim berisi enam orang. Umar mengerjakan sisi
 * iOS (Swift); backend Go + PostgreSQL + GCP dikerjakan anggota tim lain.
 * Repo: github.com/KenzieFu/CH-3 · TestFlight: dts9hnCS
 *
 * CATATAN ANGKA: PRD project ini memuat OKR (5.000 user, rating ≥4.3, dst)
 * yang semuanya TARGET, bukan hasil. Angka itu SENGAJA tidak dipakai di
 * `outcomes` — bagian itu hanya untuk yang benar-benar tercapai.
 *
 * `challenge` dan `approach` di sini menceritakan proses framing-nya, bukan
 * cerita rekayasa yang lebih enak dibaca: itulah yang benar-benar terdokumentasi
 * di DATA-PORTO, dan bagian itu yang menentukan bentuk produknya.
 *
 * Layar welcome di gallery ASLI; sisanya masih placeholder.
 */
export const popshot: Work = {
  slug: 'popshot',
  title: 'PopShot!!',
  logo: '/works/popshot/popshot_logo.svg',
  category: 'IOS APP | SWIFT + REALTIME',
  disciplines: ['app'],
  year: '2026',
  description:
    'An iOS app that turns group travel photos into a game — photo challenges, live sidequest picks over WebSocket, and a shared album that only unlocks once the trip ends.',
  summary: [
    {
      text: 'Group trip photos end up scattered across chats, stories, and ten different camera rolls. ',
    },
    {
      text: 'PopShot!! makes documenting the trip the game itself: everyone gets photo challenges, picks an exclusive sidequest, and the shared album unlocks only after the trip is over.',
      strong: true,
    },
    {
      text: ' I built the iOS client in Swift — auth, trip creation and join-by-code, the real-time waiting room, the camera and its challenge overlay, upload with retry, and the album screens.',
    },
  ],
  services: ['iOS development', 'Real-time client', 'Camera and media upload', 'API integration'],
  facts: [
    { label: 'Context', value: 'Apple Developer Academy, Bali' },
    { label: 'Role', value: 'iOS engineer (Swift) — frontend' },
    { label: 'Backend', value: 'Go, PostgreSQL, GCP — built by teammates' },
    { label: 'Team', value: 'Six people' },
  ],
  stack: ['Swift', 'WebSocket', 'REST API', 'JWT auth', 'GCP Cloud Storage'],
  links: [
    { label: 'Try on TestFlight', href: 'https://testflight.apple.com/join/dts9hnCS' },
    { label: 'Source on GitHub', href: 'https://github.com/KenzieFu/CH-3' },
  ],
  challenge:
    'The team was handed "travel" as a topic and the space turned out to be enormous. Four days into a six-week window the discussion had stalled on a Miro board full of listed problems, and the head of the academy in Bali pointed at the actual fault: the board itself was forcing a problem-then-solution flow that narrowed the idea before anyone understood it. The engineering problem underneath was no gentler — ten people on a beach with patchy signal, all needing to see the same state at the same instant, where a sidequest card has to become unavailable the moment somebody else takes it.',
  role: 'iOS engineer (frontend), one of six. Built the Swift client: authentication, the adaptive landing that decides where a returning user opens, trip creation and join-by-code, the real-time Waiting Room and its WebSocket client, the camera screen with its challenge overlay and categorised photo upload, and the Memories screen with the shared album that unlocks after the trip completes.',
  approach: [
    {
      title: 'Slow the framing down, then test it on strangers',
      body: 'Four days into six weeks is not behind. The team stopped the problem-then-solution flow, spent time bonding first, and re-ran the discussion — and that is where the real problem statement came from. It was then taken to interviews with people matching the target profile, because six people agreeing with each other is not evidence.',
    },
    {
      title: 'Let the app decide where you land',
      body: 'Opening the app during an active trip should not mean navigating back to the camera every time. The landing screen branches on trip state — mid-trip users go straight to the camera, everyone else to the trip list — so the app matches what the user is actually doing.',
    },
    {
      title: 'Exclusive picks need live state, not a refresh',
      body: 'Sidequest cards are one-per-person, so a card taken on another phone has to grey out here immediately. The Waiting Room holds an open WebSocket and reconciles member list and card state as they arrive, rather than polling and hoping the tap lands first.',
    },
  ],
  outcomes: [
    { metric: '10', label: 'Members per trip, kept in sync live' },
    { metric: '2', label: 'Challenge modes — Color Hunt and Pose Hunt' },
    { metric: '6', label: 'Character invite code, one per trip' },
  ],
  banner: {
    src: '/works/popshot/popshot_banner.svg',
    alt: 'PopShot!! screens: the camera with a challenge overlay, the waiting room, and the shared album.',
  },
  gallery: [
    {
      src: '/works/popshot/popshot_welcome.webp',
      alt: 'PopShot!! welcome screen with the mascot, offering log in or sign up.',
      span: 'portrait',
    },
    {
      src: '/works/popshot/popshot_waiting-room.svg',
      alt: 'The real-time Waiting Room: members joining by code and claiming one sidequest card each.',
      span: 'portrait',
    },
    {
      src: '/works/popshot/popshot_screens.svg',
      alt: 'The PopShot!! trip flow: create or join a trip, waiting room, camera, and memories.',
      span: 'half',
    },
    {
      src: '/works/popshot/popshot_flow.svg',
      alt: 'Trip state moving from waiting to active to completed, and where the shared album unlocks.',
      span: 'half',
    },
    {
      src: '/works/popshot/popshot_graphics.svg',
      alt: 'PopShot!! interface pieces: challenge overlay, sidequest cards, and album thumbnails.',
      span: 'full',
    },
  ],
  ogAccent: '#153861',
};

import type { Work } from './types';

/**
 * Popshot!! — app dokumentasi perjalanan berbasis challenge untuk grup.
 * Umar mengerjakan sisi iOS (Swift); backend Golang + PostgreSQL + GCP
 * dikerjakan anggota tim lain. TestFlight: dts9hnCS
 *
 * CATATAN ANGKA: PRD project ini memuat OKR (5.000 user, rating ≥4.3, dst)
 * yang semuanya TARGET, bukan hasil. Angka itu SENGAJA tidak dipakai di
 * `outcomes` — bagian itu hanya untuk yang benar-benar tercapai.
 *
 * Aset masih placeholder — ganti dengan screenshot asli sebelum ship publik.
 */
export const popshot: Work = {
  slug: 'popshot',
  title: 'Popshot!!',
  logo: '/works/popshot/popshot_logo.svg',
  category: 'IOS APP | SWIFT + REALTIME',
  year: '2026',
  description:
    'An iOS app that turns group travel photos into a game — photo challenges, live sidequest picks over WebSocket, and a shared album that only unlocks once the trip ends.',
  summary: [
    {
      text: 'Group trip photos end up scattered across chats, stories, and ten different camera rolls. ',
    },
    {
      text: 'Popshot!! makes documenting the trip the game itself: everyone gets photo challenges, picks an exclusive sidequest, and the shared album unlocks only after the trip is over.',
      strong: true,
    },
    {
      text: ' I built the iOS client in Swift — auth, trip creation and join-by-code, the real-time waiting room, the camera and its challenge overlay, upload with retry, and the album screens.',
    },
  ],
  services: ['iOS development', 'Real-time client', 'Camera and media upload', 'API integration'],
  facts: [
    { label: 'Role', value: 'iOS engineer (Swift)' },
    { label: 'Platform', value: 'iOS 16 and up' },
    { label: 'Backend', value: 'Golang, PostgreSQL, GCP — built by teammates' },
    { label: 'Release', value: 'Beta on TestFlight' },
  ],
  stack: ['Swift', 'WebSocket', 'REST API', 'JWT auth', 'GCP Cloud Storage'],
  links: [{ label: 'Try on TestFlight', href: 'https://testflight.apple.com/join/dts9hnCS' }],
  challenge:
    'A group trip is close to the worst environment a real-time app can ask for: ten people on a beach or a mountain with patchy signal, all needing to see the same state at the same instant. A sidequest card has to become unavailable the moment someone else takes it, and a photo taken with no bars cannot simply be dropped on the floor.',
  role: 'iOS engineer. Built the Swift client end to end: registration and login, the adaptive landing that decides where a returning user opens, trip creation and join-by-code, the real-time waiting room over WebSocket, the camera screen with its challenge overlay and photo categories, upload with retry, and the Memories and Shared Album screens.',
  approach: [
    {
      title: 'Let the app decide where you land',
      body: 'Opening the app during an active trip should not mean navigating back to the camera every time. The landing screen branches on trip state — mid-trip users go straight to the camera, everyone else to the trip list — so the app matches what the user is actually doing.',
    },
    {
      title: 'Exclusive picks need live state, not a refresh',
      body: 'Sidequest cards are one-per-person, so a card taken on another phone has to grey out here immediately. The waiting room holds an open WebSocket and reconciles member list and card state as they arrive, rather than polling and hoping the tap lands first.',
    },
    {
      title: 'Treat a failed upload as pending, not lost',
      body: 'Signal drops exactly where the good photos are. Uploads that fail go to a retry queue instead of surfacing as an error the user has to solve, so a photo taken in a dead spot still reaches the shared album once the phone finds a signal.',
    },
  ],
  outcomes: [
    { metric: '10', label: 'Members per trip, kept in sync live' },
    { metric: '2', label: 'Challenge modes — Color Hunt and Pose Hunt' },
    { metric: 'TestFlight', label: 'Shipped to beta testers' },
  ],
  banner: {
    src: '/works/popshot/popshot_banner.svg',
    alt: 'Popshot!! screens: the camera with a challenge overlay, the waiting room, and the shared album.',
  },
  gallery: [
    {
      src: '/works/popshot/popshot_screens.svg',
      alt: 'The Popshot!! trip flow: create or join a trip, waiting room, camera, and memories.',
      span: 'half',
    },
    {
      src: '/works/popshot/popshot_flow.svg',
      alt: 'Trip state moving from waiting to active to completed, and where the shared album unlocks.',
      span: 'half',
    },
    {
      src: '/works/popshot/popshot_graphics.svg',
      alt: 'Popshot!! interface pieces: challenge overlay, sidequest cards, and album thumbnails.',
      span: 'full',
    },
  ],
  ogAccent: '#db2777',
};

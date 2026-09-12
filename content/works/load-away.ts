import type { Work } from './types';

/**
 * Load Away (nama project Xcode: `Wofoking`) — game iOS satir, dibangun di
 * Apple Developer Academy 2026 oleh tim berisi lima orang: tiga engineer dan
 * dua designer. Repo: github.com/aliefauzan/LoadAway · TestFlight: pFp5njxz
 *
 * CAKUPAN PERAN DIPERSEMPIT ke sumber di DATA-PORTO: pipeline gaze ARKit
 * beserta lima guard-nya, dan companion watchOS yang mengalirkan heart rate.
 * Versi sebelumnya di file ini mengklaim seluruh gameplay engine, Swift 6
 * concurrency, dan QA end-to-end untuk satu orang — dan itu pekerjaan tiga
 * engineer.
 *
 * Logo sekarang ikon aplikasi ASLI (dari DATA-PORTO). Sisa asetnya masih
 * placeholder — ganti dengan screenshot asli sebelum ship publik.
 */
export const loadAway: Work = {
  slug: 'load-away',
  title: 'Load Away',
  logo: '/works/load-away/load-away_logo.svg',
  category: 'IOS GAME | SWIFTUI + ARKIT',
  disciplines: ['app'],
  year: '2026',
  description:
    'A satirical iOS game whose loading bar only fills while you are not looking at it — built in SwiftUI on an ARKit gaze pipeline, with layered anti-cheat guards and live heart rate from Apple Watch.',
  summary: [
    { text: 'A loading bar that hates being watched. ' },
    {
      text: 'Load Away advances only while the player is genuinely not looking — head turned past a calibrated neutral and eyes off the screen, or both eyes shut.',
      strong: true,
    },
    {
      text: " I built the gaze pipeline: ARKit face tracking re-derived as face-to-camera geometry, five anti-cheat guards stacked on top of it, and a watchOS companion streaming live heart rate into the bar's volatility.",
    },
  ],
  services: [
    'Game engineering',
    'ARKit face tracking',
    'watchOS + HealthKit',
    'On-device AI integration',
  ],
  facts: [
    { label: 'Context', value: 'Apple Developer Academy, Bali' },
    { label: 'Role', value: 'iOS engineer — gaze tracking and watchOS heart rate' },
    { label: 'Platform', value: 'iOS + embedded watchOS companion' },
    { label: 'Team', value: 'Five people — three engineers, two designers' },
  ],
  stack: [
    'Swift 6',
    'SwiftUI',
    'ARKit',
    'HealthKit',
    'WatchConnectivity',
    'Foundation Models',
    'CoreHaptics',
  ],
  links: [
    { label: 'Try on TestFlight', href: 'https://testflight.apple.com/join/pFp5njxz' },
    { label: 'Source on GitHub', href: 'https://github.com/aliefauzan/LoadAway' },
  ],
  challenge:
    'The entire game rests on one question the hardware answers badly: is the player looking? TrueDepth stops tracking near profile, so a full head turn reads as a lost face rather than a look away. Judging head angle in world axes inverted the moment the phone moved. And players peek — head turned, eyes slid back to the screen — which no head angle can catch.',
  role: 'iOS engineer, one of three on a five-person team. Built the ARKit gaze pipeline — calibrated face-to-camera classification, the eye-gaze peek guard, the eyes-closed path, the frozen-mesh guard, and the continuous player identity lock — plus the watchOS companion streaming BPM over WatchConnectivity with a stale-sample watchdog, and diagnosed the watch pairing failure down to build configuration rather than code.',
  approach: [
    {
      title: 'Reframe the gaze, do not widen the angle',
      body: "World-frame yaw drifted whenever the phone moved, and a bigger threshold only pushed the gate into TrueDepth's blind spot. Everything was re-derived as face-to-camera geometry — where the camera sits in the face's own frame — with the away-gate at 50°, safely inside reliable range.",
    },
    {
      title: 'Guard every way a player cheats',
      body: 'A head angle alone misses a slid eye, a frozen anchor, and a swapped player. Five guards sit on the gate: an eye-gaze peek check, an eyes-closed path, a frozen-mesh detector, a continuous identity lock, and a peek tax that knocks the bar backwards.',
    },
    {
      title: 'Make the sensors pay for themselves',
      body: 'The camera already knows the eyes, the brow, and the heart, so the anti-cheat rig doubled as comedy: taunts that mock a scowl, a fake push notification that baits a glance at the worst moment, and heart rate from a watch workout session feeding the volatility of the bar.',
    },
  ],
  outcomes: [
    { metric: '50°', label: 'Away-gate, inside TrueDepth range' },
    { metric: '5', label: 'Anti-cheat guards layered on gaze' },
    { metric: '2', label: 'Languages shipped — English and Indonesian' },
  ],
  banner: {
    src: '/works/load-away/load-away_banner.svg',
    alt: 'Load Away gameplay: a loading bar mid-fill over the haunted-forest home screen.',
  },
  gallery: [
    {
      src: '/works/load-away/load-away_screens.svg',
      alt: 'The Load Away flow: splash warning, haunted-forest home, face scan, and gameplay.',
      span: 'half',
    },
    {
      src: '/works/load-away/load-away_system.svg',
      alt: 'The gaze pipeline: face-to-camera geometry feeding the away-gate and its anti-cheat guards.',
      span: 'half',
    },
    {
      src: '/works/load-away/load-away_graphics.svg',
      alt: 'Load Away interface pieces: the loading bar, taunt captions, and the watch heart-rate readout.',
      span: 'full',
    },
  ],
  ogAccent: '#db0700',
};

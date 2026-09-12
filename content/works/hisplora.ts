import type { Work } from './types';

/**
 * Hisplora — quest jalan kaki berbasis lokasi untuk situs cagar budaya,
 * dibangun di Apple Developer Academy (Jul–Agu 2026) oleh tim berisi lima orang.
 * Repo: github.com/imeldamayanti/challenge5
 *
 * SEMUA ANGKA DI `outcomes` DIAMBIL DARI RUTE YANG BENAR-BENAR DITULIS
 * ("Jejak Terakhir Badung", lima checkpoint, ±2,2 km). Project ini tidak pernah
 * rilis publik, jadi tidak ada angka unduhan atau rating — dan tidak ada yang
 * dikarang untuk menggantikannya.
 *
 * Screenshot di gallery ASLI (webp dari DATA-PORTO), semuanya potret layar
 * iPhone — karena itu `span: 'portrait'`. Banner masih placeholder: tidak ada
 * satu pun aset lanskap untuk project ini.
 */
export const hisplora: Work = {
  slug: 'hisplora',
  title: 'Hisplora',
  logo: '/works/hisplora/hisplora_logo.svg',
  category: 'IOS APP | SWIFTUI + CORELOCATION',
  disciplines: ['app'],
  year: '2026',
  description:
    'A location-based cultural companion that turns a heritage visit into a walking quest — linear checkpoints that unlock one layer of a larger story each, geofenced so a quest only opens when the traveller is physically there.',
  summary: [
    { text: 'A heritage site tells a first-time visitor almost nothing. ' },
    {
      text: 'Hisplora turns the visit into a walking quest: physical checkpoints, a piece of lore unlocked at each one, and a shareable recap at the end.',
      strong: true,
    },
    {
      text: ' I wrote the product overview and the quest lore — including the five-checkpoint route through Denpasar — and built the iOS side alongside a team of five.',
    },
  ],
  services: [
    'iOS development',
    'Location and geofencing',
    'Product definition',
    'Content research and writing',
  ],
  facts: [
    { label: 'Context', value: 'Apple Developer Academy, Bali' },
    { label: 'Role', value: 'iOS developer, product, content research' },
    { label: 'Platform', value: 'iOS — SwiftUI, MVVM' },
    { label: 'Team', value: 'Five people' },
  ],
  stack: [
    'Swift',
    'SwiftUI',
    'SwiftData',
    'CoreLocation',
    'MapKit',
    'UserNotifications',
    'PhotosUI',
  ],
  links: [
    { label: 'Source on GitHub', href: 'https://github.com/imeldamayanti/challenge5' },
    {
      label: 'Design file on Figma',
      href: 'https://www.figma.com/design/yH6t41zBdPN0rNgxi8mlZd/New-Hisplora',
    },
  ],
  challenge:
    'Design research turned up two problems and one contradiction. Heritage sites feel flat — visitors know a place is historic but not why, so the visit collapses into a photo checklist — and the information that does exist is scattered across thin plaques and generic search results. The contradiction sat in the fix: every site needed a story that stands alone for a casual visitor, while the entire premise of the product was that the stories connect. On top of that, several checkpoints are active places of worship, where a loud game mechanic would be plainly inappropriate.',
  role: 'iOS developer, product, and content research. Wrote the product overview — research synthesis, personas, user flows, feature spec, and technical direction — researched and wrote the quest lore including the "Jejak Terakhir Badung" route, and built the iOS application as part of a five-person team.',
  approach: [
    {
      title: 'Let the place decide the mechanic',
      body: 'A puzzle-and-scavenger loop belongs in a market or a square, not inside a puri or a pura. The checkpoint mechanics split by the character of the site: quiet and respectful at a place of worship — photograph it, read the lore, answer one light question — and interactive in public space.',
    },
    {
      title: 'Standalone story first, connection as a bonus',
      body: 'Each site got a story complete on its own, and the interconnection became an optional layer that only appears once several sites are visited on one route. Checkpoint order stays strictly linear because the order is the story logic — distant past, recent past, present, then the historical climax.',
    },
    {
      title: 'Two different jobs for one sensor',
      body: 'CoreLocation does two unrelated things here. Inside an active quest a radius check arms the start button so a checkpoint cannot be claimed from a hotel room, and outside one, background geofencing drives the ambient History Alert that fires when you happen to walk past a historic site.',
    },
  ],
  outcomes: [
    { metric: '5', label: 'Checkpoints on the Denpasar route' },
    { metric: '2.2 km', label: 'Walked end to end, measured on foot' },
    { metric: '3', label: 'Quest phases — lore, checkpoints, recap' },
  ],
  banner: {
    src: '/works/hisplora/hisplora_banner.svg',
    alt: 'Hisplora quest route through Denpasar, from Puri Pemecutan to Catur Muka.',
  },
  gallery: [
    {
      src: '/works/hisplora/hisplora_prologue.webp',
      alt: 'Illustrated prologue with a line drawing of a horse carriage in front of a Balinese gate.',
      span: 'portrait',
    },
    {
      src: '/works/hisplora/hisplora_trip-brief.webp',
      alt: 'Trip brief card showing the route distance, estimated walking time, and a historical portrait.',
      span: 'portrait',
    },
    {
      src: '/works/hisplora/hisplora_quest-list.webp',
      alt: 'Quest list at Puri Agung Pemecutan, each card describing one photo task.',
      span: 'portrait',
    },
    {
      src: '/works/hisplora/hisplora_quest-detail.webp',
      alt: 'Quest detail on a scroll card, with a skip route for devices that have no camera.',
      span: 'portrait',
    },
    {
      src: '/works/hisplora/hisplora_photo-task.webp',
      alt: 'Photo quest asking the visitor to find an iron statue, with the camera trigger below the clue.',
      span: 'portrait',
    },
    {
      src: '/works/hisplora/hisplora_geofence.webp',
      alt: 'Geofence guard screen with a map, shown while the visitor stands outside the quest radius.',
      span: 'portrait',
    },
  ],
  ogAccent: '#54453e',
};

import { VideoResolution } from '../types/video';

export const RESOLUTION_PRESETS: VideoResolution[] = [
  // Mobile / HP
  {
    id: 'mobile-9-16-fhd',
    name: 'Mobile Reel / TikTok (9:16)',
    category: 'mobile',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    label: '1080 × 1920 (Reels, TikTok, Shorts)',
  },
  {
    id: 'mobile-9-16-hd',
    name: 'Mobile Story Lite (9:16)',
    category: 'mobile',
    aspectRatio: '9:16',
    width: 720,
    height: 1280,
    label: '720 × 1280 (Fast Mobile Render)',
  },

  // Tablet & Square
  {
    id: 'tablet-1-1-sq',
    name: 'Square Feed / Tablet (1:1)',
    category: 'tablet',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    label: '1080 × 1080 (Instagram, LinkedIn Feed)',
  },
  {
    id: 'tablet-4-3',
    name: 'Tablet iPad Standard (4:3)',
    category: 'tablet',
    aspectRatio: '4:3',
    width: 1440,
    height: 1080,
    label: '1440 × 1080 (Tablet, Presentation, Carousel)',
  },

  // Desktop
  {
    id: 'desktop-16-9-fhd',
    name: 'Desktop Landscape Full HD (16:9)',
    category: 'desktop',
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    label: '1920 × 1080 (YouTube, Presentation, Web)',
  },
  {
    id: 'desktop-16-9-hd',
    name: 'Desktop Standard HD (16:9)',
    category: 'desktop',
    aspectRatio: '16:9',
    width: 1280,
    height: 720,
    label: '1280 × 720 (Quick Landscape HD)',
  },
];

export const DEFAULT_RESOLUTION = RESOLUTION_PRESETS[0]; // 9:16 mobile by default

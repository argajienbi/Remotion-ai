export type AspectRatioType = '9:16' | '1:1' | '4:3' | '16:9';

export type ResolutionCategory = 'mobile' | 'tablet' | 'desktop';

export interface VideoResolution {
  id: string;
  name: string;
  category: ResolutionCategory;
  aspectRatio: AspectRatioType;
  width: number;
  height: number;
  label: string;
}

export type AnimationType =
  | 'pop-spring'
  | 'slide-up'
  | 'slide-left'
  | 'zoom-in'
  | 'kinetic-whip'
  | 'fade';

export type LayerType = 'title' | 'subtitle' | 'badge' | 'image' | 'shape';

export interface SceneLayer {
  id: string;
  type: LayerType;
  content: string; // text or image URL
  color: string;
  fontSize: number; // in relative rem/px
  fontFamily: string;
  fontWeight?: string;
  animation: AnimationType;
  x: number; // 0 - 100 percentage of width
  y: number; // 0 - 100 percentage of height
  scale?: number;
  opacity?: number;
  badgeBgColor?: string;
  badgeTextColor?: string;
  rotation?: number; // degrees
}

export type TransitionType = 'none' | 'fade' | 'slide-left' | 'slide-up' | 'zoom' | 'wipe';

export interface VideoScene {
  id: string;
  title: string;
  durationInFrames: number; // 30fps: 90 frames = 3 seconds
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundValue: string; // CSS color, gradient string, or image URL
  transition: TransitionType;
  layers: SceneLayer[];
}

export interface VideoProject {
  title: string;
  fps: 24 | 30 | 60;
  resolution: VideoResolution;
  scenes: VideoScene[];
}

export type TemplateCategory = 'social' | 'business' | 'typography' | 'education';

export interface TemplatePreset {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  defaultAspectRatio: AspectRatioType;
  defaultFps: 24 | 30 | 60;
  thumbnailGradient: string;
  scenes: VideoScene[];
}

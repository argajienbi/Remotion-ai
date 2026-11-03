import { VideoProject, VideoScene, SceneLayer } from '../types/video';
import { interpolate, spring } from './remotionMath';

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percent: number;
  etaSeconds: number;
  status: 'initializing' | 'rendering' | 'encoding' | 'completed' | 'error';
  error?: string;
}

/**
 * Draws a single video frame onto an HTMLCanvasElement
 */
export function drawFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  project: VideoProject,
  globalFrame: number,
  width: number,
  height: number,
  cachedImages: Map<string, HTMLImageElement>
) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Find active scene and local scene frame
  let accumulatedFrames = 0;
  let activeScene: VideoScene = project.scenes[0];
  let localFrame = 0;

  for (const scene of project.scenes) {
    if (globalFrame < accumulatedFrames + scene.durationInFrames) {
      activeScene = scene;
      localFrame = globalFrame - accumulatedFrames;
      break;
    }
    accumulatedFrames += scene.durationInFrames;
    activeScene = scene;
    localFrame = scene.durationInFrames - 1;
  }

  if (!activeScene) return;

  // 1. Draw Background
  if (activeScene.backgroundType === 'gradient') {
    // Parse gradient or create rich canvas gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (activeScene.backgroundValue.includes('#')) {
      const hexMatches = activeScene.backgroundValue.match(/#[a-fA-F0-9]{3,8}/g);
      if (hexMatches && hexMatches.length >= 2) {
        grad.addColorStop(0, hexMatches[0]);
        if (hexMatches.length > 2) {
          grad.addColorStop(0.5, hexMatches[1]);
          grad.addColorStop(1, hexMatches[hexMatches.length - 1]);
        } else {
          grad.addColorStop(1, hexMatches[1]);
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = '#0F172A';
      }
    } else {
      ctx.fillStyle = '#0F172A';
    }
    ctx.fillRect(0, 0, width, height);
  } else if (activeScene.backgroundType === 'image') {
    const img = cachedImages.get(activeScene.backgroundValue);
    if (img && img.complete) {
      ctx.drawImage(img, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    ctx.fillStyle = activeScene.backgroundValue || '#0F172A';
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Subtle Decorative Lighting Grid / Ambient Glow
  const ambientGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    10,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7
  );
  ambientGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
  ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = ambientGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Layers
  const scaleRatio = width / 1080; // Baseline font scale
  const fps = project.fps;

  activeScene.layers.forEach((layer: SceneLayer, idx: number) => {
    const delay = idx * 6;
    const layerFrame = Math.max(0, localFrame - delay);

    // Calculate animation transform & opacity
    let scale = 1;
    let opacity = 1;
    let yOffset = 0;
    let xOffset = 0;
    let rotation = layer.rotation || 0;

    if (layer.animation === 'pop-spring') {
      scale = spring({
        frame: layerFrame,
        fps,
        config: { damping: 12, mass: 0.8, stiffness: 120 },
      });
      opacity = interpolate(layerFrame, [0, 8], [0, 1]);
    } else if (layer.animation === 'slide-up') {
      yOffset = interpolate(layerFrame, [0, 18], [120 * scaleRatio, 0]);
      opacity = interpolate(layerFrame, [0, 15], [0, 1]);
    } else if (layer.animation === 'slide-left') {
      xOffset = interpolate(layerFrame, [0, 18], [150 * scaleRatio, 0]);
      opacity = interpolate(layerFrame, [0, 12], [0, 1]);
    } else if (layer.animation === 'zoom-in') {
      scale = interpolate(layerFrame, [0, 24], [0.4, 1]);
      opacity = interpolate(layerFrame, [0, 12], [0, 1]);
    } else if (layer.animation === 'kinetic-whip') {
      scale = spring({
        frame: layerFrame,
        fps,
        config: { damping: 8, mass: 0.5, stiffness: 180 },
      });
      rotation = interpolate(layerFrame, [0, 20], [-8, 0]);
      opacity = interpolate(layerFrame, [0, 6], [0, 1]);
    } else {
      // fade
      opacity = interpolate(layerFrame, [0, 20], [0, 1]);
    }

    if (opacity <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    const posX = (layer.x / 100) * width + xOffset;
    const posY = (layer.y / 100) * height + yOffset;

    ctx.translate(posX, posY);
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    const baseFontSize = layer.fontSize || (layer.type === 'title' ? 56 : 28);
    const scaledFontSize = Math.max(14, Math.round(baseFontSize * scaleRatio));
    const fontFamily = layer.fontFamily || 'Plus Jakarta Sans';
    const fontWeight = layer.fontWeight || (layer.type === 'title' ? '800' : '600');

    if (layer.type === 'badge') {
      // Draw rounded pill badge
      ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}, system-ui, sans-serif`;
      const textMetrics = ctx.measureText(layer.content);
      const textWidth = textMetrics.width;
      const padX = scaledFontSize * 0.9;
      const padY = scaledFontSize * 0.5;
      const badgeW = textWidth + padX * 2;
      const badgeH = scaledFontSize + padY * 2;
      const radius = badgeH / 2;

      ctx.fillStyle = layer.badgeBgColor || '#3B82F6';
      ctx.beginPath();
      ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, radius);
      ctx.fill();

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 12 * scaleRatio;
      ctx.shadowOffsetY = 4 * scaleRatio;

      ctx.fillStyle = layer.badgeTextColor || '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.content, 0, 1);
    } else if (layer.type === 'image') {
      const img = cachedImages.get(layer.content);
      if (img && img.complete) {
        const imgW = Math.min(width * 0.7, img.width * scaleRatio);
        const imgH = (imgW / img.width) * img.height;
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
      }
    } else {
      // Title or Subtitle Text with auto word wrapping
      ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}, system-ui, sans-serif`;
      ctx.fillStyle = layer.color || '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Drop shadow for legibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 16 * scaleRatio;
      ctx.shadowOffsetY = 4 * scaleRatio;

      const maxWidth = width * 0.88;
      const words = layer.content.split(' ');
      const lines: string[] = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      const lineHeight = scaledFontSize * 1.25;
      const startY = -((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, lineIdx) => {
        ctx.fillText(line, 0, startY + lineIdx * lineHeight);
      });
    }

    ctx.restore();
  });
}

/**
 * Preload all image assets used in project
 */
export async function preloadProjectImages(project: VideoProject): Promise<Map<string, HTMLImageElement>> {
  const cache = new Map<string, HTMLImageElement>();
  const urls: string[] = [];

  project.scenes.forEach((scene) => {
    if (scene.backgroundType === 'image' && scene.backgroundValue) {
      urls.push(scene.backgroundValue);
    }
    scene.layers.forEach((layer) => {
      if (layer.type === 'image' && layer.content) {
        urls.push(layer.content);
      }
    });
  });

  await Promise.all(
    urls.map((url) => {
      return new Promise<void>((resolve) => {
        if (cache.has(url)) return resolve();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          cache.set(url, img);
          resolve();
        };
        img.onerror = () => {
          console.warn('Could not load image asset:', url);
          resolve();
        };
        img.src = url;
      });
    })
  );

  return cache;
}

/**
 * Render Project to MP4/WebM Video file using Canvas Stream & MediaRecorder
 */
export async function renderVideoFile(
  project: VideoProject,
  onProgress: (p: RenderProgress) => void
): Promise<{ blob: Blob; url: string; filename: string }> {
  const totalFrames = project.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  const { width, height } = project.resolution;
  const fps = project.fps;

  onProgress({
    currentFrame: 0,
    totalFrames,
    percent: 0,
    etaSeconds: Math.ceil(totalFrames / fps),
    status: 'initializing',
  });

  const cachedImages = await preloadProjectImages(project);

  // Setup offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Canvas 2D context tidak didukung di browser ini.');
  }

  // Determine best video MIME type supported by browser
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported('video/mp4')) {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
      mimeType = 'video/mp4;codecs=avc1';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else {
      mimeType = 'video/webm';
    }
  }

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000, // 12 Mbps for crystal clear 1080p output
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const startTime = Date.now();
  recorder.start();

  // Frame by frame stepping
  for (let f = 0; f < totalFrames; f++) {
    drawFrameToCanvas(ctx, project, f, width, height, cachedImages);

    // Frame delay for MediaRecorder to consume
    await new Promise((resolve) => setTimeout(resolve, 1000 / fps));

    const elapsed = (Date.now() - startTime) / 1000;
    const framesDone = f + 1;
    const fpsRate = framesDone / elapsed;
    const remainingFrames = totalFrames - framesDone;
    const etaSeconds = fpsRate > 0 ? Math.ceil(remainingFrames / fpsRate) : 0;
    const percent = Math.min(99, Math.round((framesDone / totalFrames) * 100));

    onProgress({
      currentFrame: framesDone,
      totalFrames,
      percent,
      etaSeconds,
      status: 'rendering',
    });
  }

  onProgress({
    currentFrame: totalFrames,
    totalFrames,
    percent: 99,
    etaSeconds: 1,
    status: 'encoding',
  });

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'remotion-video';
      const filename = `${safeTitle}-${project.resolution.aspectRatio.replace(':', 'x')}.${extension}`;

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        etaSeconds: 0,
        status: 'completed',
      });

      resolve({ blob, url, filename });
    };

    recorder.onerror = (event) => {
      reject(new Error('MediaRecorder rendering error: ' + String(event)));
    };

    recorder.stop();
  });
}

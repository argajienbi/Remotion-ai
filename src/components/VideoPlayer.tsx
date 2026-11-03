import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Repeat,
  Maximize2,
  Minimize2,
  ZoomIn,
} from 'lucide-react';
import { VideoProject } from '../types/video';
import { drawFrameToCanvas, preloadProjectImages } from '../remotion/canvasRenderer';
import { frameToTimecode } from '../remotion/remotionMath';

interface VideoPlayerProps {
  project: VideoProject;
  currentFrame: number;
  onFrameChange: (frame: number | ((prev: number) => number)) => void;
  activeSceneIndex: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  currentFrame,
  onFrameChange,
  activeSceneIndex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<'fit' | '50%' | '75%' | '100%'>('fit');
  const [cachedImages, setCachedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  const totalFrames = Math.max(
    1,
    project.scenes.reduce((sum, s) => sum + s.durationInFrames, 0)
  );

  // Preload images whenever project scenes change
  useEffect(() => {
    let isMounted = true;
    preloadProjectImages(project).then((images) => {
      if (isMounted) setCachedImages(images);
    });
    return () => {
      isMounted = false;
    };
  }, [project]);

  // Render current frame onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawFrameToCanvas(
      ctx,
      project,
      currentFrame,
      project.resolution.width,
      project.resolution.height,
      cachedImages
    );
  }, [project, currentFrame, cachedImages]);

  // Playback loop using requestAnimationFrame with precise time tracking
  useEffect(() => {
    if (!isPlaying) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    const frameDuration = (1000 / project.fps) / playbackSpeed;
    let accumulatedTime = 0;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      accumulatedTime += delta;

      if (accumulatedTime >= frameDuration) {
        const framesToAdvance = Math.floor(accumulatedTime / frameDuration);
        accumulatedTime %= frameDuration;

        onFrameChange((prevFrame: number) => {
          const next = prevFrame + framesToAdvance;
          if (next >= totalFrames) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return totalFrames - 1;
            }
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isLooping, playbackSpeed, project.fps, totalFrames, onFrameChange]);

  const togglePlay = () => setIsPlaying((p) => !p);

  const stepFrame = (delta: number) => {
    setIsPlaying(false);
    onFrameChange(Math.max(0, Math.min(totalFrames - 1, currentFrame + delta)));
  };

  const jumpToStart = () => {
    setIsPlaying(false);
    onFrameChange(0);
  };

  const jumpToEnd = () => {
    setIsPlaying(false);
    onFrameChange(totalFrames - 1);
  };

  // Keyboard shortcut listener for spacebar play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentFrame, totalFrames]);

  // Calculate container aspect ratio CSS
  const aspectRatioVal = `${project.resolution.width} / ${project.resolution.height}`;

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Top Player Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">
            {project.scenes[activeSceneIndex]?.title || 'Adegan Aktif'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono">
            Scene {activeSceneIndex + 1}/{project.scenes.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>{project.resolution.aspectRatio}</span>
            <span>·</span>
            <span>{project.resolution.width}×{project.resolution.height}</span>
            <span>·</span>
            <span className="text-emerald-400">{project.fps} FPS</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={zoomScale}
              onChange={(e) => setZoomScale(e.target.value as any)}
              className="bg-slate-800/80 text-slate-300 text-[11px] rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
            >
              <option value="fit">Fit</option>
              <option value="50%">50%</option>
              <option value="75%">75%</option>
              <option value="100%">100%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 min-h-[360px] max-h-[560px] bg-neutral-950/90 relative overflow-hidden"
      >
        <div
          className="relative max-h-full max-w-full flex items-center justify-center rounded-lg shadow-2xl overflow-hidden border border-slate-800/80 transition-all duration-200"
          style={{
            aspectRatio: aspectRatioVal,
            width:
              zoomScale === 'fit'
                ? 'auto'
                : zoomScale === '50%'
                ? `${project.resolution.width * 0.35}px`
                : zoomScale === '75%'
                ? `${project.resolution.width * 0.5}px`
                : `${project.resolution.width * 0.65}px`,
            height: zoomScale === 'fit' ? '100%' : 'auto',
          }}
        >
          <canvas
            ref={canvasRef}
            width={project.resolution.width}
            height={project.resolution.height}
            className="w-full h-full object-contain block bg-slate-900"
          />

          {/* Pause overlay button click */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 ml-1 fill-white" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Controls & Scrubber Footer */}
      <div className="p-3 bg-slate-900/80 border-t border-slate-800/80 flex flex-col gap-2">
        {/* Scrubber Bar */}
        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-xs font-semibold text-slate-200 min-w-[70px]">
            {frameToTimecode(currentFrame, project.fps)}
          </span>

          <div className="flex-1 relative flex items-center">
            {/* Scene divider ticks */}
            <div className="absolute inset-x-0 h-1.5 flex pointer-events-none z-10">
              {project.scenes.map((scene, idx) => {
                const scenePercent = (scene.durationInFrames / totalFrames) * 100;
                return (
                  <div
                    key={scene.id}
                    style={{ width: `${scenePercent}%` }}
                    className="h-full border-r border-slate-950/80 last:border-r-0"
                    title={`Scene ${idx + 1}: ${scene.title}`}
                  />
                );
              })}
            </div>

            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => {
                setIsPlaying(false);
                onFrameChange(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 relative z-20 focus:outline-none"
            />
          </div>

          <span className="font-mono tabular-nums text-xs text-slate-400 min-w-[70px] text-right">
            {frameToTimecode(totalFrames, project.fps)}
          </span>
        </div>

        {/* Playback Buttons Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-mono tabular-nums bg-slate-800/80 px-2 py-0.5 rounded text-[11px] text-indigo-300">
              Frame {currentFrame + 1} / {totalFrames}
            </span>
          </div>

          {/* Primary Transport Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={jumpToStart}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Ke Awal (Frame 0)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => stepFrame(-1)}
              className="px-2 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Mundur 1 Frame (Arrow Left)"
            >
              -1f
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              title="Play / Pause (Spasi)"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 ml-0.5 fill-white" />
              )}
            </button>

            <button
              onClick={() => stepFrame(1)}
              className="px-2 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Maju 1 Frame (Arrow Right)"
            >
              +1f
            </button>

            <button
              onClick={jumpToEnd}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Ke Akhir Frame"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Secondary Controls (Loop & Speed) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                isLooping
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Putar Ulang Otomatis (Loop)"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Loop</span>
            </button>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-slate-800/80 text-slate-300 text-xs rounded-lg px-2 py-1 border border-slate-700/80 focus:outline-none font-mono"
              title="Kecepatan Playback"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

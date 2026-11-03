import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shuffle,
  Layers,
} from 'lucide-react';
import { VideoScene, TransitionType } from '../types/video';
import { framesToSeconds } from '../remotion/remotionMath';

interface SceneBuilderProps {
  scenes: VideoScene[];
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onAddScene: () => void;
  onDuplicateScene: (index: number) => void;
  onDeleteScene: (index: number) => void;
  onMoveScene: (index: number, direction: 'left' | 'right') => void;
  onUpdateSceneDuration: (index: number, durationInFrames: number) => void;
  onUpdateSceneTransition: (index: number, transition: TransitionType) => void;
  fps: number;
}

export const SceneBuilder: React.FC<SceneBuilderProps> = ({
  scenes,
  activeSceneIndex,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveScene,
  onUpdateSceneDuration,
  onUpdateSceneTransition,
  fps,
}) => {
  const transitions: { value: TransitionType; label: string }[] = [
    { value: 'none', label: 'Cut (None)' },
    { value: 'fade', label: 'Crossfade' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'zoom', label: 'Zoom In' },
    { value: 'wipe', label: 'Wipe Clean' },
  ];

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col gap-3">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Scene Timeline Builder
          </h2>
          <span className="text-slate-500 text-xs">·</span>
          <span className="text-xs text-slate-400 font-mono">
            {scenes.length} Adegan Terstruktur
          </span>
        </div>

        <button
          onClick={onAddScene}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Adegan</span>
        </button>
      </div>

      {/* Horizontal Scene Strip */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`flex-shrink-0 w-64 rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Scene Top: Index + Title + Reorder buttons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                      {scene.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      disabled={idx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveScene(idx, 'left');
                      }}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Geser ke kiri"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === scenes.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveScene(idx, 'right');
                      }}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Geser ke kanan"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mini Visual Preview Swatch */}
                <div
                  className="w-full h-14 rounded-lg border border-slate-700/60 relative overflow-hidden flex flex-col items-center justify-center p-2 mb-2.5 shadow-inner"
                  style={{
                    background:
                      scene.backgroundType === 'gradient'
                        ? scene.backgroundValue
                        : scene.backgroundType === 'solid'
                        ? scene.backgroundValue
                        : `url(${scene.backgroundValue}) center/cover`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                  <span className="relative z-10 text-[11px] font-bold text-white text-center line-clamp-1 drop-shadow-md">
                    {scene.layers.find((l) => l.type === 'title')?.content || 'Judul Adegan'}
                  </span>
                  <span className="relative z-10 text-[9px] text-slate-300 text-center line-clamp-1">
                    {scene.layers.length} Lapisan (Teks/Badge)
                  </span>
                </div>
              </div>

              {/* Scene Bottom Controls: Duration & Transition */}
              <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80 text-xs">
                {/* Duration Stepper */}
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="tabular-nums">
                      {framesToSeconds(scene.durationInFrames, fps)} ({scene.durationInFrames}f)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSceneDuration(
                          idx,
                          Math.max(15, scene.durationInFrames - 15)
                        );
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                      title="Kurangi 0.5 detik"
                    >
                      -0.5s
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateSceneDuration(idx, scene.durationInFrames + 15);
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                      title="Tambah 0.5 detik"
                    >
                      +0.5s
                    </button>
                  </div>
                </div>

                {/* Transition Select & Scene Card Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <div className="flex items-center gap-1 flex-1">
                    <Shuffle className="w-3 h-3 text-slate-500 shrink-0" />
                    <select
                      value={scene.transition}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        onUpdateSceneTransition(idx, e.target.value as TransitionType)
                      }
                      className="bg-slate-900 border border-slate-700/80 text-slate-300 text-[10px] rounded px-1.5 py-1 w-full focus:outline-none"
                    >
                      {transitions.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateScene(idx);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                      title="Duplikat Scene"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={scenes.length <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteScene(idx);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Hapus Scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

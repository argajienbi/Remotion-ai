import React from 'react';
import { Video, Sparkles, Download, LayoutTemplate, Smartphone, Monitor, Tablet } from 'lucide-react';
import { AspectRatioType, VideoResolution } from '../types/video';
import { RESOLUTION_PRESETS } from '../remotion/resolutions';

interface HeaderProps {
  currentResolution: VideoResolution;
  onSelectResolution: (res: VideoResolution) => void;
  onOpenAIModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenExportModal: () => void;
  fps: number;
  onChangeFps: (fps: 24 | 30 | 60) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentResolution,
  onSelectResolution,
  onOpenAIModal,
  onOpenTemplateModal,
  onOpenExportModal,
  fps,
  onChangeFps,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Video className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Remotion Studio
          </span>
          <span className="text-[11px] text-slate-400">TypeScript Video Generator</span>
        </div>
      </div>

      {/* Zone 2: Navigation & Quick Resolution Switches */}
      <div className="hidden md:flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80">
        {/* Aspect Ratio Presets */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={() => {
              const res = RESOLUTION_PRESETS.find((r) => r.aspectRatio === '9:16') || RESOLUTION_PRESETS[0];
              onSelectResolution(res);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentResolution.aspectRatio === '9:16'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Format Layar HP (9:16 - TikTok, Reels, Shorts)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>HP 9:16</span>
          </button>

          <button
            onClick={() => {
              const res = RESOLUTION_PRESETS.find((r) => r.aspectRatio === '1:1') || RESOLUTION_PRESETS[2];
              onSelectResolution(res);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentResolution.aspectRatio === '1:1'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Format Square Tablet (1:1 - Feed & Post)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet 1:1</span>
          </button>

          <button
            onClick={() => {
              const res = RESOLUTION_PRESETS.find((r) => r.aspectRatio === '4:3') || RESOLUTION_PRESETS[3];
              onSelectResolution(res);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentResolution.aspectRatio === '4:3'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Format Tablet 4:3 (iPad)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet 4:3</span>
          </button>

          <button
            onClick={() => {
              const res = RESOLUTION_PRESETS.find((r) => r.aspectRatio === '16:9') || RESOLUTION_PRESETS[4];
              onSelectResolution(res);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentResolution.aspectRatio === '16:9'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Format Layar Desktop (16:9 - YouTube & Web)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop 16:9</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* FPS selector */}
        <div className="flex items-center gap-1 text-xs text-slate-400 px-1">
          <span>FPS:</span>
          {([24, 30, 60] as const).map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeFps(rate)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                fps === rate
                  ? 'bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              {rate}
            </button>
          ))}
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenTemplateModal}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors whitespace-nowrap"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ganti Template</span>
        </button>

        <button
          onClick={onOpenAIModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg shadow-sm transition-all whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>AI Script-to-Scenes</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm shadow-emerald-950 transition-all whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Video & TS</span>
        </button>
      </div>
    </header>
  );
};

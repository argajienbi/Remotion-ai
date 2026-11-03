import React, { useState } from 'react';
import {
  X,
  Download,
  Code2,
  Video,
  Terminal,
  Check,
  Copy,
  Loader2,
  Sparkles,
  Play,
  FileArchive,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoProject, VideoResolution } from '../types/video';
import {
  renderVideoFile,
  RenderProgress,
} from '../remotion/canvasRenderer';
import {
  generateRootTsx,
  generateMainVideoTsx,
  generateSceneRendererTsx,
  generateRemotionConfig,
  generateRemotionPackageJson,
  createRemotionZipProject,
} from '../remotion/codeGenerator';
import { RESOLUTION_PRESETS } from '../remotion/resolutions';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
  onUpdateResolution: (res: VideoResolution) => void;
  onUpdateFps: (fps: 24 | 30 | 60) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateResolution,
  onUpdateFps,
}) => {
  const [activeTab, setActiveTab] = useState<'mp4' | 'code' | 'cli'>('mp4');
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeFile, setActiveCodeFile] = useState<
    'Root.tsx' | 'MainVideo.tsx' | 'SceneRenderer.tsx' | 'package.json' | 'remotion.config.ts'
  >('Root.tsx');

  if (!isOpen) return null;

  const totalFrames = project.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  const handleStartRender = async () => {
    setExportedVideoUrl(null);
    setExportedFilename(null);

    try {
      const result = await renderVideoFile(project, (progress) => {
        setRenderProgress(progress);
      });

      setExportedVideoUrl(result.url);
      setExportedFilename(result.filename);

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Render error:', err);
      setRenderProgress({
        currentFrame: 0,
        totalFrames,
        percent: 0,
        etaSeconds: 0,
        status: 'error',
        error: err.message || 'Gagal merender video',
      });
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await createRemotionZipProject(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'remotion-project';
      a.download = `${safeTitle}-typescript-remotion.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeSnippets: Record<string, string> = {
    'Root.tsx': generateRootTsx(project),
    'MainVideo.tsx': generateMainVideoTsx(project),
    'SceneRenderer.tsx': generateSceneRendererTsx(),
    'package.json': generateRemotionPackageJson(project.title),
    'remotion.config.ts': generateRemotionConfig(),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pusat Ekspor Remotion Video & TypeScript
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih format video siap tayang atau unduh bundel kode Remotion murni
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800 px-6 gap-2 bg-slate-950/20">
          <button
            onClick={() => setActiveTab('mp4')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'mp4'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Render Video MP4 / WebM</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Ekspor Kode TypeScript Remotion</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'cli'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Panduan CLI Render</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: RENDER MP4 */}
          {activeTab === 'mp4' && (
            <div className="space-y-6">
              {/* Settings strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {/* Resolution Picker */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Pilihan Resolusi Ekspor
                  </label>
                  <select
                    value={project.resolution.id}
                    onChange={(e) => {
                      const res = RESOLUTION_PRESETS.find((r) => r.id === e.target.value);
                      if (res) onUpdateResolution(res);
                    }}
                    disabled={renderProgress?.status === 'rendering'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    {RESOLUTION_PRESETS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.width}×{r.height}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Frame Rate */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Target Frame Rate (FPS)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([24, 30, 60] as const).map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => onUpdateFps(rate)}
                        disabled={renderProgress?.status === 'rendering'}
                        className={`py-2 text-xs font-mono font-semibold rounded-lg border transition-all ${
                          project.fps === rate
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {rate} FPS
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rendering Status / Progress Section */}
              {renderProgress && (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-2">
                      {renderProgress.status === 'rendering' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>Sedang Merender Frame...</span>
                        </>
                      ) : renderProgress.status === 'encoding' ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                          <span>Mengemas Video Berkualitas Tinggi...</span>
                        </>
                      ) : renderProgress.status === 'completed' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Render Berhasil Selesai!</span>
                        </>
                      ) : renderProgress.status === 'error' ? (
                        <span className="text-rose-400">Error saat merender</span>
                      ) : (
                        <span>Mempersiapkan...</span>
                      )}
                    </span>

                    <span className="font-mono text-emerald-400 font-bold tabular-nums">
                      {renderProgress.percent}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-150"
                      style={{ width: `${renderProgress.percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      Frame: {renderProgress.currentFrame} / {renderProgress.totalFrames}
                    </span>
                    {renderProgress.status === 'rendering' && (
                      <span>Sisa Waktu: ~{renderProgress.etaSeconds} detik</span>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Export Download & Preview */}
              {exportedVideoUrl && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{exportedFilename}</h4>
                      <p className="text-xs text-slate-300">
                        Siap disimpan ke komputer atau diunggah ke TikTok, Reels, YouTube.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={exportedVideoUrl}
                      download={exportedFilename || 'video.mp4'}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Video MP4</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Render Action Button */}
              {(!renderProgress || renderProgress.status === 'completed' || renderProgress.status === 'error') && (
                <button
                  onClick={handleStartRender}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {renderProgress?.status === 'completed' ? 'Render Ulang Video' : 'Mulai Render Video Sekarang'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT TYPESCRIPT CODE */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* File picker */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  {(
                    [
                      'Root.tsx',
                      'MainVideo.tsx',
                      'SceneRenderer.tsx',
                      'package.json',
                      'remotion.config.ts',
                    ] as const
                  ).map((filename) => (
                    <button
                      key={filename}
                      onClick={() => setActiveCodeFile(filename)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                        activeCodeFile === filename
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {filename}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyCode(codeSnippets[activeCodeFile], activeCodeFile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    {copiedKey === activeCodeFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                  >
                    {isZipping ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengemas ZIP...</span>
                      </>
                    ) : (
                      <>
                        <FileArchive className="w-3.5 h-3.5" />
                        <span>Download ZIP Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[420px]">
                  <code>{codeSnippets[activeCodeFile]}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: CLI GUIDE */}
          {activeTab === 'cli' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Cara Render di Terminal Lokal (Remotion CLI)</span>
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Kode yang dihasilkan studio ini 100% kompatibel dengan Remotion CLI resmi. Anda dapat merender video menggunakan akselerasi GPU lokal Anda.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-300 font-semibold mb-1 block">1. Pasang Dependensi:</span>
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300">
                    <code>npm install</code>
                    <button
                      onClick={() => handleCopyCode('npm install', 'cli-1')}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedKey === 'cli-1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-300 font-semibold mb-1 block">2. Buka Remotion Web Preview:</span>
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300">
                    <code>npx remotion preview</code>
                    <button
                      onClick={() => handleCopyCode('npx remotion preview', 'cli-2')}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedKey === 'cli-2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-slate-300 font-semibold mb-1 block">3. Render ke MP4 Berkualitas Tinggi:</span>
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-slate-300">
                    <code>npx remotion render src/index.ts MainVideo out/video.mp4 --codec=h264</code>
                    <button
                      onClick={() =>
                        handleCopyCode(
                          'npx remotion render src/index.ts MainVideo out/video.mp4 --codec=h264',
                          'cli-3'
                        )
                      }
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedKey === 'cli-3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

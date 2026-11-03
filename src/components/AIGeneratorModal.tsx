import React, { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, Lightbulb } from 'lucide-react';
import { VideoScene, AspectRatioType, TemplateCategory } from '../types/video';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatioType;
  onApplyScenes: (scenes: VideoScene[], videoTitle: string) => void;
}

const TOPIC_SUGGESTIONS = [
  'Iklan Diskon 50% Peluncuran Aplikasi Kopi Lokal Akhir Pekan',
  'Pitching Solusi SaaS: Otomatisasi Video Marketing 10x Lebih Cepat',
  'Quotes Inspirasi & Mindset Sukses untuk Pengusaha Muda',
  'Tutorial 3 Langkah Mudah Menguasai Dasar Remotion & React',
];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  onApplyScenes,
}) => {
  const [topic, setTopic] = useState('');
  const [templateType, setTemplateType] = useState<TemplateCategory>('social');
  const [sceneCount, setSceneCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage('Silakan tuliskan topik atau ide video terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/generate-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          templateType,
          aspectRatio,
          sceneCount,
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal membuat adegan dengan AI');
      }

      const generated = result.data;
      const formattedScenes: VideoScene[] = (generated.scenes || []).map(
        (s: any, idx: number) => ({
          id: `ai-scene-${Date.now()}-${idx}`,
          title: s.title || `Adegan ${idx + 1}`,
          durationInFrames: Number(s.durationInFrames) || 90,
          backgroundType: s.backgroundType === 'solid' ? 'solid' : 'gradient',
          backgroundValue: s.backgroundValue || 'linear-gradient(135deg, #18002e 0%, #4c0054 50%, #7928ca 100%)',
          transition: s.transition || 'slide-up',
          layers: (s.layers || []).map((l: any, lIdx: number) => ({
            id: `ai-layer-${Date.now()}-${idx}-${lIdx}`,
            type: l.type || (lIdx === 0 ? 'title' : 'subtitle'),
            content: l.content || 'Teks Animasi',
            color: l.color || '#FFFFFF',
            fontSize: Number(l.fontSize) || (l.type === 'title' ? 56 : 28),
            fontFamily: l.fontFamily || 'Plus Jakarta Sans',
            animation: l.animation || 'slide-up',
            x: Number(l.x) || 50,
            y: Number(l.y) || (lIdx === 0 ? 45 : 60),
            badgeBgColor: '#6366F1',
            badgeTextColor: '#FFFFFF',
          })),
        })
      );

      if (formattedScenes.length > 0) {
        onApplyScenes(formattedScenes, generated.videoTitle || topic);
        onClose();
      } else {
        throw new Error('Format adegan dari AI kosong, silakan coba lagi.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memanggil Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                AI Script-to-Scenes Generator
              </h3>
              <p className="text-[11px] text-slate-400">
                Otomatisasi pembuatan naskah & susunan scene dengan Gemini AI
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Prompt / Topic input */}
          <div>
            <label className="text-xs font-semibold text-slate-200 mb-1.5 block">
              Topik atau Ide Video
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Contoh: Iklan promo diskon 50% produk hoodie musim hujan untuk konten TikTok..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Contoh Topik Cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTopic(sug)}
                  className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md px-2 py-1 text-left transition-colors truncate max-w-full"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Settings: Template Style & Scene Count */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1.5 block">
                Gaya Template
              </label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as TemplateCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="social">Social Hype (TikTok / Reels)</option>
                <option value="business">Business Pitch & Showcase</option>
                <option value="typography">Kinetic Typography Quotes</option>
                <option value="education">Tutorial & Educational Steps</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-200 mb-1.5 block">
                Jumlah Adegan
              </label>
              <select
                value={sceneCount}
                onChange={(e) => setSceneCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
              >
                <option value={3}>3 Adegan (Cepat · ~8-9 Detik)</option>
                <option value={4}>4 Adegan (Standar · ~12 Detik)</option>
                <option value={5}>5 Adegan (Lengkap · ~15 Detik)</option>
              </select>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <span className="text-[11px] text-slate-400">
            Rasio saat ini: <strong className="text-indigo-400 font-mono">{aspectRatio}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Merancang Video...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Video Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

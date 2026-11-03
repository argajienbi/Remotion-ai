import React, { useState } from 'react';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  Move,
  Sliders,
  PlaySquare,
  Upload,
} from 'lucide-react';
import { VideoScene, SceneLayer, LayerType, AnimationType } from '../types/video';

interface LayerInspectorProps {
  scene: VideoScene;
  sceneIndex: number;
  onUpdateScene: (updated: VideoScene) => void;
}

const GRADIENT_PRESETS = [
  { name: 'Cyber Velvet', val: 'linear-gradient(135deg, #18002e 0%, #4c0054 50%, #7928ca 100%)' },
  { name: 'Corporate Dark', val: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #1E293B 100%)' },
  { name: 'Emerald Horizon', val: 'linear-gradient(135deg, #022C22 0%, #064E3B 50%, #0F172A 100%)' },
  { name: 'Solar Sunset', val: 'linear-gradient(135deg, #7C2D12 0%, #DC2626 50%, #F59E0B 100%)' },
  { name: 'Electric Violet', val: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #3B82F6 100%)' },
  { name: 'Minimal Obsidian', val: 'linear-gradient(180deg, #09090B 0%, #18181B 100%)' },
];

export const LayerInspector: React.FC<LayerInspectorProps> = ({
  scene,
  sceneIndex,
  onUpdateScene,
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'layers'>('layers');
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    scene.layers[0]?.id || ''
  );

  const activeLayer = scene.layers.find((l) => l.id === selectedLayerId) || scene.layers[0];

  const updateActiveLayer = (updates: Partial<SceneLayer>) => {
    if (!activeLayer) return;
    const newLayers = scene.layers.map((l) =>
      l.id === activeLayer.id ? { ...l, ...updates } : l
    );
    onUpdateScene({ ...scene, layers: newLayers });
  };

  const handleAddLayer = (type: LayerType) => {
    const newId = `layer-${Date.now()}`;
    const newLayer: SceneLayer = {
      id: newId,
      type,
      content:
        type === 'title'
          ? 'Judul Baru'
          : type === 'badge'
          ? '🏷️ BADGE PROMO'
          : type === 'subtitle'
          ? 'Keterangan tambahan untuk adegan ini.'
          : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
      color: '#FFFFFF',
      fontSize: type === 'title' ? 54 : type === 'badge' ? 24 : 28,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: type === 'title' ? '800' : '600',
      animation: 'slide-up',
      x: 50,
      y: type === 'badge' ? 32 : type === 'title' ? 46 : 60,
      badgeBgColor: '#6366F1',
      badgeTextColor: '#FFFFFF',
    };

    onUpdateScene({ ...scene, layers: [...scene.layers, newLayer] });
    setSelectedLayerId(newId);
  };

  const handleDeleteLayer = (id: string) => {
    const newLayers = scene.layers.filter((l) => l.id !== id);
    onUpdateScene({ ...scene, layers: newLayers });
    if (selectedLayerId === id && newLayers.length > 0) {
      setSelectedLayerId(newLayers[0].id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateActiveLayer({ content: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateScene({
            ...scene,
            backgroundType: 'image',
            backgroundValue: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 h-full flex flex-col overflow-hidden">
      {/* Inspector Top Tabs */}
      <div className="flex items-center border-b border-slate-800/80 p-2 gap-1 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'layers'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Layer Teks & Visual</span>
        </button>

        <button
          onClick={() => setActiveTab('background')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'background'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-emerald-400" />
          <span>Latar & Warna</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: BACKGROUND INSPECTOR */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                Nama Adegan
              </label>
              <input
                type="text"
                value={scene.title}
                onChange={(e) => onUpdateScene({ ...scene, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Background Type */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-2 block">
                Tipe Background
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['gradient', 'solid', 'image'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdateScene({ ...scene, backgroundType: type })}
                    className={`py-2 text-xs font-medium rounded-lg border capitalize transition-all ${
                      scene.backgroundType === type
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type === 'gradient' ? 'Gradasi' : type === 'solid' ? 'Warna Polos' : 'Gambar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Gradient Presets */}
            {scene.backgroundType === 'gradient' && (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-2 block">
                  Pilihan Palet Gradasi Estetis
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => onUpdateScene({ ...scene, backgroundValue: p.val })}
                      className={`h-14 rounded-lg p-2 text-left flex flex-col justify-end text-[11px] font-bold text-white relative overflow-hidden border transition-all ${
                        scene.backgroundValue === p.val
                          ? 'border-indigo-400 ring-2 ring-indigo-500/30'
                          : 'border-slate-700/60 hover:border-slate-500'
                      }`}
                      style={{ background: p.val }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="relative z-10 drop-shadow-md">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Solid Color Picker */}
            {scene.backgroundType === 'solid' && (
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                  Pilih Warna Latar
                </label>
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <input
                    type="color"
                    value={scene.backgroundValue.startsWith('#') ? scene.backgroundValue : '#0F172A'}
                    onChange={(e) => onUpdateScene({ ...scene, backgroundValue: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={scene.backgroundValue}
                    onChange={(e) => onUpdateScene({ ...scene, backgroundValue: e.target.value })}
                    className="flex-1 bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Image Background */}
            {scene.backgroundType === 'image' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Unggah Gambar Latar
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 cursor-pointer bg-slate-950/60 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Klik untuk Unggah Gambar</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <span className="text-[11px] text-slate-400 mb-1 block">Atau masukkan URL gambar:</span>
                  <input
                    type="text"
                    value={scene.backgroundValue}
                    onChange={(e) => onUpdateScene({ ...scene, backgroundValue: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LAYERS INSPECTOR */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            {/* Layer List Chips & Add Layer button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">
                  Daftar Lapisan Adegan {sceneIndex + 1}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddLayer('title')}
                    className="px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                    title="Tambah Judul"
                  >
                    + Judul
                  </button>
                  <button
                    onClick={() => handleAddLayer('badge')}
                    className="px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                    title="Tambah Badge"
                  >
                    + Badge
                  </button>
                  <button
                    onClick={() => handleAddLayer('subtitle')}
                    className="px-2 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
                    title="Tambah Subteks"
                  >
                    + Subteks
                  </button>
                </div>
              </div>

              {/* Layer Selection Pill Strip */}
              <div className="flex flex-col gap-1.5">
                {scene.layers.map((layer, lIdx) => {
                  const isSel = layer.id === (activeLayer?.id || '');
                  return (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-slate-800/90 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-slate-500">
                          #{lIdx + 1}
                        </span>
                        <span className="capitalize font-semibold text-indigo-300 text-[11px]">
                          [{layer.type}]
                        </span>
                        <span className="truncate max-w-[140px] text-slate-200">
                          {layer.content}
                        </span>
                      </div>

                      {scene.layers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLayer(layer.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Hapus Layer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Layer Editor */}
            {activeLayer && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                {/* Content text */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">
                    Teks / Konten Layer
                  </label>
                  {activeLayer.type === 'image' ? (
                    <div className="space-y-2">
                      <label className="flex items-center justify-center p-3 border border-dashed border-slate-700 hover:border-indigo-500 rounded-lg cursor-pointer bg-slate-950 text-xs text-slate-300">
                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Ganti Gambar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={activeLayer.content}
                        onChange={(e) => updateActiveLayer({ content: e.target.value })}
                        placeholder="URL Gambar"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <textarea
                      rows={2}
                      value={activeLayer.content}
                      onChange={(e) => updateActiveLayer({ content: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>

                {/* Animation Type */}
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Animasi Remotion Masuk</span>
                  </label>
                  <select
                    value={activeLayer.animation}
                    onChange={(e) =>
                      updateActiveLayer({ animation: e.target.value as AnimationType })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="pop-spring">Pop Spring (Pegas Pantul Dinamis)</option>
                    <option value="kinetic-whip">Kinetic Whip (Rotasi Cepat)</option>
                    <option value="slide-up">Slide Up (Geser dari Bawah)</option>
                    <option value="slide-left">Slide Left (Geser dari Kanan)</option>
                    <option value="zoom-in">Zoom In (Memperbesar Skala)</option>
                    <option value="fade">Smooth Fade (Pudar Lembut)</option>
                  </select>
                </div>

                {/* Typography Settings (if text) */}
                {activeLayer.type !== 'image' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">
                        Font Family
                      </label>
                      <select
                        value={activeLayer.fontFamily || 'Plus Jakarta Sans'}
                        onChange={(e) => updateActiveLayer({ fontFamily: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                        <option value="Outfit">Outfit (Display Bold)</option>
                        <option value="JetBrains Mono">JetBrains Mono</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">
                        Ukuran Font ({activeLayer.fontSize || 32}px)
                      </label>
                      <input
                        type="range"
                        min={16}
                        max={90}
                        value={activeLayer.fontSize || 32}
                        onChange={(e) =>
                          updateActiveLayer({ fontSize: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Badge Specific Colors */}
                {activeLayer.type === 'badge' && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <label className="text-[10px] text-slate-400 mb-1 block">
                        Warna Background Badge
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeLayer.badgeBgColor || '#3B82F6'}
                          onChange={(e) =>
                            updateActiveLayer({ badgeBgColor: e.target.value })
                          }
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-300">
                          {activeLayer.badgeBgColor || '#3B82F6'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 mb-1 block">
                        Warna Teks Badge
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={activeLayer.badgeTextColor || '#FFFFFF'}
                          onChange={(e) =>
                            updateActiveLayer({ badgeTextColor: e.target.value })
                          }
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-xs font-mono text-slate-300">
                          {activeLayer.badgeTextColor || '#FFFFFF'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Color for regular text */}
                {activeLayer.type !== 'badge' && activeLayer.type !== 'image' && (
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">
                      Warna Teks
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <input
                        type="color"
                        value={activeLayer.color || '#FFFFFF'}
                        onChange={(e) => updateActiveLayer({ color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-300">
                        {activeLayer.color || '#FFFFFF'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Position X and Y Sliders */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-slate-400" />
                      <span>Posisi Elemen Layar</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      X: {activeLayer.x}% · Y: {activeLayer.y}%
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Horisontal (X)</span>
                        <span>{activeLayer.x}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={90}
                        value={activeLayer.x}
                        onChange={(e) =>
                          updateActiveLayer({ x: Number(e.target.value) })
                        }
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                        <span>Vertikal (Y)</span>
                        <span>{activeLayer.y}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={90}
                        value={activeLayer.y}
                        onChange={(e) =>
                          updateActiveLayer({ y: Number(e.target.value) })
                        }
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

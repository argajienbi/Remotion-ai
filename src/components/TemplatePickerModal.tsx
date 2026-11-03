import React from 'react';
import { X, Check, LayoutTemplate, Smartphone, Monitor, Tablet } from 'lucide-react';
import { TEMPLATE_PRESETS } from '../remotion/templates';
import { TemplatePreset } from '../types/video';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplatePreset) => void;
  currentTemplateId: string;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <LayoutTemplate className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pilih Template Video Remotion
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih fondasi motion graphics terkurasi yang dapat disesuaikan sepenuhnya
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

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATE_PRESETS.map((template) => {
            const isSelected = template.id === currentTemplateId;

            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div>
                  {/* Swatch Banner */}
                  <div
                    className="h-28 rounded-lg mb-3 flex flex-col justify-between p-3 relative overflow-hidden shadow-inner border border-slate-700/60"
                    style={{ background: template.thumbnailGradient }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white">
                        {template.defaultAspectRatio === '9:16' ? (
                          <Smartphone className="w-3 h-3 text-pink-400" />
                        ) : template.defaultAspectRatio === '1:1' || template.defaultAspectRatio === '4:3' ? (
                          <Tablet className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Monitor className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{template.defaultAspectRatio}</span>
                      </span>

                      {isSelected && (
                        <span className="bg-indigo-600 text-white rounded-full p-1 shadow">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 text-white font-bold text-sm drop-shadow-md">
                      {template.name}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 mb-1">
                    {template.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-500 font-mono">
                    {template.scenes.length} Adegan Terbawa
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? 'Sedang Digunakan' : 'Gunakan Template'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

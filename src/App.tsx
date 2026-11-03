import React, { useState } from 'react';
import { VideoProject, VideoScene, VideoResolution, TemplatePreset, TransitionType } from './types/video';
import { TEMPLATE_PRESETS } from './remotion/templates';
import { DEFAULT_RESOLUTION, RESOLUTION_PRESETS } from './remotion/resolutions';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { SceneBuilder } from './components/SceneBuilder';
import { LayerInspector } from './components/LayerInspector';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const initialTemplate = TEMPLATE_PRESETS[0];

  const [project, setProject] = useState<VideoProject>({
    title: initialTemplate.name,
    fps: initialTemplate.defaultFps,
    resolution: DEFAULT_RESOLUTION,
    scenes: JSON.parse(JSON.stringify(initialTemplate.scenes)),
  });

  const [currentTemplateId, setCurrentTemplateId] = useState<string>(initialTemplate.id);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync active scene index based on currentFrame
  const findSceneIndexAtFrame = (frame: number): number => {
    let accumulated = 0;
    for (let i = 0; i < project.scenes.length; i++) {
      if (frame < accumulated + project.scenes[i].durationInFrames) {
        return i;
      }
      accumulated += project.scenes[i].durationInFrames;
    }
    return Math.max(0, project.scenes.length - 1);
  };

  const handleFrameChange = (frameOrUpdater: number | ((prev: number) => number)) => {
    setCurrentFrame((prev) => {
      const nextFrame = typeof frameOrUpdater === 'function' ? frameOrUpdater(prev) : frameOrUpdater;
      const sceneIdx = findSceneIndexAtFrame(nextFrame);
      if (sceneIdx !== activeSceneIndex) {
        setActiveSceneIndex(sceneIdx);
      }
      return nextFrame;
    });
  };

  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    // Jump frame to the beginning of this scene
    let startFrame = 0;
    for (let i = 0; i < index; i++) {
      startFrame += project.scenes[i].durationInFrames;
    }
    setCurrentFrame(startFrame);
  };

  const handleAddScene = () => {
    const newScene: VideoScene = {
      id: `scene-${Date.now()}`,
      title: `Adegan ${project.scenes.length + 1}`,
      durationInFrames: 90,
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #18002e 0%, #4c0054 50%, #7928ca 100%)',
      transition: 'slide-up',
      layers: [
        {
          id: `l-title-${Date.now()}`,
          type: 'title',
          content: 'Pesan Utama Baru',
          color: '#FFFFFF',
          fontSize: 54,
          fontFamily: 'Outfit',
          fontWeight: '800',
          animation: 'kinetic-whip',
          x: 50,
          y: 44,
        },
        {
          id: `l-sub-${Date.now()}`,
          type: 'subtitle',
          content: 'Jelaskan poin penting Anda di sini.',
          color: '#E2E8F0',
          fontSize: 28,
          fontFamily: 'Plus Jakarta Sans',
          animation: 'slide-up',
          x: 50,
          y: 58,
        },
      ],
    };

    const newScenes = [...project.scenes, newScene];
    setProject((prev) => ({ ...prev, scenes: newScenes }));
    handleSelectScene(newScenes.length - 1);
  };

  const handleDuplicateScene = (index: number) => {
    const source = project.scenes[index];
    const duplicated: VideoScene = {
      ...JSON.parse(JSON.stringify(source)),
      id: `scene-dup-${Date.now()}`,
      title: `${source.title} (Salinan)`,
    };
    const newScenes = [...project.scenes];
    newScenes.splice(index + 1, 0, duplicated);
    setProject((prev) => ({ ...prev, scenes: newScenes }));
    handleSelectScene(index + 1);
  };

  const handleDeleteScene = (index: number) => {
    if (project.scenes.length <= 1) return;
    const newScenes = project.scenes.filter((_, i) => i !== index);
    setProject((prev) => ({ ...prev, scenes: newScenes }));
    const nextIndex = Math.min(activeSceneIndex, newScenes.length - 1);
    handleSelectScene(nextIndex);
  };

  const handleMoveScene = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const newScenes = [...project.scenes];
    const [moved] = newScenes.splice(index, 1);
    newScenes.splice(targetIndex, 0, moved);
    setProject((prev) => ({ ...prev, scenes: newScenes }));
    handleSelectScene(targetIndex);
  };

  const handleUpdateSceneDuration = (index: number, durationInFrames: number) => {
    const newScenes = project.scenes.map((s, i) =>
      i === index ? { ...s, durationInFrames } : s
    );
    setProject((prev) => ({ ...prev, scenes: newScenes }));
  };

  const handleUpdateSceneTransition = (index: number, transition: TransitionType) => {
    const newScenes = project.scenes.map((s, i) =>
      i === index ? { ...s, transition } : s
    );
    setProject((prev) => ({ ...prev, scenes: newScenes }));
  };

  const handleUpdateActiveScene = (updated: VideoScene) => {
    const newScenes = project.scenes.map((s, i) =>
      i === activeSceneIndex ? updated : s
    );
    setProject((prev) => ({ ...prev, scenes: newScenes }));
  };

  const handleSelectResolution = (res: VideoResolution) => {
    setProject((prev) => ({ ...prev, resolution: res }));
  };

  const handleChangeFps = (fps: 24 | 30 | 60) => {
    setProject((prev) => ({ ...prev, fps }));
  };

  const handleApplyTemplate = (template: TemplatePreset) => {
    setCurrentTemplateId(template.id);
    const matchedRes =
      RESOLUTION_PRESETS.find((r) => r.aspectRatio === template.defaultAspectRatio) ||
      DEFAULT_RESOLUTION;

    setProject({
      title: template.name,
      fps: template.defaultFps,
      resolution: matchedRes,
      scenes: JSON.parse(JSON.stringify(template.scenes)),
    });
    setActiveSceneIndex(0);
    setCurrentFrame(0);
  };

  const handleApplyAIScenes = (scenes: VideoScene[], videoTitle: string) => {
    setProject((prev) => ({
      ...prev,
      title: videoTitle,
      scenes,
    }));
    setActiveSceneIndex(0);
    setCurrentFrame(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentResolution={project.resolution}
        onSelectResolution={handleSelectResolution}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        fps={project.fps}
        onChangeFps={handleChangeFps}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex flex-col p-4 md:p-6 gap-5 max-w-[1720px] w-full mx-auto">
        {/* Workspace Mid Split: Viewport Canvas on Left, Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Video Player (Canvas) */}
          <div className="lg:col-span-8 flex flex-col">
            <VideoPlayer
              project={project}
              currentFrame={currentFrame}
              onFrameChange={handleFrameChange}
              activeSceneIndex={activeSceneIndex}
            />
          </div>

          {/* Layer & Scene Inspector */}
          <div className="lg:col-span-4 flex flex-col min-h-[460px]">
            {project.scenes[activeSceneIndex] && (
              <LayerInspector
                scene={project.scenes[activeSceneIndex]}
                sceneIndex={activeSceneIndex}
                onUpdateScene={handleUpdateActiveScene}
              />
            )}
          </div>
        </div>

        {/* Workspace Bottom: Scene Builder Strip */}
        <div className="w-full">
          <SceneBuilder
            scenes={project.scenes}
            activeSceneIndex={activeSceneIndex}
            onSelectScene={handleSelectScene}
            onAddScene={handleAddScene}
            onDuplicateScene={handleDuplicateScene}
            onDeleteScene={handleDeleteScene}
            onMoveScene={handleMoveScene}
            onUpdateSceneDuration={handleUpdateSceneDuration}
            onUpdateSceneTransition={handleUpdateSceneTransition}
            fps={project.fps}
          />
        </div>
      </main>

      {/* Modals */}
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        aspectRatio={project.resolution.aspectRatio}
        onApplyScenes={handleApplyAIScenes}
      />

      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        currentTemplateId={currentTemplateId}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        onUpdateResolution={handleSelectResolution}
        onUpdateFps={handleChangeFps}
      />
    </div>
  );
}

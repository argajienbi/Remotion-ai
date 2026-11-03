import JSZip from 'jszip';
import { VideoProject } from '../types/video';

export function generateRootTsx(project: VideoProject): string {
  const totalFrames = project.scenes.reduce((sum, s) => sum + s.durationInFrames, 0);

  return `import React from 'react';
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={${totalFrames}}
        fps={${project.fps}}
        width={${project.resolution.width}}
        height={${project.resolution.height}}
        defaultProps={{
          title: "${project.title.replace(/"/g, '\\"')}",
        }}
      />
    </>
  );
};
`;
}

export function generateMainVideoTsx(project: VideoProject): string {
  return `import React from 'react';
import { Series } from 'remotion';
import { SceneRenderer } from './SceneRenderer';

export const videoScenes = ${JSON.stringify(project.scenes, null, 2)};

export const MainVideo: React.FC<{ title?: string }> = () => {
  return (
    <div style={{ flex: 1, backgroundColor: '#000000', width: '100%', height: '100%' }}>
      <Series>
        {videoScenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <SceneRenderer scene={scene} />
          </Series.Sequence>
        ))}
      </Series>
    </div>
  );
};
`;
}

export function generateSceneRendererTsx(): string {
  return `import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export interface SceneLayer {
  id: string;
  type: 'title' | 'subtitle' | 'badge' | 'image' | 'shape';
  content: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  animation: 'pop-spring' | 'slide-up' | 'slide-left' | 'zoom-in' | 'kinetic-whip' | 'fade';
  x: number;
  y: number;
  badgeBgColor?: string;
  badgeTextColor?: string;
}

export interface VideoScene {
  id: string;
  title: string;
  durationInFrames: number;
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundValue: string;
  transition: string;
  layers: SceneLayer[];
}

export const SceneRenderer: React.FC<{ scene: VideoScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background style
  const bgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(scene.backgroundType === 'gradient'
      ? { background: scene.backgroundValue }
      : scene.backgroundType === 'image'
      ? { backgroundImage: \`url(\${scene.backgroundValue})\`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: scene.backgroundValue }),
  };

  return (
    <div style={bgStyle}>
      {scene.layers.map((layer, idx) => {
        const delay = idx * 6;
        const localFrame = Math.max(0, frame - delay);

        let transform = 'translate(-50%, -50%)';
        let opacity = 1;

        if (layer.animation === 'pop-spring') {
          const spr = spring({ frame: localFrame, fps, config: { damping: 12, mass: 0.8, stiffness: 120 } });
          transform = \`translate(-50%, -50%) scale(\${spr})\`;
          opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
        } else if (layer.animation === 'slide-up') {
          const yOffset = interpolate(localFrame, [0, 18], [120, 0], { extrapolateRight: 'clamp' });
          transform = \`translate(-50%, calc(-50% + \${yOffset}px))\`;
          opacity = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
        } else if (layer.animation === 'slide-left') {
          const xOffset = interpolate(localFrame, [0, 18], [150, 0], { extrapolateRight: 'clamp' });
          transform = \`translate(calc(-50% + \${xOffset}px), -50%)\`;
          opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
        } else if (layer.animation === 'zoom-in') {
          const scale = interpolate(localFrame, [0, 24], [0.4, 1], { extrapolateRight: 'clamp' });
          transform = \`translate(-50%, -50%) scale(\${scale})\`;
          opacity = interpolate(localFrame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
        } else if (layer.animation === 'kinetic-whip') {
          const spr = spring({ frame: localFrame, fps, config: { damping: 8, mass: 0.5, stiffness: 180 } });
          const rotate = interpolate(localFrame, [0, 20], [-8, 0], { extrapolateRight: 'clamp' });
          transform = \`translate(-50%, -50%) scale(\${spr}) rotate(\${rotate}deg)\`;
          opacity = interpolate(localFrame, [0, 6], [0, 1], { extrapolateRight: 'clamp' });
        } else {
          // fade
          opacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
        }

        const left = \`\${layer.x}%\`;
        const top = \`\${layer.y}%\`;
        const baseFontSize = layer.fontSize || (layer.type === 'title' ? 56 : 28);
        // Scale font proportionally to 1080p width baseline
        const responsiveFontSize = Math.round((baseFontSize * width) / 1080);

        if (layer.type === 'badge') {
          return (
            <div
              key={layer.id}
              style={{
                position: 'absolute',
                left,
                top,
                transform,
                opacity,
                backgroundColor: layer.badgeBgColor || '#3B82F6',
                color: layer.badgeTextColor || '#FFFFFF',
                padding: '8px 24px',
                borderRadius: '9999px',
                fontSize: responsiveFontSize,
                fontWeight: 700,
                fontFamily: layer.fontFamily || 'Plus Jakarta Sans',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {layer.content}
            </div>
          );
        }

        if (layer.type === 'image') {
          return (
            <div
              key={layer.id}
              style={{
                position: 'absolute',
                left,
                top,
                transform,
                opacity,
                maxWidth: '80%',
                maxHeight: '60%',
              }}
            >
              <img
                src={layer.content}
                alt="Scene visual"
                style={{ width: '100%', height: 'auto', borderRadius: '16px', objectFit: 'cover' }}
              />
            </div>
          );
        }

        return (
          <div
            key={layer.id}
            style={{
              position: 'absolute',
              left,
              top,
              transform,
              opacity,
              color: layer.color || '#FFFFFF',
              fontSize: responsiveFontSize,
              fontWeight: layer.fontWeight || (layer.type === 'title' ? 800 : 500),
              fontFamily: layer.fontFamily || 'Plus Jakarta Sans',
              textAlign: 'center',
              width: '85%',
              lineHeight: 1.2,
              textShadow: '0 4px 18px rgba(0,0,0,0.5)',
            }}
          >
            {layer.content}
          </div>
        );
      })}
    </div>
  );
};
`;
}

export function generateRemotionConfig(): string {
  return `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
`;
}

export function generateRemotionPackageJson(projectTitle: string): string {
  return JSON.stringify(
    {
      name: projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'remotion-video-studio',
      version: '1.0.0',
      private: true,
      scripts: {
        start: 'remotion preview src/index.ts',
        build: 'remotion render src/index.ts MainVideo out/video.mp4',
        preview: 'remotion preview src/index.ts',
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        remotion: '^4.0.0',
      },
      devDependencies: {
        '@remotion/cli': '^4.0.0',
        '@types/react': '^18.2.0',
        typescript: '^5.0.0',
      },
    },
    null,
    2
  );
}

export function generateIndexTs(): string {
  return `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
`;
}

export async function createRemotionZipProject(project: VideoProject): Promise<Blob> {
  const zip = new JSZip();

  zip.file('package.json', generateRemotionPackageJson(project.title));
  zip.file('remotion.config.ts', generateRemotionConfig());
  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'commonjs',
          lib: ['dom', 'es2022'],
          jsx: 'react-jsx',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        },
      },
      null,
      2
    )
  );

  const src = zip.folder('src');
  if (src) {
    src.file('index.ts', generateIndexTs());
    src.file('Root.tsx', generateRootTsx(project));
    src.file('MainVideo.tsx', generateMainVideoTsx(project));
    src.file('SceneRenderer.tsx', generateSceneRendererTsx());
  }

  zip.file(
    'README.md',
    `# ${project.title} - Remotion Video Project

Proyek video yang dibuat otomatis menggunakan Remotion Video Studio.

## Cara Menjalankan di Komputer Lokal

1. Pasang dependensi:
\`\`\`bash
npm install
\`\`\`

2. Buka Remotion Player Preview:
\`\`\`bash
npm start
# atau
npx remotion preview
\`\`\`

3. Render Video MP4 Berkualitas Tinggi:
\`\`\`bash
npm run build
# atau
npx remotion render src/index.ts MainVideo out/video.mp4 --codec=h264
\`\`\`
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

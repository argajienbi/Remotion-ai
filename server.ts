import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint to generate video scenes from AI topic / script
app.post('/api/gemini/generate-scenes', async (req, res) => {
  try {
    const {
      topic = 'Promo Produk Spesial',
      templateType = 'social',
      aspectRatio = '9:16',
      sceneCount = 4,
    } = req.body;

    const systemInstruction = `Anda adalah Video Director & Remotion Motion Graphics Designer profesional.
Tugas Anda adalah merancang naskah video dan susunan scene (adegan) otomatis untuk video Remotion.
Setiap adegan memiliki durasi dalam frame (standar 30fps: 75-120 frames per adegan), background (gradient warna estetis modern), transisi, dan layer teks/badge visual.
Konten harus memikat, bernada persuasi tinggi, singkat, dan tepat untuk rasio layar ${aspectRatio} dalam tema ${templateType}.
Pastikan layer teks terbagi menjadi headline/title yang kuat, subtitle penjelasan singkat, dan badge promo/CTA.
Warna teks harus kontras dengan background.
Gunakan animasi bervariasi: 'pop-spring', 'slide-up', 'kinetic-whip', 'fade', atau 'zoom-in'.`;

    const prompt = `Buatkan ${sceneCount} adegan video berurutan untuk topik: "${topic}".
Template gaya: ${templateType}.
Rasio aspect ratio: ${aspectRatio}.
Sertakan teks judul yang catchy, subjudul informatif, serta badge penegas/call-to-action pada tiap adegan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            videoTitle: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  durationInFrames: { type: Type.INTEGER },
                  backgroundType: { type: Type.STRING },
                  backgroundValue: { type: Type.STRING },
                  transition: { type: Type.STRING },
                  layers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        type: { type: Type.STRING },
                        content: { type: Type.STRING },
                        color: { type: Type.STRING },
                        fontSize: { type: Type.INTEGER },
                        fontFamily: { type: Type.STRING },
                        animation: { type: Type.STRING },
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER },
                      },
                      required: ['type', 'content', 'animation', 'x', 'y'],
                    },
                  },
                },
                required: ['title', 'durationInFrames', 'backgroundType', 'backgroundValue', 'transition', 'layers'],
              },
            },
          },
          required: ['videoTitle', 'scenes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating scenes with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Gagal memproses naskah dengan Gemini AI',
    });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();

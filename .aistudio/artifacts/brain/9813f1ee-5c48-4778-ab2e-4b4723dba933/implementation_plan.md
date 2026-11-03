# Remotion Video Studio — Generator Video Otomatis & Template Scene Builder

Studio video generatif komprehensif berbasis arsitektur Remotion (React + TypeScript) yang mengubah teks dan aset visual menjadi video berkualitas tinggi secara otomatis dengan template motion-graphic modern, scene builder multi-layer, fleksibilitas rasio layar (HP/Mobile 9:16, Tablet 1:1 & 4:3, Desktop 16:9), AI script-to-scenes, dan ekspor langsung MP4 serta proyek kode Remotion TypeScript.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan preferensi yang telah Anda pilih pada sesi klarifikasi, seluruh spesifikasi berikut telah dirancang untuk segera dieksekusi:

- **Kategori Template Lengkap**: Menyertakan 4 template terkurasi: *Social Media & Reels/TikTok*, *Business Showcase & Product Pitch*, *Dynamic Typography & Kinetic Quotes*, dan *Educational / Tutorial Explainer*.
- **Pilihan Ekspor Terpadu (Tiga Mode)**:
  1. *Render MP4 Langsung*: Perekaman frame-akurat di browser via Canvas & WebCodecs/MediaRecorder dengan preset bitrate tinggi (Full HD 1080p).
  2. *Ekspor Proyek TypeScript Remotion*: Unduh bundel kode zip/file `.tsx` (`Root.tsx`, `Composition.tsx`, `Scene.tsx`, `remotion.config.ts`, `package.json`) yang 100% kompatibel dengan CLI `npx remotion render`.
  3. *Simulasi Pipeline Render Server*: Monitoring alur render frame-by-frame dengan log ekspor profesional.
- **AI Script-to-Scenes Generator**: Integrasi Gemini 3.8 Flash di server Express proxy (`/api/gemini/generate-scenes`) yang menerima ide/naskah singkat dan otomatis memecahnya menjadi scene-scene terstruktur lengkap dengan transisi, durasi, timing, dan aset visual pendukung.

---

## 1. Overview & Core Concept

- **Fungsi Utama**: Memungkinkan konten kreator, pemasar, dan developer menghasilkan video animasi dinamis tanpa software editing yang rumit. Pengguna dapat memilih template, mengetik ide atau naskah, memanfaatkan Gemini AI untuk mengotomatisasi pemotongan scene, menyesuaikan layer teks & gambar di visual scene builder, lalu mengekspornya menjadi video MP4 berkualitas tinggi atau kode Remotion TypeScript.
- **Target Pengguna**: Video editor, social media manager, programmer front-end yang ingin mengotomatisasi video pipeline, serta pemilik bisnis yang membutuhkan aset video promosi cepat dan konsisten.
- **Nilai Unggulan**:
  - Paradigma kode nyata Remotion: Animasi berbasis frame matematis yang deterministik (`spring`, `interpolate`, `useCurrentFrame`, `useVideoConfig`).
  - Responsivitas aspect ratio: Pergantian instan antara format Mobile (9:16 Reels/TikTok/Shorts), Tablet (1:1 Feed & 4:3 Carousel), dan Desktop (16:9 YouTube/Landscape).
  - Scene builder interaktif: Reorder scene, atur durasi detik/frame, kustomisasi tipografi, warna brand, dan transisi (fade, slide, zoom, kinetic whip).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Preset & Aspect Ratio Selection**: Pengguna memilih rasio tampilan video:
   - **HP / Mobile (9:16)**: $1080 \times 1920$ px untuk TikTok, Instagram Reels, YouTube Shorts.
   - **Tablet / Square (1:1 & 4:3)**: $1080 \times 1080$ px atau $1440 \times 1080$ px untuk Instagram Post & LinkedIn.
   - **Desktop / Landscape (16:9)**: $1920 \times 1080$ px untuk YouTube Video, presentasi pitch, dan TV display.
   - Pengguna juga dapat mengatur frame rate ($24$, $30$, atau $60$ FPS) dan durasi total.
2. **Template & AI Script Generator**:
   - Memilih template: *Social Hype Promo*, *Corporate Showreel*, *Kinetic Typography*, atau *Explainer Steps*.
   - Mengisi prompt ide video (misal: "Iklan diskon 50% peluncuran aplikasi kopi lokal") lalu klik **Generate Scenes with AI**.
   - AI menghasilkan 3–5 scene otomatis dengan naskah pembuka, poin utama, CTA, saran warna, dan tata letak gambar.
3. **Scene Builder & Layer Customizer**:
   - Timeline scene horizontal di bagian bawah: drag/click scene untuk preview.
   - Layer editor di sisi kanan: kustomisasi judul, subteks, badge promo, upload/ganti gambar latar atau stiker visual, posisi elemen, dan tipe animasi masuk/keluar.
   - Canvas preview interaktif di tengah dengan playback controls (Play, Pause, Scrubbing bar, Frame indicator, Loop, Fullscreen).
4. **Export & TypeScript Code Generator**:
   - Modal ekspor dengan tab:
     - **Export MP4**: Perekaman canvas frame-by-frame dengan progress bar persentase dan estimasi waktu selesai. Tombol download video MP4 seketika.
     - **Export Remotion Code**: Code viewer sintaksis TypeScript yang bersih dan terdokumentasi, lengkap dengan tombol *Copy Code* dan *Download Project (.ts / .tsx)*.

### Visual Identity & Theme

- **Aesthetic Direction**: *Dark Studio Pro* — terinspirasi dari tool kreatif profesional (DaVinci Resolve, Figma, After Effects) dengan kontras tinggi, garis hairline presisi, dan visual canvas yang fokus.
- **Color Palette**:
  - Background kanvas kerja: Slate pekat `#090D16` / `#0F172A`
  - Structural Panels & Timeline: Slate gelap `#1E293B` dengan hairline border `#334155`
  - Accent Actions (Render & Record): Indigo/Violet elektrik `#6366F1` & Emerald vibrant `#10B981`
  - Text: Putih bersih `#F8FAFC` untuk headline, Slate halus `#94A3B8` untuk parameter dan metadata
- **Typography & Hierarchy**:
  - Display Font: `Plus Jakarta Sans` untuk judul UI dan panel kontrol.
  - Scene Video Typography: Pilihan font yang dapat disesuaikan per scene (`Plus Jakarta Sans`, `Outfit`, `Bricolage Grotesque`, `DM Sans`, dan `Space Mono`).
  - Telemetry & Timeline: `font-mono tabular-nums` untuk timecode (`00:04:15`), frame counter, dan resolusi dimensi.

---

## 3. Key Product Decisions & Trade-Offs

- **Remotion Deterministic Canvas Simulation di Browser**:
  - *Keputusan*: Membangun engine animasi internal yang mengimplementasikan API matematika Remotion (`interpolate`, `spring`, `useCurrentFrame`, `useVideoConfig`) dengan rendering SVG + Canvas 2D frame-by-frame.
  - *Alasan*: Memungkinkan render video MP4 100% instan di browser tanpa ketergantungan headless browser Chromium server yang berat, sembari menghasilkan kode TypeScript yang identik dan valid untuk ekspor Remotion CLI.
- **Client-Side MP4 WebCodecs & MediaRecorder Rendering**:
  - *Keputusan*: Canvas renderer merekam animasi per frame dengan waktu virtual (non-realtime capture) untuk mencegah frame dropping, lalu mengemasnya menjadi video MP4 dengan bitrate tinggi.
  - *Alasan*: Hasil ekspor halus dan berkualitas tajam tanpa stutter meskipun di komputer dengan spesifikasi terbatas.
- **Server Proxy Express untuk Gemini AI**:
  - *Keputusan*: Menggunakan Express server pada port 3000 dengan endpoint `/api/gemini/generate-scenes` menggunakan `@google/genai` dengan model resmi `gemini-3.8-flash`.
  - *Alasan*: Menjaga keamanan API key sesuai instruksi lingkungan AI Studio, sekaligus menghasilkan struktur data scene JSON terformat rapi (`responseSchema`).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Remotion Video Studio                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼───────────────────────────┐
       ▼                            ▼                           ▼
┌──────────────┐          ┌────────────────────┐      ┌──────────────────┐
│ Top Bar &    │          │  Video Viewport    │      │ Inspector Panel  │
│ Resolutions  │          │  (Canvas Preview)  │      │ (Scene Layers &  │
│ (9:16/1:1/   │          │  - Remotion Math   │      │  Styles)         │
│  4:3/16:9)   │          │  - Scrubber/Play   │      │ - Text, Images   │
│  FPS / Dur   │          │  - High-res Scale  │      │ - Transitions    │
└──────┬───────┘          └─────────┬──────────┘      └────────┬─────────┘
       │                            │                          │
       │                  ┌─────────┴──────────┐               │
       └─────────────────►│ Global Video State ├───────────────┘
                          │ (Scenes, Timeline) │
                          └─────────┬──────────┘
                                    │
       ┌────────────────────────────┴───────────────────────────┐
       ▼                                                        ▼
┌──────────────────────────────┐              ┌───────────────────────────┐
│ Gemini AI Script-to-Scenes   │              │ Export Manager Pipeline   │
│ Express API (/api/gemini/...) │              │ 1. Client WebCodecs MP4   │
│ Model: gemini-3.8-flash      │              │ 2. Remotion TSX Project   │
└──────────────────────────────┘              └───────────────────────────┘
```

### Data Structures

```typescript
export type AspectRatioType = '9:16' | '1:1' | '4:3' | '16:9';

export interface VideoResolution {
  name: string;
  category: 'mobile' | 'tablet' | 'desktop';
  aspectRatio: AspectRatioType;
  width: number;
  height: number;
  label: string;
}

export interface SceneLayer {
  id: string;
  type: 'title' | 'subtitle' | 'badge' | 'image' | 'shape';
  content: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  animation: 'fade' | 'slide-up' | 'pop-spring' | 'kinetic-whip' | 'zoom-in';
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  scale?: number;
  opacity?: number;
}

export interface VideoScene {
  id: string;
  title: string;
  durationInFrames: number; // e.g. 90 frames = 3s at 30fps
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundValue: string; // color or image URL
  transition: 'none' | 'fade' | 'slide' | 'wipe';
  layers: SceneLayer[];
}

export interface VideoProject {
  title: string;
  fps: number; // 24, 30, 60
  resolution: VideoResolution;
  scenes: VideoScene[];
}
```

### Server Architecture

- `server.ts`:
  - Express server meng-host aplikasi Vite dan API endpoint `/api/gemini/generate-scenes`.
  - Menggunakan SDK `@google/genai` dengan model `gemini-3.8-flash`, menyertakan header `User-Agent: 'aistudio-build'`.
  - Endpoint mengembalikan array scene terstruktur siap konsumsi oleh studio visual.

---

## 5. Verification & Delivery Plan

1. **Setup Server & Dependencies**:
   - Pastikan Express, `@google/genai`, Lucide icons, JSZip (untuk unduh proyek zip) berjalan mulus.
2. **Template Pre-seeding**:
   - Sediakan preset default siap uji coba untuk tiap kategori: Ads Promo 9:16, Business Pitch 16:9, Typography Quote 1:1, Educational 16:9.
3. **Canvas & Export Engine Test**:
   - Verifikasi playback frame-akurat di berbagai resolusi layar.
   - Uji ekspor file MP4 dan cek konsistensi kode `.tsx` yang di-generate.
4. **Compilation & Build**:
   - Jalankan `compile_applet` untuk memastikan TypeScript bebas error dan zero compilation warnings.

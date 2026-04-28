/**
 * Video service layer.
 *
 * This file is an abstraction boundary. Today it returns mocked data stored in
 * localStorage. Tomorrow you can swap the implementation with calls to a real
 * backend (Cloudinary, Shotstack, or a custom FFmpeg service) without
 * touching the UI.
 *
 * Suggested future shape:
 *   - uploadVideo(file): POST to /api/uploads -> returns cloud URL
 *   - renderVertical(projectId, settings): POST to /api/render
 *        backend runs FFmpeg / Shotstack pipeline:
 *          1. crop input 16:9 to 9:16 at configured x-offset + zoom
 *          2. optionally generate blurred background layer
 *          3. overlay top title + bottom subtitle with chosen colors
 *          4. encode 1080x1920 H.264 MP4
 *   - getExport(id), listExports()
 */

export type FramingMode = "left" | "center" | "right";

/**
 * Display mode for fitting the 16:9 source into the 9:16 canvas.
 * - "fit": full video visible, letterboxed (contain)
 * - "fill": cover, crops sides based on framing
 * - "blur": full video in front + blurred enlarged copy behind
 * - "manual": user-controlled zoom + offsets
 *
 * The backend renderer (FFmpeg / Shotstack / Cloudinary) must honor
 * this field when producing the 1080x1920 export.
 */
export type DisplayMode = "fit" | "fill" | "blur" | "manual";

export interface EditorSettings {
  displayMode: DisplayMode;
  framing: FramingMode;
  zoom: number; // 1 - 3 (used in fill/manual/blur)
  offsetY: number; // -50..50 (manual only)
  blurredBackground: boolean; // legacy; kept for back-compat, derived from displayMode
  titleText: string;
  subtitleText: string;
  textColor: string;
  labelBgColor: string;
}

export interface VideoProject {
  id: string;
  name: string;
  thumbnail: string;
  sourceSrc: string;
  createdAt: string;
  settings: EditorSettings;
}

export interface ExportRecord {
  id: string;
  projectId: string;
  projectName: string;
  thumbnail: string;
  createdAt: string;
  resolution: string;
  status: "completed" | "processing" | "failed";
  downloadUrl: string;
}

const PROJECTS_KEY = "vc_projects";
const EXPORTS_KEY = "vc_exports";

export const defaultSettings = (): EditorSettings => ({
  displayMode: "blur",
  framing: "center",
  zoom: 1,
  offsetY: 0,
  blurredBackground: true,
  titleText: "Titular aquí",
  subtitleText: "Subtítulo inferior",
  textColor: "#FFFFFF",
  labelBgColor: "#FF5A36",
});

const read = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
};
const write = <T,>(key: string, data: T[]) =>
  localStorage.setItem(key, JSON.stringify(data));

export const videoService = {
  listProjects(): VideoProject[] {
    return read<VideoProject>(PROJECTS_KEY);
  },
  getProject(id: string): VideoProject | undefined {
    return read<VideoProject>(PROJECTS_KEY).find((p) => p.id === id);
  },
  createProject(
    data: Omit<VideoProject, "id" | "createdAt" | "settings">,
  ): VideoProject {
    const project: VideoProject = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      settings: defaultSettings(),
    };
    const all = read<VideoProject>(PROJECTS_KEY);
    all.unshift(project);
    write(PROJECTS_KEY, all);
    return project;
  },
  updateProject(id: string, patch: Partial<VideoProject>): void {
    const all = read<VideoProject>(PROJECTS_KEY).map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
    write(PROJECTS_KEY, all);
  },
  deleteProject(id: string): void {
    write(
      PROJECTS_KEY,
      read<VideoProject>(PROJECTS_KEY).filter((p) => p.id !== id),
    );
  },

  listExports(): ExportRecord[] {
    return read<ExportRecord>(EXPORTS_KEY);
  },
  /**
   * Mock render. Replace this with a real backend call.
   *
   * IMPORTANT: the chosen `settings.displayMode` MUST be honored by the
   * renderer so that exports match the editor preview.
   *
   *  - "fit":    ffmpeg -vf "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black"
   *  - "fill":   ffmpeg -vf "scale=-2:1920,crop=1080:1920:<x>:0"   (x from framing)
   *              with extra scale multiplier for `zoom`
   *  - "blur":   two layers — blurred enlarged background + scaled foreground
   *              (overlay + boxblur filter)
   *  - "manual": apply `zoom` + `offsetY` as crop offsets in a 1080x1920 canvas
   *
   * Example (Shotstack):
   *   await fetch('/api/render', { method: 'POST',
   *     body: JSON.stringify(buildShotstackJson(project)) })
   */
  async exportProject(project: VideoProject): Promise<ExportRecord> {
    await new Promise((r) => setTimeout(r, 1200));
    // Snapshot the display mode into the record so history reflects how
    // the export was produced, and so a future backend job can re-render.
    const record: ExportRecord = {
      id: crypto.randomUUID(),
      projectId: project.id,
      projectName: project.name,
      thumbnail: project.thumbnail,
      createdAt: new Date().toISOString(),
      resolution: "1080x1920",
      status: "completed",
      downloadUrl: project.sourceSrc, // placeholder
    };
    const all = read<ExportRecord>(EXPORTS_KEY);
    all.unshift(record);
    write(EXPORTS_KEY, all);
    return record;
  },
};

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  ArrowLeft,
  Sparkles,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  defaultSettings,
  DisplayMode,
  EditorSettings,
  FramingMode,
  VideoProject,
  videoService,
} from "@/services/videoService";
import { toast } from "sonner";

type DetectedFace = { boundingBox: { x: number; y: number; width: number; height: number } };
type FaceDetectorConstructor = new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
  detect: (image: CanvasImageSource) => Promise<DetectedFace[]>;
};

declare global {
  interface Window {
    FaceDetector?: FaceDetectorConstructor;
  }
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const framingOptions: { value: FramingMode; label: string; icon: typeof AlignLeft }[] = [
  { value: "left", label: "Izquierda", icon: AlignLeft },
  { value: "center", label: "Centro", icon: AlignCenter },
  { value: "right", label: "Derecha", icon: AlignRight },
];

const displayModeOptions: {
  value: DisplayMode;
  label: string;
  hint: string;
  icon: typeof AlignLeft;
}[] = [
  { value: "fit", label: "Ajustar vídeo completo", hint: "Muestra todo el vídeo", icon: Minimize2 },
  { value: "fill", label: "Completar pantalla", hint: "Rellena el 9:16", icon: Maximize2 },
  { value: "blur", label: "Fondo desenfocado", hint: "Vídeo completo + blur", icon: Sparkles },
  { value: "manual", label: "Zoom manual", hint: "Zoom y posición libres", icon: Move },
];

const normalizeSettings = (settings: EditorSettings): EditorSettings => ({
  ...defaultSettings(),
  ...settings,
  zoom: settings.zoom ?? 1,
  offsetX: settings.offsetX ?? 0,
  offsetY: settings.offsetY ?? 0,
});

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<VideoProject | null>(null);
  const [settings, setSettings] = useState<EditorSettings | null>(null);
  const [exporting, setExporting] = useState(false);
  const [autoSubject, setAutoSubject] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<InstanceType<FaceDetectorConstructor> | null>(null);

  useEffect(() => {
    if (!id) return;
    const p = videoService.getProject(id);
    if (!p) {
      navigate("/dashboard");
      return;
    }

    const normalized = normalizeSettings(p.settings);
    const normalizedProject = { ...p, settings: normalized };
    setProject(normalizedProject);
    setSettings(normalized);
    videoService.updateProject(p.id, { settings: normalized });
  }, [id, navigate]);

  useEffect(() => {
    if (!autoSubject || !settings) return;

    if (!("FaceDetector" in window) || !window.FaceDetector) {
      setAutoSubject(false);
      toast.error("Auto sujeto no está disponible en este navegador. Prueba Chrome/Edge actualizado o usa el ajuste manual.");
      return;
    }

    detectorRef.current = detectorRef.current || new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });

    const interval = window.setInterval(async () => {
      const video = videoRef.current;
      const detector = detectorRef.current;

      if (!video || !detector || video.readyState < 2 || video.paused) return;

      try {
        const faces = await detector.detect(video);
        if (!faces.length) return;

        const videoWidth = video.videoWidth || video.clientWidth;
        const videoHeight = video.videoHeight || video.clientHeight;
        if (!videoWidth || !videoHeight) return;

        // First version: follow the most prominent visible face.
        // This is not yet true active-speaker detection; it is face-based auto-framing.
        const face = faces
          .map((item) => ({ item, area: item.boundingBox.width * item.boundingBox.height }))
          .sort((a, b) => b.area - a.area)[0].item;

        const faceCenterX = ((face.boundingBox.x + face.boundingBox.width / 2) / videoWidth) * 100;
        const faceCenterY = ((face.boundingBox.y + face.boundingBox.height / 2) / videoHeight) * 100;

        const nextOffsetX = clamp(faceCenterX - 50, -45, 45);
        const nextOffsetY = clamp(faceCenterY - 50, -25, 25);

        setSettings((current) => {
          if (!current || !project) return current;

          const smoothed: EditorSettings = normalizeSettings({
            ...current,
            displayMode: "fill",
            zoom: Math.max(current.zoom, 1.15),
            offsetX: current.offsetX + (nextOffsetX - current.offsetX) * 0.25,
            offsetY: current.offsetY + (nextOffsetY - current.offsetY) * 0.15,
          });

          videoService.updateProject(project.id, { settings: smoothed });
          return smoothed;
        });
      } catch (error) {
        console.error("Auto sujeto error", error);
      }
    }, 600);

    return () => window.clearInterval(interval);
  }, [autoSubject, project, settings]);

  const update = (patch: Partial<EditorSettings>) => {
    if (!settings || !project) return;
    const next = normalizeSettings({ ...settings, ...patch });
    setSettings(next);
    setProject({ ...project, settings: next });
    videoService.updateProject(project.id, { settings: next });
  };

  const setDisplayMode = (displayMode: DisplayMode) => {
    setAutoSubject(false);
    if (!settings) return;

    // “Completar pantalla” must start from a clean full-screen crop.
    // The zoom slider then adds extra zoom on top of the cover crop.
    if (displayMode === "fill") {
      update({ displayMode, zoom: Math.max(settings.zoom, 1), offsetX: 0, offsetY: 0, framing: "center" });
      return;
    }

    update({ displayMode });
  };

  const setFraming = (framing: FramingMode) => {
    setAutoSubject(false);
    const offsetX = framing === "left" ? -35 : framing === "right" ? 35 : 0;
    update({ framing, offsetX });
  };

  const resetFrame = () => {
    setAutoSubject(false);
    update({ zoom: 1, offsetX: 0, offsetY: 0, framing: "center" });
  };

  const toggleAutoSubject = () => {
    if (!window.FaceDetector) {
      toast.error("Auto sujeto experimental necesita FaceDetector del navegador. Si no aparece, usa Chrome/Edge actualizado o el ajuste manual.");
      return;
    }

    if (!autoSubject) {
      update({ displayMode: "fill", zoom: Math.max(settings?.zoom ?? 1, 1.15), framing: "center" });
      toast.success("Auto sujeto activado: seguirá la cara más destacada del plano.");
    }

    setAutoSubject((value) => !value);
  };

  const handleExport = async () => {
    if (!project || !settings) return;
    setExporting(true);
    try {
      await videoService.exportProject({ ...project, settings });
      toast.success("Exportación completada (1080×1920)");
      navigate("/history");
    } catch {
      toast.error("Error en la exportación");
    } finally {
      setExporting(false);
    }
  };

  const mainVideoStyle = useMemo(() => {
    if (!settings) return undefined;

    const x = clamp(50 + settings.offsetX, 0, 100);
    const y = clamp(50 + settings.offsetY, 0, 100);
    const scale = settings.displayMode === "fill" || settings.displayMode === "manual" ? settings.zoom : 1;

    return {
      objectPosition: `${x}% ${y}%`,
      transform: `scale(${scale})`,
      transformOrigin: `${x}% ${y}%`,
    };
  }, [settings]);

  if (!project || !settings) return null;

  const isFullScreenCrop = settings.displayMode === "fill" || settings.displayMode === "manual";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-smooth hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a proyectos
          </button>
          <Button variant="hero" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? "Exportando…" : "Exportar 1080×1920 MP4"}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-gradient-card p-6">
            <div className="w-full max-w-sm">
              <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                Modo de visualización
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {displayModeOptions.map((opt) => {
                  const active = settings.displayMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDisplayMode(opt.value)}
                      className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left text-xs transition-smooth ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-semibold">
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </span>
                      <span className="text-[10px] leading-tight opacity-80">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl bg-black shadow-elegant">
              {settings.displayMode === "blur" && (
                <video
                  src={project.sourceSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full scale-[1.8] object-cover blur-2xl opacity-70"
                />
              )}

              <video
                ref={videoRef}
                src={project.sourceSrc}
                autoPlay
                loop
                muted
                playsInline
                style={mainVideoStyle}
                className={`absolute inset-0 h-full w-full transition-smooth ${
                  isFullScreenCrop ? "object-cover" : "object-contain"
                }`}
              />

              {settings.titleText && (
                <div
                  className="absolute left-4 right-4 top-6 rounded-lg px-3 py-2 text-center text-sm font-bold shadow-glow"
                  style={{
                    backgroundColor: settings.labelBgColor,
                    color: settings.textColor,
                  }}
                >
                  {settings.titleText}
                </div>
              )}

              {settings.subtitleText && (
                <div
                  className="absolute inset-x-4 bottom-8 rounded-lg px-3 py-2 text-center text-xs"
                  style={{
                    backgroundColor: settings.labelBgColor,
                    color: settings.textColor,
                  }}
                >
                  {settings.subtitleText}
                </div>
              )}
            </div>

            <p className="max-w-sm text-center text-xs text-muted-foreground">
              “Completar pantalla” rellena el 9:16 sin barras negras. “Auto sujeto” intenta centrar la cara más destacada del plano.
            </p>
          </div>

          <aside className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-xs text-muted-foreground">Previsualización vertical 9:16</p>
            </div>

            <section className="space-y-3 rounded-xl border border-border/60 bg-gradient-card p-4">
              <h3 className="text-sm font-semibold">Encuadre</h3>

              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Auto sujeto experimental</p>
                    <p className="text-xs text-muted-foreground">Centra automáticamente la cara más destacada. Todavía no detecta quién habla.</p>
                  </div>
                  <Button
                    variant={autoSubject ? "default" : "outline"}
                    size="sm"
                    onClick={toggleAutoSubject}
                  >
                    <Sparkles className="h-4 w-4" />
                    {autoSubject ? "Activo" : "Activar"}
                  </Button>
                </div>
              </div>

              {isFullScreenCrop && (
                <div className="grid grid-cols-3 gap-2">
                  {framingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFraming(opt.value)}
                      className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-smooth ${
                        settings.framing === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {isFullScreenCrop && (
                <>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label>Zoom</Label>
                      <span className="text-xs text-muted-foreground">{settings.zoom.toFixed(2)}×</span>
                    </div>
                    <Slider
                      value={[settings.zoom]}
                      min={1}
                      max={3}
                      step={0.05}
                      onValueChange={([v]) => { setAutoSubject(false); update({ zoom: v }); }}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label>Posición horizontal</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.offsetX > 0 ? "+" : ""}
                        {settings.offsetX}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.offsetX]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => { setAutoSubject(false); update({ offsetX: v }); }}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label>Posición vertical</Label>
                      <span className="text-xs text-muted-foreground">
                        {settings.offsetY > 0 ? "+" : ""}
                        {settings.offsetY}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.offsetY]}
                      min={-50}
                      max={50}
                      step={1}
                      onValueChange={([v]) => { setAutoSubject(false); update({ offsetY: v }); }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setFraming("center")}>
                      Centrar
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetFrame}>
                      <RotateCcw className="h-4 w-4" /> Reset
                    </Button>
                  </div>
                </>
              )}

              {settings.displayMode === "fit" && (
                <p className="text-xs text-muted-foreground">
                  El vídeo se muestra completo dentro del formato 9:16. Usa “Completar pantalla” si quieres que ocupe toda la pantalla vertical.
                </p>
              )}

              {settings.displayMode === "blur" && (
                <p className="text-xs text-muted-foreground">
                  Se conserva el vídeo completo y se rellena el 9:16 con una copia desenfocada de fondo.
                </p>
              )}
            </section>

            <section className="space-y-3 rounded-xl border border-border/60 bg-gradient-card p-4">
              <h3 className="text-sm font-semibold">Texto</h3>
              <div className="space-y-2">
                <Label htmlFor="title">Titular superior</Label>
                <Input
                  id="title"
                  value={settings.titleText}
                  onChange={(e) => update({ titleText: e.target.value })}
                  placeholder="TITULAR DE IMPACTO"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub">Subtítulo inferior</Label>
                <Input
                  id="sub"
                  value={settings.subtitleText}
                  onChange={(e) => update({ subtitleText: e.target.value })}
                  placeholder="Descripción corta"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="tc">Color de texto</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="tc"
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => update({ textColor: e.target.value })}
                      className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                    <Input value={settings.textColor} onChange={(e) => update({ textColor: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bc">Fondo del rótulo</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="bc"
                      type="color"
                      value={settings.labelBgColor}
                      onChange={(e) => update({ labelBgColor: e.target.value })}
                      className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                    />
                    <Input value={settings.labelBgColor} onChange={(e) => update({ labelBgColor: e.target.value })} />
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Editor;

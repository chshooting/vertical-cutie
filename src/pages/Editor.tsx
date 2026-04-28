import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DisplayMode,
  EditorSettings,
  FramingMode,
  VideoProject,
  videoService,
} from "@/services/videoService";
import { toast } from "sonner";

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
  { value: "fit", label: "Ajustar vídeo completo", hint: "Muestra todo el vídeo (letterbox)", icon: Minimize2 },
  { value: "fill", label: "Completar pantalla", hint: "Rellena el 9:16 recortando los lados", icon: Maximize2 },
  { value: "blur", label: "Fondo desenfocado", hint: "Vídeo completo + fondo blur", icon: Sparkles },
  { value: "manual", label: "Zoom manual", hint: "Escala y posición libres", icon: Move },
];

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<VideoProject | null>(null);
  const [settings, setSettings] = useState<EditorSettings | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const p = videoService.getProject(id);
    if (!p) {
      navigate("/dashboard");
      return;
    }
    setProject(p);
    setSettings(p.settings);
  }, [id, navigate]);

  const update = (patch: Partial<EditorSettings>) => {
    if (!settings || !project) return;
    const next = { ...settings, ...patch };
    setSettings(next);
    videoService.updateProject(project.id, { settings: next });
  };

  const handleExport = async () => {
    if (!project) return;
    setExporting(true);
    try {
      await videoService.exportProject(project);
      toast.success("Exportación completada (1080×1920)");
      navigate("/history");
    } catch {
      toast.error("Error en la exportación");
    } finally {
      setExporting(false);
    }
  };

  // Framing -> object-position
  const objectPosition = useMemo(() => {
    if (!settings) return "50% 50%";
    const x =
      settings.framing === "left" ? "20%" : settings.framing === "right" ? "80%" : "50%";
    return `${x} 50%`;
  }, [settings]);

  if (!project || !settings) return null;

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
          {/* Preview column */}
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-gradient-card p-6">
            {/* Display mode selector (above preview) */}
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
                      onClick={() => update({ displayMode: opt.value })}
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
              {/* Blurred background layer: only for "blur" mode */}
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
              {/* Main framed video — behavior depends on displayMode */}
              <video
                src={project.sourceSrc}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  objectPosition:
                    settings.displayMode === "manual"
                      ? `50% ${50 + settings.offsetY}%`
                      : objectPosition,
                  transform:
                    settings.displayMode === "manual" || settings.displayMode === "fill"
                      ? `scale(${settings.zoom})`
                      : "none",
                }}
                className={`absolute inset-0 h-full w-full transition-smooth ${
                  settings.displayMode === "fill" ? "object-cover" : "object-contain"
                }`}
              />
              {/* Title overlay */}
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
              {/* Subtitle overlay */}
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
          </div>

          {/* Controls */}
          <aside className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-xs text-muted-foreground">
                Previsualización vertical 9:16
              </p>
            </div>

            <section className="space-y-3 rounded-xl border border-border/60 bg-gradient-card p-4">
              <h3 className="text-sm font-semibold">Encuadre</h3>

              {/* Framing: used for fill + blur modes to choose which part to keep */}
              {(settings.displayMode === "fill" || settings.displayMode === "blur") && (
                <div className="grid grid-cols-3 gap-2">
                  {framingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update({ framing: opt.value })}
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

              {/* Zoom: only in fill + manual */}
              {(settings.displayMode === "fill" || settings.displayMode === "manual") && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Zoom</Label>
                    <span className="text-xs text-muted-foreground">
                      {settings.zoom.toFixed(2)}×
                    </span>
                  </div>
                  <Slider
                    value={[settings.zoom]}
                    min={1}
                    max={3}
                    step={0.05}
                    onValueChange={([v]) => update({ zoom: v })}
                  />
                </div>
              )}

              {/* Manual offset Y */}
              {settings.displayMode === "manual" && (
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
                    onValueChange={([v]) => update({ offsetY: v })}
                  />
                </div>
              )}

              {settings.displayMode === "fit" && (
                <p className="text-xs text-muted-foreground">
                  El vídeo se muestra completo dentro del formato 9:16. Los
                  controles de zoom y encuadre se activan en los otros modos.
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
                    <Input
                      value={settings.textColor}
                      onChange={(e) => update({ textColor: e.target.value })}
                    />
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
                    <Input
                      value={settings.labelBgColor}
                      onChange={(e) => update({ labelBgColor: e.target.value })}
                    />
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

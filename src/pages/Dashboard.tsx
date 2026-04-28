import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Upload, Video, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { videoService, VideoProject } from "@/services/videoService";
import { SAMPLE_VIDEOS } from "@/data/sampleVideos";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sampleId, setSampleId] = useState(SAMPLE_VIDEOS[0].id);

  const refresh = () => setProjects(videoService.listProjects());
  useEffect(refresh, []);

  const handleCreate = () => {
    const sample = SAMPLE_VIDEOS.find((s) => s.id === sampleId)!;
    const project = videoService.createProject({
      name: name || sample.title,
      thumbnail: sample.thumbnail,
      sourceSrc: sample.src,
    });
    setOpen(false);
    setName("");
    toast.success("Proyecto creado");
    navigate(`/editor/${project.id}`);
  };

  const remove = (id: string) => {
    videoService.deleteProject(id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Proyectos</h1>
            <p className="mt-1 text-muted-foreground">
              Sube o elige un vídeo horizontal para convertirlo en vertical.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <Plus className="h-4 w-4" />
                Nuevo proyecto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo proyecto de vídeo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pname">Nombre del proyecto</Label>
                  <Input
                    id="pname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Entrevista podcast #12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sube tu vídeo</Label>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center transition-smooth hover:border-primary/50 hover:bg-secondary/60">
                    <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Arrastra un vídeo o haz clic (demo — usará un vídeo de ejemplo)
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={() =>
                        toast.info("Subida real disponible al conectar el backend de vídeo")
                      }
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>O elige un vídeo de ejemplo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_VIDEOS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSampleId(s.id)}
                        className={`overflow-hidden rounded-lg border-2 transition-smooth ${
                          sampleId === s.id
                            ? "border-primary shadow-glow"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <img
                          src={s.thumbnail}
                          alt={s.title}
                          className="aspect-video w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="hero" onClick={handleCreate}>
                  Crear y editar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-gradient-card p-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Video className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Aún no tienes proyectos</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Crea tu primer proyecto para convertir un vídeo horizontal en un clip
              vertical listo para redes.
            </p>
            <Button variant="hero" className="mt-6" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear proyecto
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-gradient-card transition-smooth hover:border-primary/40 hover:shadow-elegant"
              >
                <Link to={`/editor/${p.id}`} className="block">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(p.id)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

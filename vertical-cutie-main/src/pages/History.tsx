import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, CheckCircle2, Clock, XCircle, Video } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { ExportRecord, videoService } from "@/services/videoService";

const statusMap = {
  completed: { icon: CheckCircle2, label: "Completado", className: "text-primary" },
  processing: { icon: Clock, label: "Procesando", className: "text-muted-foreground" },
  failed: { icon: XCircle, label: "Fallido", className: "text-destructive" },
};

const History = () => {
  const [records, setRecords] = useState<ExportRecord[]>([]);
  useEffect(() => setRecords(videoService.listExports()), []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Historial de exportaciones</h1>
        <p className="mt-1 text-muted-foreground">
          Todos tus clips verticales exportados en 1080×1920.
        </p>

        {records.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-gradient-card p-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Video className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Sin exportaciones todavía</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Exporta tu primer clip desde un proyecto para verlo aquí.
            </p>
            <Button variant="hero" className="mt-6" asChild>
              <Link to="/dashboard">Ir a proyectos</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-4 text-left font-medium">Proyecto</th>
                  <th className="p-4 text-left font-medium">Resolución</th>
                  <th className="p-4 text-left font-medium">Fecha</th>
                  <th className="p-4 text-left font-medium">Estado</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const s = statusMap[r.status];
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-border/40 last:border-0 transition-smooth hover:bg-secondary/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={r.thumbnail}
                            alt=""
                            className="h-10 w-16 rounded object-cover"
                            loading="lazy"
                          />
                          <span className="font-medium">{r.projectName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{r.resolution}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 ${s.className}`}>
                          <s.icon className="h-4 w-4" />
                          {s.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={r.downloadUrl} download target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" /> Descargar
                          </a>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;

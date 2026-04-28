import { Link } from "react-router-dom";
import {
  ArrowRight,
  Smartphone,
  Type,
  Sparkles,
  Layers,
  Download,
  Zap,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Smartphone,
    title: "Previsualización 9:16 real",
    desc: "Mira el resultado en formato vertical antes de exportar, sin sorpresas.",
  },
  {
    icon: Layers,
    title: "Encuadre y zoom",
    desc: "Elige izquierda, centro o derecha y ajusta el zoom para no perder a nadie.",
  },
  {
    icon: Sparkles,
    title: "Fondo desenfocado",
    desc: "Rellena los bordes con un fondo borroso estilo Reels con un clic.",
  },
  {
    icon: Type,
    title: "Rótulos de titular",
    desc: "Titulares y subtítulos personalizables con colores de texto y fondo.",
  },
  {
    icon: Download,
    title: "Exporta en 1080×1920",
    desc: "MP4 listo para TikTok, Reels, Shorts y Stories.",
  },
  {
    icon: Zap,
    title: "Pensado para creadores",
    desc: "Community managers, medios, podcasters: clips rápidos, aspecto pro.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          width={1920}
          height={1088}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-screen"
        />
        <div className="container relative grid gap-12 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Nuevo · Editor vertical
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Convierte vídeos horizontales en{" "}
              <span className="text-gradient-primary">clips verticales</span> en segundos.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              VerticalCut transforma tus vídeos 16:9 en 9:16 listos para TikTok,
              Instagram Reels, Shorts y Stories. Encuadre, rótulos y exportación en 1080×1920,
              todo en un solo editor.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">
                  Empezar gratis <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Sin tarjeta · Exporta en MP4 1080×1920
            </p>
          </div>

          {/* Phone mock */}
          <div className="relative mx-auto flex w-full max-w-sm justify-center">
            <div className="relative aspect-[9/16] w-full max-w-[280px] animate-float overflow-hidden rounded-[2.5rem] border border-border bg-gradient-card shadow-elegant">
              <div className="absolute inset-x-0 top-0 z-10 mx-auto mt-3 h-5 w-24 rounded-full bg-background/80" />
              <video
                src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full scale-[1.8] object-cover blur-xl opacity-60"
              />
              <video
                src="https://videos.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div className="absolute left-4 right-4 top-16 rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground shadow-glow">
                TITULAR DE IMPACTO
              </div>
              <div className="absolute inset-x-4 bottom-8 rounded-lg bg-background/80 px-3 py-2 text-center text-xs text-foreground backdrop-blur">
                Subtítulo inferior aquí
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Todo lo que necesitas para cortar vertical.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Un editor enfocado, sin distracciones. Lo esencial para publicar rápido.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-gradient-card p-6 transition-smooth hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Tu próximo clip viral empieza en vertical.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Prueba VerticalCut gratis con vídeos de ejemplo. Conecta tus propios
              vídeos en cuanto conectemos el backend de render.
            </p>
            <Button variant="hero" size="lg" className="mt-6" asChild>
              <Link to="/signup">
                Crear mi primer clip <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VerticalCut — Hecho para creadores.
        </div>
      </footer>
    </div>
  );
};

export default Landing;

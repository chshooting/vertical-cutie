import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scissors } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  mode: "login" | "signup";
}

const AuthPage = ({ mode }: Props) => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(form.name || form.email.split("@")[0], form.email, form.password);
        toast.success("Cuenta creada");
      } else {
        await signIn(form.email, form.password);
        toast.success("Bienvenido de vuelta");
      }
      navigate("/dashboard");
    } catch {
      toast.error("No se pudo completar la acción");
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-hero">
      <div className="container flex flex-1 items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-elegant">
          <Link to="/" className="mb-8 flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </span>
            VerticalCut
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isSignup ? "Crea tu cuenta" : "Inicia sesión"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignup
              ? "Empieza a crear clips verticales en segundos."
              : "Accede a tus proyectos y exportaciones."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex García"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={4}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Procesando…" : isSignup ? "Crear cuenta" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="font-medium text-primary hover:underline"
            >
              {isSignup ? "Inicia sesión" : "Regístrate"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

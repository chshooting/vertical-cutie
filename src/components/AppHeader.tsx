import { Link, NavLink, useNavigate } from "react-router-dom";
import { Scissors, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export const AppHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-lg tracking-tight">VerticalCut</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-smooth ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Proyectos
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-smooth ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Historial
            </NavLink>
            <div className="ml-3 flex items-center gap-3 border-l border-border/60 pl-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/signup">Empezar gratis</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

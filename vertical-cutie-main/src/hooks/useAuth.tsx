import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * Mock auth. Structured to be replaced by Lovable Cloud auth later:
 * swap implementation of signIn/signUp/signOut to call supabase.auth.*.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const KEY = "vc_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
    setLoading(false);
  }, []);

  const persist = (u: AuthUser) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };

  const signIn = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    persist({ id: "u_" + email, email, name: email.split("@")[0] });
  };
  const signUp = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    persist({ id: "u_" + email, email, name });
  };
  const signOut = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const TOKEN_KEY = "token";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const lastRedirect = useRef<string | null>(null);

  // Load token from localStorage once on mount, defer update to avoid sync setState-in-effect
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        setToken(saved);
      } catch (err) {
        console.error("auth-context error reading localStorage", err);
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  // Redirect handling — wait until we finished initial loading
  useEffect(() => {
    if (isLoading) return;

    try {
      const p = pathname ?? "";

      // Do not redirect for internal Next.js routes or static files
      const isInternal = p.startsWith("/_next") || p.startsWith("/static") || p.includes(".");

      // If there's no token, only allow the login page (and internal/static paths).
      if (!token && !isInternal && p !== "/login") {
        if (lastRedirect.current !== "/login") {
          lastRedirect.current = "/login";
          router.replace("/login");
        }
        return;
      }

      // If authenticated and on the login page, send to dashboard.
      if (p === "/login" && token) {
        if (lastRedirect.current !== "/dashboard") {
          lastRedirect.current = "/dashboard";
          router.replace("/dashboard");
        }
        return;
      }
    } catch (err) {
      // safe fallback — log to console so we can see unexpected values
      console.error("auth-context error while checking redirects", err, {
        pathname,
        token,
        isLoading,
      });
    }
  }, [token, pathname, isLoading, router]);

  const login = useCallback(
    (newToken: string) => {
      try {
        localStorage.setItem(TOKEN_KEY, newToken);
      } catch (err) {
        console.error("auth-context login localStorage error", err);
      }
      setToken(newToken);
      router.replace("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error("auth-context logout localStorage error", err);
    }
    setToken(null);
    router.replace("/login");
  }, [router]);

  const value: AuthContextValue = {
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

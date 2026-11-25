"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../catalog";

const TOKEN_KEY = "souveniraceh.admin-token";

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

type AdminAuthState = {
  token: string | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
};
const Context = createContext<AdminAuthState>({
  token: null,
  ready: false,
  login: async () => "belum siap",
  logout: () => {},
});
export const useAdminAuth = () => useContext(Context);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(readToken());
    setReady(true);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(API_URL + "/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) return body?.error || "Gagal masuk. Periksa kembali.";
      setToken(body.token);
      writeToken(body.token);
      return null;
    } catch {
      return "Tidak dapat menghubungi server.";
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    writeToken(null);
  }, []);

  return (
    <Context.Provider value={{ token, ready, login, logout }}>
      {children}
    </Context.Provider>
  );
}

/** Fetch helper for admin endpoints: attaches the bearer token and logs out
 * automatically on a 401 so a stale/expired session doesn't loop silently. */
export function useAdminFetch() {
  const { token, logout } = useAdminAuth();
  const router = useRouter();
  return useCallback(
    async (path: string, options: RequestInit = {}) => {
      const res = await fetch(API_URL + path, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
          Authorization: "Bearer " + token,
        },
      });
      if (res.status === 401) {
        logout();
        router.replace("/admin/login");
        throw new Error("Sesi admin berakhir, silakan masuk kembali.");
      }
      return res;
    },
    [token, logout, router],
  );
}

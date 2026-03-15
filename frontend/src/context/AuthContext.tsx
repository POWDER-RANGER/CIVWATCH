import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/client';

interface User { userId: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cw_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((r) => setUser(r.data.user))
      .catch(() => { setToken(null); localStorage.removeItem('cw_token'); })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email: string, password: string) {
    const r = await authApi.login(email, password);
    const t = r.data.token;
    localStorage.setItem('cw_token', t);
    setToken(t);
    setUser(r.data.user);
  }

  function logout() {
    localStorage.removeItem('cw_token');
    setToken(null); setUser(null);
    window.location.href = '/login';
  }

  return <Ctx.Provider value={{ user, token, login, logout, loading }}>{children}</Ctx.Provider>;
}

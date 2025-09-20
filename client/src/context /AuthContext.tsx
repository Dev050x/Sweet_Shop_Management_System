import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { parseJwt } from "../utils/jwt";

type UserInfo = {
  userId?: number;
  role?: string;
  name?: string;
  email?: string;
  iat?: number;
  exp?: number;
  [k:string]: any;
} | null;

type AuthContextType = {
  token: string | null;
  user: UserInfo;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const nav = useNavigate();
  const [token, setToken] = useState<string | null>(() => typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const [user, setUser] = useState<UserInfo>(() => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      return t ? parseJwt(t) : null;
    } catch { return null; }
  });

  // sync axios header and localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      // try to fetch canonical profile; fallback to token payload
      (async () => {
        try {
          const res = await api.get("/api/auth/me"); // expected: { user: { id, name, email, role } } or similar
          const dataUser = res?.data?.user ?? res?.data;
          if (dataUser) {
            // normalize keys
            setUser({
              userId: dataUser.id ?? dataUser.userId ?? parseJwt(token)?.userId,
              name: dataUser.name ?? dataUser.fullName ?? parseJwt(token)?.name,
              email: dataUser.email ?? parseJwt(token)?.email,
              role: (dataUser.role ?? parseJwt(token)?.role) ?? undefined,
              iat: parseJwt(token)?.iat,
              exp: parseJwt(token)?.exp,
            });
            return;
          }
        } catch (err) {
          // ignore; fallback to token payload below
        }
        const payload = parseJwt(token);
        setUser({
          userId: payload?.userId ?? payload?.id,
          name: payload?.name,
          email: payload?.email,
          role: payload?.role,
          iat: payload?.iat,
          exp: payload?.exp,
        });
      })();
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    }
  }, [token]);

  // auto-logout if token expired
  useEffect(() => {
    if (!user || !user.exp) return;
    const now = Math.floor(Date.now() / 1000);
    if (user.exp <= now) {
      setToken(null);
      try { nav("/login"); } catch {}
    } else {
      const ms = (user.exp - now) * 1000;
      const t = setTimeout(() => { setToken(null); try { nav("/login"); } catch {} }, ms);
      return () => clearTimeout(t);
    }
  }, [user, nav]);

  // response interceptor to logout on 401
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        if (status === 401) {
          setToken(null);
          try { nav("/login"); } catch {}
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [nav]);

  const login = (t: string) => setToken(t);
  const logout = () => setToken(null);

  const isAuthenticated = !!token;
  const isAdmin = !!user && String(user.role ?? "").toUpperCase() === "ADMIN";

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
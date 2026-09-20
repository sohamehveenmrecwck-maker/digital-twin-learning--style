import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dt_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (identifier, password) => {
    const res = await api.post("/api/auth/login", { identifier, password });
    localStorage.setItem("dt_token", res.data.access_token);
    localStorage.setItem("dt_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post("/api/auth/register", payload);
    localStorage.setItem("dt_token", res.data.access_token);
    localStorage.setItem("dt_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("dt_token");
    localStorage.removeItem("dt_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get("/api/auth/me");
    localStorage.setItem("dt_user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refreshUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

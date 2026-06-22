import { createContext, useContext, useEffect, useState } from "react";
import { queryClient } from "../App";

const AuthContext = createContext(null);
const runtimeOrigin =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5005";
const isLocalhostUrl = (url) =>
  typeof url === "string" &&
  /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/.test(url);

const normalizeBaseUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return value;
  const trimmed = value.trim();
  if (trimmed.startsWith(":")) return `http://localhost${trimmed}`;
  if (/^\d+$/.test(trimmed)) return `http://localhost:${trimmed}`;
  if (trimmed.startsWith("//")) {
    return `${window.location.protocol}${trimmed}`;
  }
  return trimmed.replace(/\/$/, "");
};

let authBaseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env.MODE === "production"
    ? runtimeOrigin
    : "http://localhost:5005");

if (
  typeof window !== "undefined" &&
  isLocalhostUrl(authBaseUrl) &&
  !isLocalhostUrl(runtimeOrigin)
) {
  console.warn(
    "[Auth] Overriding localhost BASE with page origin:",
    authBaseUrl,
    "=>",
    runtimeOrigin,
  );
  authBaseUrl = runtimeOrigin;
}

if (typeof window !== "undefined") {
  console.log("[Auth] Using BASE URL:", authBaseUrl);
}

const BASE = authBaseUrl;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const signUp = async (email, password, fullName, phone) => {
    try {
      const res = await fetch(`${BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, phone }),
      });

      const text = await res.text();
      if (!text) {
        throw new Error(
          `Backend returned empty response (${res.status}). URL: ${BASE}/api/auth/signup`,
        );
      }

      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log(`[Auth] Attempting login at: ${BASE}/api/auth/login`);
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(`[Auth] Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      if (!text) {
        throw new Error(
          `Backend returned empty response (${res.status}). URL: ${BASE}/api/auth/login`,
        );
      }

      const data = JSON.parse(text);
      if (!res.ok)
        throw new Error(
          data.error || data.message || `Request failed: ${res.status}`,
        );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

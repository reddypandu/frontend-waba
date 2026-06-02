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

let baseUrl =
  normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env.MODE === "production"
    ? runtimeOrigin
    : "http://localhost:5005");

if (
  typeof window !== "undefined" &&
  isLocalhostUrl(baseUrl) &&
  !isLocalhostUrl(runtimeOrigin)
) {
  console.warn(
    "[API] Overriding localhost BASE with page origin:",
    baseUrl,
    "=>",
    runtimeOrigin,
  );
  baseUrl = runtimeOrigin;
}

if (typeof window !== "undefined") {
  console.log("[API] Using BASE URL:", baseUrl);
}

export const BASE = baseUrl;

export async function apiPost(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiGet(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiUpload(path, formData) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export async function apiPut(path, body) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function apiDelete(path) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

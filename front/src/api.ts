// src/api.ts

// ✅ Read API base URL from environment (set in Vercel / .env)
export const API_BASE = import.meta.env.VITE_API_URL as string;

// ✅ Simple helper for fetch (optional, you can also use axios directly)
export const api = {
  get: (path: string, init?: RequestInit) =>
    fetch(`${API_BASE}${path}`, { credentials: "include", ...init }),
};
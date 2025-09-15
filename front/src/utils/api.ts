import axios from "axios";

const api = axios.create({
  // Only the host here; every request path must include /api/...
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Temporary debug (helps confirm in prod)
console.log("👉 Using API Base URL:", import.meta.env.VITE_API_URL);

api.interceptors.request.use((config) => {
  // Show final URL to catch bad paths during rollout
  const urlShown = (config.baseURL || "") + (config.url || "");
  console.log("➡️ API request:", urlShown);

  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

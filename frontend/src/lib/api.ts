import axios, { type InternalAxiosRequestConfig } from "axios";

export const TOKEN_KEY = "resolveDeskToken";
export const USER_KEY = "resolveDeskUser";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});


API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const PUBLIC_PATHS = ["/auth/login", "/auth/register"];

API.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !PUBLIC_PATHS.includes(error.config?.url ?? "")
    ) {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Turns any error into a readable message (NestJS sends a string or an array of strings)
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    if (!error.response) return "Cannot reach the server. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export default API;

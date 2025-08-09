// client/src/services/authService.ts
import api from "./api";

export type User = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data; // expecting { token }
}

export async function register(payload: { email: string; password: string; first_name: string; last_name: string; }) {
  const res = await api.post("/api/auth/register", payload);
  return res.data; // expecting { token, id, email, first_name, last_name }
}

export async function me() {
  const res = await api.get("/api/auth/me");
  return res.data as User;
}

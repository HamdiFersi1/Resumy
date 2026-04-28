//sec/apis/authApi.ts

import axios from "axios";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export interface AuthUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "user" | "hr";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface UserSignupParams {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
  role: "user";
}

export interface HRSignupParams {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "hr";
}

export interface LoginParams {
  email: string;
  password: string;
}

/* ------------------------------------------------------------------ */
/* Axios instance                                                     */
/* ------------------------------------------------------------------ */
const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "account/",
  headers: { "Content-Type": "application/json" },
});

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------ */
/* API wrapper                                                        */
/* ------------------------------------------------------------------ */
const authApi = {
  /* ---------- Signup / Login -------------------------------------- */
  async signup(data: UserSignupParams): Promise<AuthResponse> {
    const res = await authClient.post<AuthResponse>("signup/", data);
    return res.data;
  },

  async signupHr(data: HRSignupParams): Promise<AuthResponse> {
    const res = await authClient.post<AuthResponse>("create-hr/", data);
    return res.data;
  },

  async login(data: LoginParams): Promise<AuthResponse> {
    const res = await authClient.post<AuthResponse>("login/", data);
    const { access, refresh, user } = res.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("authUser", JSON.stringify(user));
    return { access, refresh, user };
  },

  /* ---------- Token helpers --------------------------------------- */
  async refresh(): Promise<{ access: string }> {
    const oldRefresh = localStorage.getItem("refreshToken");
    if (!oldRefresh) throw new Error("No refresh token stored");

    const res = await authClient.post<{ access: string; refresh: string }>(
      "refresh/",
      { refresh: oldRefresh }
    );
    const { access, refresh: newRefresh } = res.data;
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", newRefresh);
    return { access };
  },

  async logout(): Promise<void> {
    const refresh = localStorage.getItem("refreshToken");
    if (refresh) {
      try {
        await authClient.post("logout/", { refresh });
      } catch {
        /* ignore */
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
  },

  /* ---------- Password flows -------------------------------------- */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await authClient.post<{ message: string }>(
      "password/forgot-password/",
      { email }
    );
    return res.data;
  },

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const res = await authClient.post<{ message: string }>(
      "password-change/change-password/",
      {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      }
    );
    return res.data;
  },
};

export default authApi;

// src/hooks/context/AuthContext.tsx
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import authApi, {
  AuthUser,
  UserSignupParams,
  HRSignupParams,
} from "../../apis/authApi";

interface JwtPayload {
  exp: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    data: UserSignupParams
  ) => Promise<{ ok: boolean; isActive: boolean }>;
  signupHr: (
    data: HRSignupParams
  ) => Promise<{ ok: boolean; isActive: boolean }>;
  changePassword: (oldP: string, newP: string) => Promise<boolean>;
  logout: () => Promise<void>;

  isHR: boolean;
  isJobSeeker: boolean;
  isAdmin: boolean;

  setUser: Dispatch<SetStateAction<AuthUser | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule automatic logout when token expires
  const scheduleAutoLogout = (token: string) => {
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      const msUntilExpiry = exp * 1000 - Date.now();
      if (msUntilExpiry <= 0) {
        logout();
      } else {
        // clear any existing timer
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = setTimeout(() => {
          logout();
        }, msUntilExpiry);
      }
    } catch {
      // invalid token, force logout
      logout();
    }
  };

  // Hydrate from localStorage and schedule auto-logout if token present
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const stored = localStorage.getItem("authUser");
    if (token && stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        setIsAuthenticated(true);
        scheduleAutoLogout(token);
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
    // cleanup on unmount
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const {
        access,
        refresh,
        user: u,
      } = await authApi.login({ email, password });
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("authUser", JSON.stringify(u));
      setUser(u);
      setIsAuthenticated(true);
      scheduleAutoLogout(access);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (data: UserSignupParams) => {
    try {
      const { access, refresh, user: u } = await authApi.signup(data);
      setUser(u);
      if (u.is_active) {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("authUser", JSON.stringify(u));
        setIsAuthenticated(true);
        scheduleAutoLogout(access);
      } else {
        setIsAuthenticated(false);
      }
      return { ok: true, isActive: u.is_active };
    } catch {
      return { ok: false, isActive: false };
    }
  };

  const signupHr = async (data: HRSignupParams) => {
    try {
      const { access, refresh, user: u } = await authApi.signupHr(data);
      setUser(u);
      if (u.is_active) {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("authUser", JSON.stringify(u));
        setIsAuthenticated(true);
        scheduleAutoLogout(access);
      } else {
        setIsAuthenticated(false);
      }
      return { ok: true, isActive: u.is_active };
    } catch {
      return { ok: false, isActive: false };
    }
  };

  const changePassword = async (oldP: string, newP: string) => {
    try {
      await authApi.changePassword(oldP, newP);
      navigate("/login");
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
      localStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }
  };

  const isHR = useMemo(() => user?.role === "hr", [user]);
  const isJobSeeker = useMemo(() => user?.role === "user", [user]);
  const isAdmin = useMemo(
    () => Boolean(user?.is_staff || user?.is_superuser),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        signup,
        signupHr,
        changePassword,
        logout,
        isHR,
        isJobSeeker,
        isAdmin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

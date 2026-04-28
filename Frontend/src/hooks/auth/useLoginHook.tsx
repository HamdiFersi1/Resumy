// src/hooks/auth/useLoginHook.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/apis/authApi"; 

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // login returns `true`/`false`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      // Instead of relying on context flags (isHR, isJobSeeker, isAdmin),
      // read the user directly from localStorage, since AuthContext.login()
      // has already saved it there.
      const stored = localStorage.getItem("authUser");
      let u: AuthUser | null = null;
      try {
        u = stored ? (JSON.parse(stored) as AuthUser) : null;
      } catch {
        u = null;
      }

      if (u) {
        // Decide where to route based on the freshly stored user object
        if (u.role === "hr") {
          navigate("/dashboard", { replace: true });
        } else if (u.role === "user") {
          navigate("/jobs", { replace: true });
        } else if (u.is_staff || u.is_superuser) {
          navigate("/admin", { replace: true });
        } else {
          // Fallback if somehow no role matches
          navigate("/", { replace: true });
        }
      } else {
        // If parsing failed
        setError("Could not read logged-in user. Please try again.");
      }
    } else {
      setError("Invalid email or password");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  };
}

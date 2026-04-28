// src/utils/HRProtectedRoute.tsx
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../hooks/context/AuthContext";

export function JobSeekerProtectedRoute() {
  const auth = useContext(AuthContext)!;

  if (auth.loading) {
    return <div>Loading…</div>;
  }

  if (!auth.isAuthenticated || !auth.isJobSeeker ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

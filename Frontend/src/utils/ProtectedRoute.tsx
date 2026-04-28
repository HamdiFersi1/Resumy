// src/utils/ProtectedRoute.tsx
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "@/hooks/context/AuthContext";

export function HRProtectedRoute() {
  const auth = useContext(AuthContext)!;
  const location = useLocation();

  // Allow /logout to run its effect even if not authenticated
  if (location.pathname === "/logout") {
    return <Outlet />;
  }

  if (auth.loading) {
    return <div>Loading…</div>;
  }

  if (!auth.isAuthenticated || !auth.isHR) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function JobSeekerProtectedRoute() {
  const auth = useContext(AuthContext)!;
  const location = useLocation();

  // Allow /logout to run its effect even if not authenticated
  if (location.pathname === "/logout") {
    return <Outlet />;
  }

  if (auth.loading) {
    return <div>Loading…</div>;
  }

  if (!auth.isAuthenticated || !auth.isJobSeeker) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export function AdminProtectedRoute() {
  const auth = useContext(AuthContext)!;
  const location = useLocation();

  // Allow /logout to run its effect even if not authenticated
  if (location.pathname === "/logout") {
    return <Outlet />;
  }

  if (auth.loading) {
    return <div>Loading…</div>;
  }

  if (!auth.isAuthenticated || !auth.isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

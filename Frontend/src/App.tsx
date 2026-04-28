// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";

import { AuthContext } from "@/hooks/context/AuthContext";
import {
  HRProtectedRoute,
  JobSeekerProtectedRoute,
  AdminProtectedRoute,
} from "@/utils/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

import LoginPage from "@/pages/authentication/login";
import SignupPage from "@/pages/authentication/signup";
import PleaseConfirmEmail from "@/pages/authentication/PleaseConfirmEmail";
import ActivateAccount from "@/pages/authentication/ActivateAccount";
import ChangePasswordPage from "@/pages/authentication/ChangePasswordPage";
import NotFound from "@/pages/misc/NotFound";
import Unauthorized from "@/pages/misc/Unauthorized";
import { LogoutPage } from "@/pages/authentication/logout";

import HRDashboard from "./pages/admin/HRDashboard";
import HRDetailPage from "./pages/admin/HRDetailPage";
import AdminFeedbackPage from "./pages/admin/feedbackPage";

import Dashboard from "./pages/HR/dashboard";
import DecisionsDashboard from "./pages/HR/DecisionsDashboard";
import ApplicationDetailPage from "./pages/HR/ApplicationDetailPage";
import JobPostingListPage from "./pages/JobPosting/JobPostingListPage";
import JobPostingFormPage from "./pages/JobPosting/JobPostingFormPage";
import JobPostingDetailPage from "./pages/JobPosting/JobPostingDetailPage";
import InterviewDetailsPage from "./pages/HR/InterviewDetailsPage";
import InterviewsDashboardPage from "./pages/HR/InterviewsDashboardPage";
import ReportPage from "./pages/HR/ReportPage";
import { HelpPage } from "./pages/misc/helpHR";

import ResumeBuilder from "./pages/resume-builder/page";
import ResumeBuilderPage from "./pages/resume-builder/ResumeBuilderPage";
import UserDashboard from "./components/userDashboard/UserDashboard";
import JobListPage from "./pages/job/JobListPage";
import ApplyJobPage from "./pages/job/ApplyJobPage";
import ProfilePage from "./pages/user/ProfilePage";
import FavoritesPage from "./pages/job/FavoritesPage";
import HelpJobSeekerPage from "./pages/misc/helpUser";
import ApplicationSuccessPage from "./pages/misc/ApplicationSuccess";  
/* ------------------------------------------------------------------ */
/* RootRedirect (unchanged)                                            */
/* ------------------------------------------------------------------ */
export function RootRedirect() {
  const auth = useContext(AuthContext)!;

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center h-screen">Loading…</div>
    );
  }

  if (auth.isAdmin) return <Navigate to="/admin" replace />;
  if (auth.isHR) return <Navigate to="/dashboard" replace />;
  if (auth.isAuthenticated) return <Navigate to="/Candidate" replace />;

  /* not logged in */
  return <Navigate to="/login" replace />;
}

/* ------------------------------------------------------------------ */
/* Main App                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">Loading…</div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster position="bottom-right" richColors />

      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* ---------------- AUTH (public) ---------------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/please-confirm-email" element={<PleaseConfirmEmail />} />
        <Route path="/activate/:uid/:token" element={<ActivateAccount />} />
        <Route path="/account" element={<ChangePasswordPage />} />

        {/* ---------------- ADMIN ---------------- */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<HRDashboard />} />
          <Route path="/signup-hr" element={<SignupPage />} />
          <Route path="/hr/:id" element={<HRDetailPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
        </Route>

        {/* ---------------- HR ---------------- */}
        <Route element={<HRProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/decisionsDashboard" element={<DecisionsDashboard />} />
          <Route path="/application/:id" element={<ApplicationDetailPage />} />
          <Route path="/jobpostings" element={<JobPostingListPage />} />
          <Route path="/jobpostings/new" element={<JobPostingFormPage />} />
          <Route path="/jobpostings/:id" element={<JobPostingDetailPage />} />
          <Route
            path="/jobpostings/:id/edit"
            element={<JobPostingFormPage />}
          />
          <Route path="/interviews/:id" element={<InterviewDetailsPage />} />
          <Route path="/interviews" element={<InterviewsDashboardPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Route>

        {/* ---------------- JOB SEEKER ---------------- */}
        <Route element={<JobSeekerProtectedRoute />}>
          <Route path="/new-resume" element={<ResumeBuilder />} />
          <Route path="/builder/:id" element={<ResumeBuilderPage />} />
          <Route path="/Candidate" element={<UserDashboard />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:jobId/apply" element={<ApplyJobPage />} />
          <Route path="/Candidate/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/helpu" element={<HelpJobSeekerPage />} />
          <Route path="/application-success/:id" element={<ApplicationSuccessPage />} />
        </Route>

        {/* ---------------- MISC ---------------- */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

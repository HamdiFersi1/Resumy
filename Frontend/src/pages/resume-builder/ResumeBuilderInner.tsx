// src/pages/resume-builder/ResumeBuilderInner.tsx
"use client";

import { useParams, Navigate } from "react-router-dom";
import { useParsedResume } from "@/lib/parsing/useParsedResume";
import { ResumeForm } from "@/components/Builder/ResumeForm";
import { Resume } from "@/components/Builder/Resume";
import { ResumeErrorBoundary } from "@/components/Builder/ResumeErrorBoundary";

export default function BuilderInner() {
  const { id } = useParams<{ id: string }>();

  const { loading, error } = useParsedResume();

  if (!id) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <div className="p-8 text-center">Loading resume…</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <main className="relative h-full w-full overflow-hidden bg-gray-50">
      <div className="grid grid-cols-3 md:grid-cols-6">
        <div className="col-span-3">
          <ResumeForm />
        </div>
        <div className="col-span-3">
          <ResumeErrorBoundary>
            <Resume />
          </ResumeErrorBoundary>
        </div>
      </div>
    </main>
  );
}

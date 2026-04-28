// src/components/ResumeControlBarCSR.tsx
"use client";

import { JSX, useEffect, useState } from "react";
import { useSetDefaultScale } from "./hooks";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../lib/redux/hooks";
import { selectResume } from "../../../lib/redux/resumeSlice";
import API from "@/apis/client";
import { ParsedResumeData, applyToJob } from "@/apis/resumeApi";

export const ResumeControlBarCSR = ({
  scale,
  setScale,
  documentSize,
  document: pdfDocument,
  fileName,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  // PDF instance from react-pdf
  const [instance, update] = usePDF({ document: pdfDocument });
  useEffect(() => {
    update(pdfDocument);
  }, [update, pdfDocument]);

  // Parsed resume ID from URL params
  const { id: parsedId } = useParams<{ id: string }>();
  // Job ID only if present in query string
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const jobId = jobIdParam ? Number(jobIdParam) : undefined;

  const navigate = useNavigate();
  const reduxResume = useAppSelector(selectResume);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Build payload from Redux state
  const transformedResume: ParsedResumeData = {
    name: reduxResume.profile.name,
    contact: {
      email: reduxResume.profile.email || "",
      phone: reduxResume.profile.phone || "",
    },
    summary: reduxResume.profile.summary || "",
    skills: reduxResume.skills.descriptions.join(", "),
    experience: reduxResume.workExperiences.map((exp) => ({
      company: exp.company || "Untitled",
      title: exp.jobTitle || "Untitled",
      date: exp.date || "N/A",
      description: exp.descriptions,
    })),
    education: reduxResume.educations.map((e) => ({
      school: e.school,
      degree: e.degree,
      date: e.date,
      additional_info: e.descriptions,
    })),
    projects: reduxResume.projects.map((proj) => ({
      title: proj.project || "Untitled",
      description: proj.descriptions,
    })),
  };

  // Confirm & Apply handler
  const handleConfirm = async () => {
    if (!parsedId || !jobId) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Trigger scoring
      await API.post(
        `/resumes/ResumeConfirmation/${parsedId}/confirm/${jobId}/`,
        transformedResume
      );
      // Create JobApplication
      await applyToJob(jobId, parseInt(parsedId), transformedResume);
      navigate(`/application-success/${parsedId}`);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Error state for PDF generation
  if (instance.error) {
    return (
      <div className="p-4 text-red-500">
        Error generating PDF: {String(instance.error)}
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-between px-[var(--resume-padding)] text-gray-600 bg-white border-t">
      {/* Zoom & Autoscale */}
      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-5 w-5" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={scale}
          onChange={(e) => {
            setScaleOnResize(false);
            setScale(Number(e.target.value));
          }}
        />
        <div className="w-10 text-center">{`${Math.round(scale * 100)}%`}</div>
        <label className="hidden lg:flex items-center gap-1">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((p) => !p)}
          />
          <span>Autoscale</span>
        </label>
      </div>

      {/* Download / Confirm & Apply */}
      <div className="flex items-center gap-4">
        {instance.loading ? (
          <span className="italic text-sm">Generating PDF…</span>
        ) : instance.url ? (
          <a
            href={instance.url}
            download={fileName}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-0.5 hover:bg-gray-100"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span className="whitespace-nowrap">Download Resume</span>
          </a>
        ) : (
          <span className="text-sm text-gray-500">PDF not ready yet</span>
        )}

        {/* Only show Confirm if jobId exists and resume is parsed */}
        {jobId && parsedId && (
          <button
            onClick={handleConfirm}
            disabled={submitting || instance.loading}
            className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Confirm & Apply"}
          </button>
        )}
      </div>

      {/* Submission error */}
      {submitError && <p className="text-red-500 mt-1">{submitError}</p>}
    </div>
  );
};

export const ResumeControlBarBorder = () => (
  <div className="absolute bottom-[var(--resume-control-bar-height)] w-full border-t" />
);

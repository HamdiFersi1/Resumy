// src/components/Application/index.tsx
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  Suspense,
  LazyExoticComponent,
  JSX,
} from "react";
// import { ResumeIframeCSR } from "../Builder/Resume/ResumeIFrame";
import { ResumeIframeCSRapp } from "./PDFstyles/ResumeIframeCSRApp";
import { ResumePDFSnapshot as ResumePDF } from "./ResumePDFSnapshot";
import { ResumeControlBarBorderApp } from "./PDFstyles/ControlBar";
import { ControlBarErrorBoundary } from "./PDFstyles/ControlBarErrorBoundary";
import { FlexboxSpacer } from "../Builder/styles/FlexboxSpacer";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "../Builder/styles/fonts/hooks";
import { NonEnglishFontsCSSLazyLoader } from "../Builder/styles/fonts/NonEnglishFontsCSSLoader";
import { DEBUG_RESUME_PDF_FLAG } from "../../lib/constants";

import type { Settings } from "../../lib/redux/settingsSlice";
import type {
  Resume as BuilderResume,
  ResumeProfile,
  ResumeSkills,
  ResumeCustom, // ← newly imported
} from "../../lib/redux/types";

const LazyResumeControlBarCSR: LazyExoticComponent<
  React.FC<{
    scale: number;
    setScale: (s: number) => void;
    documentSize: string;
    document: JSX.Element;
    fileName: string;
  }>
> = React.lazy(() =>
  import("./PDFstyles/ControlBar").then((m) => ({
    default: m.ResumeControlBarCSR,
  }))
);

/* ---------- Props expected from the details page ---------- */
export interface ResumeProps {
  snapshot: {
    name: string;
    skills: string;
    contact: { email?: string; phone?: string };
    summary?: string;
    projects: { title: string; description: string[] }[];
    education: {
      date: string;
      degree: string;
      school: string;
      additional_info: string[];
    }[];
    experience: {
      date: string;
      title: string;
      company: string;
      description: string[];
    }[];
    certifications?: string[];
  };
  settings: Settings;
}

export const ResumeSnapshot = ({ snapshot, settings }: ResumeProps) => {
  /* ----------------- 1. build the BuilderResume ----------------- */
  const resumeData: BuilderResume = useMemo(() => {
    /* a) profile */
    const profile: ResumeProfile = {
      name: snapshot.name,
      summary: snapshot.summary ?? "",
      email: snapshot.contact.email ?? "",
      phone: snapshot.contact.phone ?? "",
      location: "",
      url: "",
    };

    /* b) work experience */
    const workExperiences = snapshot.experience.map((e) => ({
      company: e.company,
      jobTitle: e.title,
      date: e.date,
      descriptions: e.description,
    }));

    /* c) education */
    const educations = snapshot.education.map((ed) => ({
      school: ed.school,
      degree: ed.degree,
      date: ed.date,
      descriptions: ed.additional_info ?? [],
    }));

    /* d) projects */
    const projects = snapshot.projects.map((p) => ({
      project: p.title,
      date: "",
      descriptions: p.description,
    }));

    /* e) skills */
    const skillItems = snapshot.skills
      .split(/[•,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const skills: ResumeSkills = {
      featuredSkills: [],
      descriptions: skillItems,
    };

    /* f) certifications → custom */
    const certItems = Array.isArray(snapshot.certifications)
      ? snapshot.certifications.map((c) => c.replace(/^•\s*/, "").trim())
      : [];
    const custom: ResumeCustom = { descriptions: certItems };

    return {
      profile,
      workExperiences,
      educations,
      projects,
      skills,
      custom,
    };
  }, [snapshot]);

  /* ----------------- 2. PDF viewer & control bar ----------------- */
  const [scale, setScale] = useState(0.8);
  const document = useMemo(
    () => <ResumePDF resume={resumeData} settings={settings} isPDF />,
    [resumeData, settings]
  );
  const pdfKey = JSON.stringify({ resumeData, settings });

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />

      {/* ---------- PDF section ---------- */}
      <div className="relative flex justify-center md:justify-start">
        <FlexboxSpacer maxWidth={50} className="hidden md:block" />
        <div className="relative w-full">
          <section
            className="h-[calc(100vh-var(--top-nav-bar-height)-var(--resume-control-bar-height))]
                       overflow-hidden md:p-[var(--resume-padding)]"
          >
            <ResumeIframeCSRapp
              documentSize={settings.documentSize}
              scale={scale}
              enablePDFViewer={DEBUG_RESUME_PDF_FLAG}
            >
              {document}
            </ResumeIframeCSRapp>
          </section>

          {mounted && (
            <ControlBarErrorBoundary>
              <Suspense fallback={null}>
                <LazyResumeControlBarCSR
                  key={pdfKey}
                  scale={scale}
                  setScale={setScale}
                  documentSize={settings.documentSize}
                  document={document}
                  fileName={`${snapshot.name} - Resume`}
                />
              </Suspense>
            </ControlBarErrorBoundary>
          )}
        </div>
        <ResumeControlBarBorderApp />
      </div>
    </>
  );
};

// src/components/Resume/Resume.tsx
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  Suspense,
  LazyExoticComponent,
  JSX,
} from "react";
import { ResumeIframeCSR } from "./ResumeIFrame";
import { ResumePDF } from "./ResumePDF";
import { ResumeControlBarBorder } from "./ResumeControlBar";
import { FlexboxSpacer } from "../styles/FlexboxSpacer";
import { useAppSelector } from "../../../lib/redux/hooks";
import { selectResume } from "../../../lib/redux/resumeSlice";
import { selectSettings } from "../../../lib/redux/settingsSlice";
import { DEBUG_RESUME_PDF_FLAG } from "../../../lib/constants";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "../styles/fonts/hooks";
import { NonEnglishFontsCSSLazyLoader } from "../styles/fonts/NonEnglishFontsCSSLoader";

const LazyResumeControlBarCSR: LazyExoticComponent<
  React.FC<{
    scale: number;
    setScale: (s: number) => void;
    documentSize: string;
    document: JSX.Element;
    fileName: string;
  }>
> = React.lazy(() =>
  import("./ResumeControlBar").then((mod) => ({
    default: mod.ResumeControlBarCSR,
  }))
);

export const Resume = () => {
 
  const [scale, setScale] = useState(0.8);
  const resume = useAppSelector(selectResume);
  const settings = useAppSelector(selectSettings);

  // build the PDF Document element
  const document = useMemo(
    () => <ResumePDF resume={resume} settings={settings} isPDF={true} />,
    [resume, settings]
  );

  // Produce a key that changes whenever *either* resume *or* settings changes:
  const pdfKey = useMemo(
    () => JSON.stringify({ resume, settings }),
    [resume, settings]
  );

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />
      <div className="relative flex justify-center md:justify-start">
        <FlexboxSpacer maxWidth={50} className="hidden md:block" />
        <div className="relative">
          <section className="h-[calc(100vh-var(--top-nav-bar-height)-var(--resume-control-bar-height))] overflow-hidden md:p-[var(--resume-padding)]">
            <ResumeIframeCSR
              documentSize={settings.documentSize}
              scale={scale}
              enablePDFViewer={DEBUG_RESUME_PDF_FLAG}
            >
              {document}
            </ResumeIframeCSR>
          </section>

          {mounted && (
            <Suspense fallback={null}>
              <LazyResumeControlBarCSR
                key={pdfKey}
                scale={scale}
                setScale={setScale}
                documentSize={settings.documentSize}
                document={document}
                fileName={`${resume.profile.name} - Resume`}
              />
            </Suspense>
          )}
        </div>

        <ResumeControlBarBorder />
      </div>
    </>
  );
};

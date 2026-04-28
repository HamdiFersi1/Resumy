// src/components/Builder/ResumePDF/common/SuppressResumePDFErrorMessage.tsx
"use client";

import React from "react";

/**
 * Suppress ResumePDF development errors.
 * See ResumePDF docstring for context.
 */
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  // keep original
  const originalConsoleError = console.error;
  const SUPPRESSED_WARNINGS = ["DOCUMENT", "PAGE", "TEXT", "VIEW"];

  // override
  console.error = function filterWarnings(
    msg: unknown,
    ...args: unknown[]
  ): void {
    if (typeof args[0] === "string") {
      for (const token of SUPPRESSED_WARNINGS) {
        if (args[0].includes(token)) {
          return;
        }
      }
    }

    originalConsoleError(msg, ...args);
  };
}

export const SuppressResumePDFErrorMessage: React.FC = () => null;

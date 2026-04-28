// src/components/Application/PDFstyles/ControlBar.tsx
"use client";

import { useEffect } from "react";
import type { JSX } from "react";
import { usePDF } from "@react-pdf/renderer";
import {
  Bars3Icon,
  MinusIcon,
  PlusIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { useSetDefaultScale } from "../../Builder/Resume/hooks";

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.5;
const SCALE_STEP = 0.1;

export const ResumeControlBarCSR = ({
  scale,
  setScale,
  documentSize,
  document: pdfDocument,
  fileName,
}: {
  scale: number;
  setScale: (s: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
}) => {
  // Start PDF generation on mount
  const [instance, update] = usePDF({ document: pdfDocument });
  useEffect(() => {
    update(pdfDocument); // kick off the render exactly once
  }, []);

  // Autoscale toggle logic
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  // Zoom in / out helpers
  const zoomOut = () => {
    setScaleOnResize(false);
    setScale(Math.max(scale - SCALE_STEP, MIN_SCALE));
  };
  const zoomIn = () => {
    setScaleOnResize(false);
    setScale(Math.min(scale + SCALE_STEP, MAX_SCALE));
  };
  const rotateCW = () =>
    document.body.dispatchEvent(new CustomEvent("resume-rotate-cw"));

  if (instance.error) {
    return (
      <div className="p-4 text-red-600">
        Error generating PDF: {String(instance.error)}
      </div>
    );
  }

  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-20 flex
                 h-[var(--resume-control-bar-height)] items-center gap-3
                 border-t bg-gray-100 px-2 text-gray-700"
    >
      {/* Hamburger + filename */}
      <button className="p-1 hover:bg-gray-200 rounded">
        <Bars3Icon className="h-5 w-5" />
      </button>
      <span className="truncate max-w-[180px] text-sm font-medium">
        {fileName}
      </span>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      {/* Zoom controls */}
      <button
        onClick={zoomOut}
        disabled={scale <= MIN_SCALE}
        className="p-1 hover:bg-gray-200 disabled:opacity-40 rounded"
      >
        <MinusIcon className="h-5 w-5" />
      </button>
      <span className="w-12 text-center text-sm">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={zoomIn}
        disabled={scale >= MAX_SCALE}
        className="p-1 hover:bg-gray-200 disabled:opacity-40 rounded"
      >
        <PlusIcon className="h-5 w-5" />
      </button>

      {/* Rotate (if wired up) */}
      <button onClick={rotateCW} className="p-1 hover:bg-gray-200 rounded">
        <ArrowPathIcon className="h-5 w-5" />
      </button>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      {/* Download / Print */}
      {instance.loading ? (
        <span className="text-sm italic">Rendering…</span>
      ) : instance.url ? (
        <>
          <a
            href={instance.url}
            download={fileName}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </a>
          <a
            href={instance.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-gray-200 rounded"
            title="Print"
          >
            <PrinterIcon className="h-5 w-5" />
          </a>
        </>
      ) : (
        <span className="text-sm text-gray-500">PDF not ready</span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Autoscale checkbox */}
      <label className="ml-3 hidden items-center gap-1 lg:flex">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={scaleOnResize}
          onChange={() => setScaleOnResize((p) => !p)}
        />
        <span className="text-sm">Autoscale</span>
      </label>
    </div>
  );
};

export const ResumeControlBarBorderApp = () => (
  <div
    className="absolute bottom-[var(--resume-control-bar-height)]
               w-full border-t-2 bg-gray-50"
  />
);

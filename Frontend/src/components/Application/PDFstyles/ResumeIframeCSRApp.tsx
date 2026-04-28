"use client";

import { useMemo } from "react";
import Frame from "react-frame-component";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  A4_WIDTH_PT,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
  LETTER_WIDTH_PT,
} from "../../../lib/constants";
import { getAllFontFamiliesToLoad } from "../../Builder/styles/fonts/lib";
import { lazy } from "react";

const getIframeInitialContent = (isA4: boolean) => {
  const width = isA4 ? A4_WIDTH_PT : LETTER_WIDTH_PT;
  const allFontFamilies = getAllFontFamiliesToLoad();

  const allFontFamiliesPreloadLinks = allFontFamilies
    .map(
      (
        font
      ) => `<link rel="preload" as="font" href="/fonts/${font}-Regular.ttf" type="font/ttf" crossorigin="anonymous">
<link rel="preload" as="font" href="/fonts/${font}-Bold.ttf" type="font/ttf" crossorigin="anonymous">`
    )
    .join("");

  const allFontFamiliesFontFaces = allFontFamilies
    .map(
      (
        font
      ) => `@font-face { font-family: "${font}"; src: url("/fonts/${font}-Regular.ttf"); }
@font-face { font-family: "${font}"; src: url("/fonts/${font}-Bold.ttf"); font-weight: bold; }`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    ${allFontFamiliesPreloadLinks}
    <style>
      ${allFontFamiliesFontFaces}

      /* Let the PDF body and root div grow to all pages */
      html, body, #react-frame-root {
        overflow: visible !important;
        height: auto !important;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body style="overflow: visible; width: ${width}pt; margin: 0; padding: 0; -webkit-text-size-adjust:none;">
    <div id="react-frame-root"></div>
  </body>
</html>`;
};

const ResumeIframe = ({
  documentSize,
  scale,
  children,
  enablePDFViewer = false,
}: {
  documentSize: string;
  scale: number;
  children: React.ReactNode;
  enablePDFViewer?: boolean;
}) => {
  const isA4 = documentSize === "A4";
  const iframeInitialContent = useMemo(
    () => getIframeInitialContent(isA4),
    [isA4]
  );

  if (enablePDFViewer) {
    return (
      <DynamicPDFViewer className="h-full w-full">
        {children as never}
      </DynamicPDFViewer>
    );
  }
  const width = isA4 ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const height = isA4 ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;

  return (
    <div
      style={{
        maxWidth: `${width * scale}px`,
        maxHeight: `${height * scale}px`,
      }}
    >
      {/* There is an outer div and an inner div here. The inner div sets the iframe width and uses transform scale to zoom in/out the resume iframe.
        While zooming out or scaling down via transform, the element appears smaller but still occupies the same width/height. Therefore, we use the 
        outer div to restrict the max width & height proportionally */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
        }}
        className={`origin-top-left bg-white shadow-lg`}
      >
        <Frame
          style={{ width: "100%", height: "100%" }}
          initialContent={iframeInitialContent}
          // key is used to force component to re-mount when document size changes
          key={isA4 ? "A4" : "LETTER"}
        >
          {children}
        </Frame>
      </div>
    </div>
  );
};
/**
 * Export just as before
 */
export const ResumeIframeCSRapp = ResumeIframe;

const DynamicPDFViewer = lazy(() =>
  import("@react-pdf/renderer").then((module) => ({
    default: module.PDFViewer,
  }))
);

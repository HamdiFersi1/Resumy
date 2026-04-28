import React, { useState, useEffect, lazy, Suspense } from "react";
import { getAllFontFamiliesToLoad } from "../fonts/lib";

const FontsZhCSR = lazy(() => import("../fonts/FontsZh"));

/**
 * Empty component to lazy‑load non‑English fonts CSS conditionally
 */
export const NonEnglishFontsCSSLazyLoader: React.FC = () => {
  const [shouldLoadFontsZh, setShouldLoadFontsZh] = useState(false);

  useEffect(() => {
    if (getAllFontFamiliesToLoad().includes("NotoSansSC")) {
      setShouldLoadFontsZh(true);
    }
  }, []);

  if (!shouldLoadFontsZh) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <FontsZhCSR />
    </Suspense>
  );
};

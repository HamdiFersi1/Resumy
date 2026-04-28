import { useEffect } from "react";
import { Font } from "@react-pdf/renderer";
import { ENGLISH_FONT_FAMILIES } from "../fonts/constants";
import { getAllFontFamiliesToLoad } from "../fonts/lib";

/**
 * Register all fonts to React PDF so it can render fonts correctly in PDF
 */
export const useRegisterReactPDFFont = () => {
  useEffect(() => {
    const allFontFamilies = getAllFontFamiliesToLoad();
    allFontFamilies.forEach((fontFamily) => {
      Font.register({
        family: fontFamily,
        fonts: [
          { src: `/fonts/${fontFamily}-Regular.ttf` },
          { src: `/fonts/${fontFamily}-Bold.ttf`, fontWeight: "bold" },
        ],
      });
    });
  }, []);
};

export const useRegisterReactPDFHyphenationCallback = (fontFamily: string) => {
  useEffect(() => {
    // 👉 Locally treat ENGLISH_FONT_FAMILIES as an array of strings,
    //    so includes() will accept any string without needing `any`.
    const englishFamilies: readonly string[] = ENGLISH_FONT_FAMILIES;

    if (englishFamilies.includes(fontFamily)) {
      // Disable hyphenation for English so words wrap normally
      Font.registerHyphenationCallback((word) => [word]);
    } else {
      // Workaround for non‑English wrapping
      Font.registerHyphenationCallback((word) =>
        word
          .split("")
          .map((char) => [char, ""])
          .flat()
      );
    }
  }, [fontFamily]);
};

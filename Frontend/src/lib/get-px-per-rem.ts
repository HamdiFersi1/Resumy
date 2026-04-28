export const getPxPerRem = () => {
  const bodyComputedStyle = getComputedStyle(
    document.querySelector("body")!
  ) as unknown;
  return parseFloat((bodyComputedStyle as CSSStyleDeclaration).fontSize) || 16;
};

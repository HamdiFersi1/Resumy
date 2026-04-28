// src/pages/resume-builder/ResumeBuilderPage.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import BuilderInner from "./ResumeBuilderInner";

export default function ResumeBuilderPage() {
  return (
    <Provider store={store}>
      <BuilderInner />
    </Provider>
  );
}

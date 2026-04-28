import React from "react";

export class ResumeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.error("PDF render error:", err);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-500">Could not render preview.</div>;
    }
    return this.props.children;
  }
}

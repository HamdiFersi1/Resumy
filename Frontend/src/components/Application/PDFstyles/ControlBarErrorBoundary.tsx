import React from "react";

export class ControlBarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log it somewhere, or just swallow
    console.error("Control bar crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render nothing if the control bar failed
      return null;
    }
    return this.props.children;
  }
}

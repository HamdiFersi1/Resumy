// src/components/ui/spinner.tsx
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // or your clsx helper

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

/** A simple spinner that accepts a `size` prop */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin", sizeMap[size], className)}
      strokeWidth={2}
      aria-label="Loading"
    />
  );
}

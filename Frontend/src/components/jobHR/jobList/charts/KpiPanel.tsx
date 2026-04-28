// src/components/jobList/charts/KpiPanel.tsx
"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

interface Props {
  totalJobs: number;
}

export function KpiPanel({ totalJobs }: Props) {
  const trendPercent = useMemo(
    () => Number((Math.random() * 10 - 5).toFixed(1)),
    []
  );

  return (
    <div>
      <div className="text-xl font-medium">Total Job Postings</div>
      <div className="text-sm text-muted-foreground">As of today</div>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-5xl font-bold">{totalJobs}</span>
        <div className="flex items-center gap-1 text-sm">
          <TrendingUp
            className={`h-5 w-5 ${
              trendPercent >= 0 ? "text-green-500" : "text-red-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

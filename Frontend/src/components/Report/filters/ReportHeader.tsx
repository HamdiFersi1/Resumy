// src/components/reports/filters/ReportHeader.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { format } from "date-fns";
import { JobOption } from "@/apis/HR/reportApi";

export type ViewType = "monthly";
export type CategoryType = "accepted" | "declined" | "interview" | "scored";

interface ReportHeaderProps {
  view: ViewType;
  category: CategoryType;
  date: Date;
  jobs: JobOption[];
  selectedJobId: number | null;
  onViewChange: (v: ViewType) => void;
  onCategoryChange: (c: CategoryType) => void;
  onJobChange: (jobId: number | null) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  view,
  category,
  date,
  jobs,
  selectedJobId,
  onViewChange,
  onCategoryChange,
  onJobChange,
  onPrev,
  onNext,
}) => {
  const label = React.useMemo(
    () =>
      view === "monthly" ? format(date, "LLLL yyyy") : format(date, "yyyy"),
    [view, date]
  );

  const categories: CategoryType[] = [
    "accepted",
    "declined",
    "interview",
    "scored",
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* LEFT: View & Category & Job */}
      <div className="flex flex-wrap items-center gap-4">
        {/* VIEW */}
        <div className="flex items-center gap-2">
          <span className="font-medium">View:</span>
          {(["monthly"] as ViewType[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? "default" : "outline"}
              onClick={() => onViewChange(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>

        {/* CATEGORY */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Category:</span>
          {categories.map((c) => {
            const displayLabel = c === "scored" ? "Pending" : c.charAt(0).toUpperCase() + c.slice(1);
            return (
              <Button
          key={c}
          size="sm"
          variant={category === c ? "default" : "outline"}
          onClick={() => onCategoryChange(c)}
              >
          {displayLabel}
              </Button>
            );
          })}
        </div>

        {/* JOB */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Job:</span>
          <select
            value={selectedJobId ?? ""}
            onChange={(e) =>
              onJobChange(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-md border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RIGHT: navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrev}>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div className="px-4 py-1 rounded-md bg-muted text-sm font-medium">
          {label}
        </div>
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

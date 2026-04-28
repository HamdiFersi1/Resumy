// src/components/decisionDashboard/DecisionFilterToolbar.tsx
"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Define the union once here:
export type StatusFilter = "all" | "accepted" | "declined";

export interface DecisionFilterToolbarProps {
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  jobId?: number;
  jobOptions: Array<{ id: number; label: string }>;
  onJobChange: (value: number | undefined) => void;
  ordering: string;
  onOrderingChange: (value: string) => void;
}

export default function DecisionFilterToolbar({
  status,
  onStatusChange,
  jobId,
  jobOptions,
  onJobChange,
  ordering,
  onOrderingChange,
}: DecisionFilterToolbarProps) {
  return (
    <div className="mt-4 flex justify-end space-x-4">
      {/* Status filter */}
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as StatusFilter)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="declined">Declined</SelectItem>
        </SelectContent>
      </Select>

      {/* Job filter */}
      <Select
        value={jobId !== undefined ? jobId.toString() : "all"}
        onValueChange={(v) => onJobChange(v === "all" ? undefined : Number(v))}
      >
        <SelectTrigger className="w-60 truncate">
          <SelectValue placeholder="All Jobs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Jobs</SelectItem>
          {jobOptions.map((j) => (
            <SelectItem key={j.id} value={j.id.toString()}>
              {j.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Ordering filter */}
      <Select value={ordering} onValueChange={(v) => onOrderingChange(v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Order by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-score_json__total_score">Score ↓</SelectItem>
          <SelectItem value="score_json__total_score">Score ↑</SelectItem>
          <SelectItem value="-applied_at">Date ↓</SelectItem>
          <SelectItem value="applied_at">Date ↑</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

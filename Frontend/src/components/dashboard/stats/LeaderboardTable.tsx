"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Application } from "@/apis/HR/applicationApi";
import { CandidateComparisonChart } from "./CandidateComparisonChart";

interface LeaderboardTableProps {
  applications: Application[];
  allApplications: Application[];
  page: number;
  perPage: number;
  totalPages: number;
  pagingEnabled: boolean;
  sortField: "score" | "date";
  sortDirection: "asc" | "desc";
  onSort: (field: "score" | "date") => void;
  onPageChange: (page: number) => void;
  onRowClick: (id: number) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  selectedJobTitle: string;
  onJobTitleSelect: (title: string) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  applications,
  allApplications,
  page,
  perPage,
  totalPages,
  pagingEnabled,
  sortField,
  sortDirection,
  onSort,
  onPageChange,
  onRowClick,
  selectedDate,
  onDateSelect,
  selectedJobTitle,
  onJobTitleSelect,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectedCandidates = applications.filter((a) =>
    selectedIds.includes(a.id)
  );

  const jobTitles = Array.from(
    new Set(allApplications.map((a) => a.job_title))
  );

  const btnLabel = selectedDate
    ? selectedDate.toLocaleDateString()
    : "Filter by date";

  return (
    <Card className="w-full overflow-hidden bg-background text-foreground">
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription className="text-muted-foreground">
            {applications.length} candidate
            {applications.length !== 1 && "s"}
            {selectedDate && (
              <>
                {" "}on&nbsp;<strong>{btnLabel}</strong>
              </>
            )}
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1 text-sm">
            Sort&nbsp;by
            <select
              value={sortField}
              onChange={(e) => onSort(e.target.value as "score" | "date")}
              className="px-2 py-1 border bg-background text-foreground rounded-md"
            >
              <option value="score">Score</option>
              <option value="date">Date</option>
            </select>
          </label>

          <label className="flex items-center gap-1 text-sm">
            Direction
            <select
              value={sortDirection}
              onChange={() => onSort(sortField)}
              className="px-2 py-1 border bg-background text-foreground rounded-md"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>

          <label className="flex items-center gap-1 text-sm">
            Job Title
            <select
              value={selectedJobTitle}
              onChange={(e) => onJobTitleSelect(e.target.value)}
              className="px-2 py-1 border bg-background text-foreground rounded-md"
            >
              <option value="">All</option>
              {jobTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </label>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <CalendarIcon className="h-4 w-4" />
                {btnLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-2 w-auto bg-popover text-popover-foreground">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(d) => onDateSelect(d ?? null)}
                initialFocus
              />
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onDateSelect(null)}
                >
                  Clear filter
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">#</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied At</TableHead>
              <TableHead className="text-center">✔</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-muted">
            {applications.map((a, i) => (
              <TableRow
                key={a.id}
                className={`cursor-pointer hover:bg-muted/20 ${
                  selectedIds.includes(a.id) ? "bg-primary/10" : ""
                }`}
                onClick={() => onRowClick(a.id)}
              >
                <TableCell className="font-medium">
                  {i + 1 + (pagingEnabled ? (page - 1) * perPage : 0)}
                </TableCell>
                <TableCell>{a.applicant}</TableCell>
                <TableCell>{a.job_title}</TableCell>
                <TableCell className="text-right">
                  {((a.total_score ?? 0) * 100).toFixed(2)}%
                </TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>
                  {new Date(a.applied_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedIds.includes(a.id)}
                    onCheckedChange={() => handleToggleSelect(a.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {pagingEnabled && (
        <CardFooter className="justify-center gap-4 text-sm text-muted-foreground">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          Page&nbsp;<strong>{page}</strong>&nbsp;of&nbsp;
          <strong>{totalPages}</strong>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </CardFooter>
      )}

      {selectedCandidates.length >= 2 && (
        <CandidateComparisonChart
          candidates={selectedCandidates}
          selectedJobTitle={selectedJobTitle}
          height={120} // smaller chart height for better visual balance
        />
      )}
    </Card>
  );
};

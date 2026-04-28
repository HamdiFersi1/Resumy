"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
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
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface InterviewListTableProps {
  interviews: Array<{
    id: number;
    scheduled_at: string | null;
    created_at: string;
    questions: string[];
    applicationId: number;
    applicant: string;
    jobDisplay: string;
    done: boolean;
  }>;
  page: number;
  perPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onFilteredChange?: (
    filtered: InterviewListTableProps["interviews"],
    selectedDate?: Date | null,
    filterField?: "scheduled_at" | "created_at"
  ) => void;
}

export function InterviewListTable({
  interviews,
  page,
  perPage,
  totalPages,
  onPageChange,
  onFilteredChange,
}: InterviewListTableProps) {
  const navigate = useNavigate();

  const [filterField, setFilterField] = useState<"scheduled_at" | "created_at">("scheduled_at");
  const [doneFilter, setDoneFilter] = useState<"all" | "done" | "not_done">("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const raw = useMemo(() => interviews, [interviews]);

  const filtered = useMemo(() => {
    return raw.filter((iv) => {
      if (doneFilter === "done" && !iv.done) return false;
      if (doneFilter === "not_done" && iv.done) return false;
      return true;
    });
  }, [raw, doneFilter]);

  const [displayed, setDisplayed] = useState(filtered);

  useEffect(() => {
    if (!selectedDate) setDisplayed(filtered);
  }, [filtered, selectedDate]);

  useEffect(() => {
    onFilteredChange?.(displayed, selectedDate, filterField);
  }, [displayed, selectedDate, filterField]);

  const counts: Record<string, number> = {};
  filtered.forEach((iv) => {
    const val = iv[filterField];
    if (val) {
      const key = new Date(val).toDateString();
      counts[key] = (counts[key] ?? 0) + 1;
    }
  });

  const classify = (day: Date) => {
    const n = counts[day.toDateString()] ?? 0;
    if (n > 5) return "many";
    if (n > 2) return "mid";
    if (n > 0) return "few";
    return undefined;
  };

  const handleDateSelect = (d: Date | null) => {
    if (d) {
      const matched = filtered.filter((iv) => {
        const val = iv[filterField];
        return val && new Date(val).toDateString() === d.toDateString();
      });
      if (matched.length === 0) {
        toast.error(`No interviews on ${d.toLocaleDateString()} (${filterField})`);
        return;
      }
      setDisplayed(matched);
      setSelectedDate(d);
    } else {
      setDisplayed(filtered);
      setSelectedDate(null);
    }
  };

  const btnLabel = selectedDate
    ? `${selectedDate.toLocaleDateString()} (${filterField === "scheduled_at" ? "Scheduled" : "Accepted"})`
    : `Filter by date (${filterField === "scheduled_at" ? "Scheduled" : "Accepted"})`;

  function getDateClass(scheduled: string | null) {
    if (!scheduled) return "text-muted-foreground";
    const days = differenceInCalendarDays(new Date(scheduled), new Date());
    if (days < 0) return "text-red-500";
    if (days < 7) return "text-orange-500";
    return "text-green-500";
  }

  return (
    <Card className="w-full overflow-x-auto">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <CardTitle>Scheduled Interviews</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filterField}
            onValueChange={(v) => {
              const field = v as "scheduled_at" | "created_at";
              setFilterField(field);
              setSelectedDate(null);
              setDisplayed(filtered);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled_at">Scheduled Date</SelectItem>
              <SelectItem value="created_at">Accepted Date</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={doneFilter}
            onValueChange={(v) => setDoneFilter(v as "all" | "done" | "not_done")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Done Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="not_done">Not Done</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {btnLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-4 w-auto rounded-lg shadow-lg">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(d) => handleDateSelect(d ?? null)}
                modifiers={{
                  few: (d) => classify(d) === "few",
                  mid: (d) => classify(d) === "mid",
                  many: (d) => classify(d) === "many",
                }}
                modifiersClassNames={{
                  few: "bg-muted-foreground/30 text-white rounded-md",
                  mid: "bg-orange-500 text-white rounded-md",
                  many: "bg-red-600 text-white rounded-md",
                }}
                initialFocus
              />
              {selectedDate && (
                <>
                  <Separator className="my-2" />
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => handleDateSelect(null)}>
                    Clear filter
                  </Button>
                </>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">#</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Scheduled At</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Accepted At</TableHead>
              <TableHead>Done</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-muted">
            {displayed.map((iv, idx) => {
              const isClose =
                iv.scheduled_at &&
                differenceInCalendarDays(new Date(iv.scheduled_at), new Date()) < 7;
              return (
                <TableRow key={iv.id}>
                  <TableCell>{(page - 1) * perPage + idx + 1}</TableCell>
                  <TableCell>{iv.jobDisplay}</TableCell>
                  <TableCell>{iv.applicant}</TableCell>
                  <TableCell className={getDateClass(iv.scheduled_at)}>
                    {iv.scheduled_at
                      ? new Date(iv.scheduled_at).toLocaleString()
                      : "Not scheduled"}
                    {isClose && <Badge variant="destructive" className="ml-2">Close</Badge>}
                  </TableCell>
                  <TableCell>{iv.questions.length}</TableCell>
                  <TableCell>{new Date(iv.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        iv.done
                          ? "bg-green-500 text-white"
                          : "bg-yellow-400 text-black"
                      }
                    >
                      {iv.done ? "Done" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => navigate(`/interviews/${iv.id}`)}
                      className="flex items-center text-sm text-primary hover:underline"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="justify-center gap-4 text-sm">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
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
    </Card>
  );
}

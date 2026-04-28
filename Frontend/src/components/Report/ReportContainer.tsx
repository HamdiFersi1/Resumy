/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Rapport/RapportContainer.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { addMonths, subMonths, startOfMonth } from "date-fns";

import API from "@/apis/client";
import { fetchJobOptions, JobOption, getCsvUrl } from "@/apis/HR/reportApi";

import { ReportHeader, CategoryType } from "./filters/ReportHeader";
import { MonthlyHeatmap } from "./charts/MonthlyHeatmap";
import { JobPopularityRadial } from "./charts/JobPopularityChart";
import { JobComparisonChart } from "./charts/JobComparisonChart";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

// ShadCN / Radix UI components
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

export function ReportContainer() {
  const MIN_MONTH = new Date(2025, 0, 1);
  const MAX_MONTH = startOfMonth(new Date());

  // ─── (1) JOBS & SELECTED JOB ───────────────────────────────────
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  useEffect(() => {
    fetchJobOptions().then((opts) => {
      setJobs(opts);
      // By default, we start at “All jobs” => jobId = null
    });
  }, []);

  // ─── (2) CATEGORY & MONTHState ───────────────────────────────────
  const [category, setCategory] = useState<CategoryType>("accepted");
  const [date, setDate] = useState<Date>(startOfMonth(new Date()));

  const handlePrev = () => {
    setDate((cur) => {
      const prev = subMonths(cur, 1);
      return prev < MIN_MONTH ? cur : prev;
    });
  };
  const handleNext = () => {
    setDate((cur) => {
      const nxt = addMonths(cur, 1);
      return nxt > MAX_MONTH ? cur : nxt;
    });
  };

  // Format our “YYYY-MM-DD” for passing to export endpoints
  const isoDate = date.toISOString().slice(0, 10);

  // ─── (3) EXPORT DIALOG STATE ─────────────────────────────────────
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [modalFetchError, setModalFetchError] = useState<string | null>(null);

  // Once the dialog opens, fetch all available dates for this job:
  // (AvailableDate[] = { date: "YYYY-MM-DD", accepted: number, declined: number, interview: number, scored: number })
  const [availableDates, setAvailableDates] = useState<
    {
      date: string;
      accepted: number;
      declined: number;
      interview: number;
      scored: number;
    }[]
  >([]);

  // Which single day the user picks inside the Calendar modal:
  const [selectedExportDate, setSelectedExportDate] = useState<
    Date | undefined
  >(undefined);

  // When the dialog is opened, fetch /available-dates/?job_id=…
  useEffect(() => {
    if (isExportDialogOpen) {
      // Reset any previous state
      setAvailableDates([]);
      setSelectedExportDate(undefined);
      setModalFetchError(null);

      // Build the URL to fetch: /applications/reports/available-dates/?job_id=…
      let url = `/applications/reports/available-dates/`;
      if (selectedJobId != null) {
        url += `?job_id=${selectedJobId}`;
      }
      API.get<
        {
          date: string;
          accepted: number;
          declined: number;
          interview: number;
          scored: number;
        }[]
      >(url)
        .then((res) => {
          setAvailableDates(res.data);
        })
        .catch((err) => {
          console.error("Failed to load available dates:", err);
          setModalFetchError("Could not load calendar data. Try again later.");
        });
    }
  }, [isExportDialogOpen, selectedJobId]);

  // Build a Set of “YYYY-MM-DD” strings where the chosen category has count > 0:
  const enabledDateSet = useMemo(() => {
    const s = new Set<string>();
    for (const rec of availableDates) {
      // If category count > 0, add that date to the set:
      if ((rec as any)[category] > 0) {
        s.add(rec.date);
      }
    }
    return s;
  }, [availableDates, category]);

  // ─── (4) EXPORT HANDLERS ─────────────────────────────────────────
  // a) CSV for the chosen day
  const handleDownloadCsv = async () => {
    if (!selectedExportDate) return;
    const dayIso = selectedExportDate.toISOString().slice(0, 10);

    try {
      const relativeCsvPath = getCsvUrl(
        dayIso,
        category,
        selectedJobId ?? undefined
      );
      const response = await API.get<Blob>(relativeCsvPath, {
        responseType: "blob",
      });

      // Download
      const suffix = selectedJobId != null ? `_job_${selectedJobId}` : "";
      const filename = `report_${category}_${dayIso}${suffix}.csv`;
      const blob = new Blob([response.data], { type: "text/csv" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      // Close the dialog after download
      setIsExportDialogOpen(false);
    } catch (err) {
      console.error("CSV download failed:", err);
      // Optional: show a toast or set an error in modal
    }
  };

  // b) PDF for the chosen day
  const handleDownloadPdf = async () => {
    if (!selectedExportDate) return;
    const dayIso = selectedExportDate.toISOString().slice(0, 10);

    try {
      // IMPORTANT: The backend’s PDF endpoint is /export-pdf/ (start & end)
      let relativePdfPath = `/applications/reports/export-pdf/?start=${dayIso}&end=${dayIso}`;
      if (selectedJobId != null) {
        relativePdfPath += `&job_id=${selectedJobId}`;
      }

      const response = await API.get<Blob>(relativePdfPath, {
        responseType: "blob",
      });

      // Download
      const suffix = selectedJobId != null ? `_job_${selectedJobId}` : "";
      const filename = `hr_report_${dayIso}${suffix}.pdf`;
      const blob = new Blob([response.data], { type: "application/pdf" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      // Close the dialog
      setIsExportDialogOpen(false);
    } catch (err) {
      console.error("PDF download failed:", err);
      // Optional: show a toast or set an error in modal
    }
  };

  // ─── (5) RENDER ───────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">HR Export Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Monthly heatmap of applications by status.
      </p>

      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <ReportHeader
        view="monthly"
        category={category}
        date={date}
        jobs={jobs}
        selectedJobId={selectedJobId}
        onViewChange={() => {}}
        onCategoryChange={setCategory}
        onJobChange={setSelectedJobId}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* ─── SINGLE CARD: Heatmap + Radial + “Open Export Dialog” ────── */}
      <Card className="max-w-6xl mx-auto">
        {/* CARD HEADER */}
        <CardHeader>
          <CardTitle>
            {date.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}{" "}
            — {category.charAt(0).toUpperCase() + category.slice(1)}
          </CardTitle>
        </CardHeader>

        {/* CARD CONTENT */}
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <MonthlyHeatmap
              jobId={selectedJobId}
              type={category}
              month={date}
              noCard={true} // skip its own Card wrapper
            />
          </div>
          <div>
            {selectedJobId != null ? (
              <JobPopularityRadial jobId={selectedJobId} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a job to see its popularity.</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* CARD FOOTER: “Open Export Dialog” */}
        <CardFooter className="flex justify-end">
          <Dialog
            open={isExportDialogOpen}
            onOpenChange={setIsExportDialogOpen}
          >
            <DialogTrigger asChild>
              <button
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Export Report
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select a date to export</DialogTitle>
                <DialogDescription>
                  Only days with {category} &nbsp;
                  {selectedJobId != null
                    ? `(job ID =${selectedJobId})`
                    : `(all jobs)`}{" "}
                  are enabled.
                </DialogDescription>
              </DialogHeader>

              {modalFetchError ? (
                <p className="mt-4 text-sm text-red-600">{modalFetchError}</p>
              ) : (
                <>
                  <div className="mt-4">
                    <Calendar
                      mode="single"
                      selected={selectedExportDate}
                      onSelect={(d) => setSelectedExportDate(d || undefined)}
                      fromDate={new Date(2025, 0, 1)}
                      toDate={new Date()}
                      // Disable any day that is not in our enabledDateSet:
                      disabled={(dateObj) => {
                        const iso = dateObj.toISOString().slice(0, 10);
                        return !enabledDateSet.has(iso);
                      }}
                    />
                  </div>

                  <DialogFooter className="flex justify-between items-center">
                    <DialogClose
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      Cancel
                    </DialogClose>
                    <div className="space-x-2">
                      <button
                        onClick={handleDownloadCsv}
                        disabled={!selectedExportDate}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Download CSV
                      </button>
                      <button
                        onClick={handleDownloadPdf}
                        disabled={!selectedExportDate}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Download PDF
                      </button>
                    </div>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {/* ─── OPTIONAL: Job Comparison Chart ───────────────────────────── */}
      <JobComparisonChart jobs={jobs} category={category} month={date} />

      <hr />
    </div>
  );
}

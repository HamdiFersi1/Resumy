// src/components/SectionCards.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ApplicationsDonutChart } from "./charts/ApplicationsDonutChart";
import ApplicationsAvgTotalScoreChart from "./charts/ApplicationsAvgScoreChart";
import { ApplicationsMonthlyChart } from "./charts/ApplicationsMonthlyChart";
import { ApplicationsScoreRadarChart } from "./charts/ApplicationsScoreRadarChart";
import { LeaderboardTable } from "./stats/LeaderboardTable";
import { Card, CardContent } from "@/components/ui/card";

import {
  LeaderboardArgs,
  useGetLeaderboardQuery,
} from "@/lib/redux/tableStoring";

import { fetchDailyApplicationCounts } from "@/apis/HR/applicationApi";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface SectionCardsProps {
  jobId: number;
}

export function SectionCards({ jobId }: SectionCardsProps) {
  // ─── Charts-by-Job Filter ─────────────────────────────
  const [chartJobs, setChartJobs] = useState<{ id: number; title: string }[]>(
    []
  );
  const [chartJobId, setChartJobId] = useState<number | undefined>(jobId);

  useEffect(() => {
    fetchDailyApplicationCounts()
      .then((analytics) => {
        const list = analytics.top_jobs_by_volume.map((j) => ({
          id: j.job_id,
          title: j.job__title,
        }));
        setChartJobs(list);
      })
      .catch(console.error);
  }, []);

  // derive the selected job’s title (falls back to All Jobs)
  const chartJobTitle =
    chartJobId != null
      ? chartJobs.find((j) => j.id === chartJobId)?.title ?? ""
      : "All Jobs";

  // ─── Leaderboard State (unchanged) ────────────────────────
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"score" | "date">("date");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [picked, setPicked] = useState<Date | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState("");

  const handleJobTitleSelect = (title: string) => setSelectedJobTitle(title);
  const PER_PAGE = 10;
  const apiOrdering =
    (dir === "asc" ? "" : "-") + (sortBy === "score" ? "score" : "applied_at");

  const args: LeaderboardArgs = {
    jobId,
    page,
    ordering: apiOrdering,
    pageSize: PER_PAGE,
  };

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetLeaderboardQuery(args, {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      pollingInterval: 30_000,
    });

  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  const raw: any[] = data?.results ?? [];
  const totalCount = data?.count ?? raw.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  const jobFiltered = selectedJobTitle
    ? raw.filter((a) => a.job_title === selectedJobTitle)
    : raw;

  const dateFiltered = picked
    ? jobFiltered.filter(
        (a) => new Date(a.applied_at).toDateString() === picked.toDateString()
      )
    : jobFiltered;

  const mul = dir === "asc" ? 1 : -1;
  const rows = [...dateFiltered].sort((a, b) => {
    if (sortBy === "score") {
      return ((a.total_score ?? 0) - (b.total_score ?? 0)) * mul;
    }
    return (
      (new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()) *
      mul
    );
  });

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSort = (field: "score" | "date") => {
    if (field === sortBy) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setDir("desc");
    }
    setPage(1);
  };

  const navigate = useNavigate();
  if (isLoading) return <div className="p-4 text-center">Loading…</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        {(error as any)?.status ?? ""} – failed to load leaderboard.
      </div>
    );

  const handleDateSelect = (d: Date | null) => {
    if (d) {
      const filtered = raw.filter(
        (a) => new Date(a.applied_at).toDateString() === d.toDateString()
      );
      if (!filtered.length) {
        toast.error(`No applicants on ${d.toLocaleDateString()}`);
        return;
      }
    }
    setPicked(d);
    setPage(1);
  };

  return (
    <div className="p-6">
      {/* ─── Chart-by-Job Selector ───────────────────────────── */}
      <div className="mb-4 flex items-center space-x-2">
        <Label htmlFor="chart-job" className="text-sm font-medium">
          Charts by Job:
        </Label>
        <Select
          value={chartJobId != null ? chartJobId.toString() : "all"}
          onValueChange={(val) =>
            setChartJobId(val === "all" ? undefined : Number(val))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Jobs">{chartJobTitle}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {chartJobs.map((j) => (
              <SelectItem key={j.id} value={j.id.toString()}>
                {j.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── Charts Row (now filtered) ───────────────────────── */}
      <div className="flex flex-wrap gap-6 items-start mb-6">
        <ApplicationsMonthlyChart jobId={chartJobId} jobTitle={chartJobTitle} />
        <ApplicationsDonutChart jobId={chartJobId} jobTitle={chartJobTitle} />
        <ApplicationsAvgTotalScoreChart
          jobId={chartJobId}
          jobTitle={chartJobTitle}
        />
        <ApplicationsScoreRadarChart
          jobId={chartJobId}
          jobTitle={chartJobTitle}
        />
      </div>

      {/* ─── Leaderboard Table (unchanged) ─────────────────── */}
      <LeaderboardTable
        applications={rows}
        allApplications={raw}
        page={page}
        perPage={PER_PAGE}
        totalPages={totalPages}
        pagingEnabled={!picked}
        sortField={sortBy}
        sortDirection={dir}
        onSort={toggleSort}
        onPageChange={setPage}
        onRowClick={(id) => navigate(`/application/${id}?jobId=${jobId}`)}
        selectedDate={picked}
        onDateSelect={handleDateSelect}
        selectedJobTitle={selectedJobTitle}
        onJobTitleSelect={handleJobTitleSelect}
      />

      {isFetching && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Updating rows…
        </div>
      )}
    </div>
  );
}

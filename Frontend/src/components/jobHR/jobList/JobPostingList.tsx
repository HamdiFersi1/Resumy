// src/components/jobList/JobPostingList.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import jobApi, { Job } from "@/apis/jobApi";

import { SearchHeader } from "./SearchHeader";
import { ChartsSection } from "./ChartsSection";
import { JobCardGrid } from "./JobCardGrid";

export function JobPostingList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"month" | "weekday">("month");

  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    jobApi
      .getPaginated({ search: filter })
      .then(({ results }) => setJobs(results))
      .catch(() => setError("Failed to load job postings."))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this job posting?")) return;
    await jobApi.delete(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleCloseJob = async (id: number) => {
    try {
      await jobApi.closeJob(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_open: false } : j))
      );
    } catch (err) {
      console.error("Failed to close job", err);
    }
  };

  const handleReopenJob = async (id: number) => {
    try {
      await jobApi.reopenJob(id);
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, is_open: true } : j))
      );
    } catch (err) {
      console.error("Failed to reopen job", err);
    }
  };

  const handleFilterChange = (v: string) =>
    v ? setSearchParams({ search: v }) : setSearchParams({});
  const clearFilter = () => setSearchParams({});

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <SearchHeader
        filter={filter}
        onFilterChange={handleFilterChange}
        onClear={clearFilter}
      />
      <ChartsSection
        jobs={jobs}
        loading={loading}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
      />
      <JobCardGrid
        jobs={jobs}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        onClose={handleCloseJob}
        onReopen={handleReopenJob}
      />
    </div>
  );
}

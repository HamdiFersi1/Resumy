// src/components/decisionDashboard/DecisionDashboardContainer.tsx
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  fetchDecisions,
  DecisionFilters,
  Decisions,
} from "@/apis/HR/decisionsApi";
import DecisionFilterToolbar, { StatusFilter } from "./DecisionFilterToolbar";
import DecisionLeaderboardTable from "./DecisionLeaderboard";
import { DecisionRadialChart } from "./charts/DecisionRadialChart";
import { DecisionLineChart } from "./charts/DecisionLineChart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { AppSidebar } from "../dashboard/components/side-bar";
import { SiteHeader } from "../dashboard/components/site-header";
import { SiteNavbar } from "../dashboard/components/site-navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DecisionDashboardContainer() {
  // ── Filters
  const [status, setStatus] = useState<StatusFilter>("accepted");
  const [jobId, setJobId] = useState<number | undefined>(undefined);
  const [ordering, setOrdering] = useState("-score_json__total_score");
  const [page, setPage] = useState(1);

  // ── Data + counts
  const [decisions, setDecisions] = useState<Decisions[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);

  const perPage = 10;
  const totalPages = Math.ceil(totalCount / perPage);

  // ── Cache “all jobs” when no job filter
  const allJobOptionsRef = useRef<Array<{ id: number; label: string }>>([]);

  // ── Load a page
  const loadPage = useCallback(async () => {
    const filters: DecisionFilters = {
      ...(status !== "all" ? { status } : {}),
      page,
      ordering,
      ...(jobId !== undefined ? { job: jobId } : {}),
    };
    const data = await fetchDecisions(filters);
    setDecisions(data.results);
    setTotalCount(data.count);
  }, [status, jobId, page, ordering]);

  // ── Load counts
  const loadCounts = useCallback(async () => {
    const acc = await fetchDecisions({
      status: "accepted",
      ...(jobId !== undefined ? { job: jobId } : {}),
    });
    const dec = await fetchDecisions({
      status: "declined",
      ...(jobId !== undefined ? { job: jobId } : {}),
    });
    setAcceptedCount(acc.count);
    setDeclinedCount(dec.count);
  }, [jobId]);

  useEffect(() => {
    loadPage();
    loadCounts();
  }, [loadPage, loadCounts]);

  // ── Build job dropdown options
  useEffect(() => {
    if (jobId === undefined) {
      const map = new Map<number, string>();
      decisions.forEach((d) =>
        map.set(d.job.id, `${d.job.company_name} — ${d.job.title}`)
      );
      allJobOptionsRef.current = Array.from(map.entries()).map(
        ([id, label]) => ({ id, label })
      );
    }
  }, [decisions, jobId]);
  const jobOptions = allJobOptionsRef.current;

  // ── Table data
  const tableData = useMemo(
    () =>
      decisions.map((d) => ({
        id: d.id,
        applicant: d.applicant,
        job_title: `${d.job.company_name} — ${d.job.title}`,
        status: d.status,
        total_score: d.total_score,
        applied_at: d.applied_at,
      })),
    [decisions]
  );

  // compute radial count
  const radialCount =
    status === "accepted"
      ? acceptedCount
      : status === "declined"
      ? declinedCount
      : acceptedCount + declinedCount;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <SiteNavbar />

        <div className="p-6 space-y-6">
          {/* 1) Time-Series Chart */}
          <DecisionLineChart
            jobId={jobId}
            count={acceptedCount + declinedCount}
          />

          {/* 2) Filters + summary + table */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Decision Dashboard</CardTitle>
                <CardDescription>
                  View accepted, declined, or all candidates.
                </CardDescription>
              </div>
              <DecisionFilterToolbar
                status={status}
                onStatusChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                jobId={jobId}
                jobOptions={jobOptions}
                onJobChange={(v) => {
                  setJobId(v);
                  setPage(1);
                }}
                ordering={ordering}
                onOrderingChange={(v) => {
                  setOrdering(v);
                  setPage(1);
                }}
              />
            </CardHeader>

            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-0">
              {/* 3) Radial chart */}
              <DecisionRadialChart status={status} count={radialCount} />

              {/* 4) Table */}
              <DecisionLeaderboardTable
                decisions={tableData}
                page={page}
                perPage={perPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

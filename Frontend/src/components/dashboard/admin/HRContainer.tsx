"use client";

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar"; // ← use admin sidebar
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { Loader2 } from "lucide-react";

import { useHrUserDetail } from "@/hooks/admin/useHrUserDetail";
import {
  HRDetailChart,
  ChartTab,
} from "@/components/dashboard/admin/details/HRDetailKpi";
import {
  HRDetailTables,
  ApplicationSummary,
  InterviewSummary,
} from "@/components/dashboard/admin/details/HRDetailTables";
import { JobPostingTable } from "@/components/dashboard/admin/details/JobPostingTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function HRDetailContainer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hrId = id ? parseInt(id, 10) : undefined;
  const { detail: hr, loading, error } = useHrUserDetail(hrId);

  const [activeTab, setActiveTab] = useState<ChartTab>("accepted");
  const [accFilter, setAccFilter] = useState("");
  const [decFilter, setDecFilter] = useState("");
  const [intFilter, setIntFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  if (hrId === undefined) {
    return <p className="p-6 text-red-600">Invalid HR ID.</p>;
  }

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" /> {/* ← replaced AppSidebar */}
      <SidebarInset className="w-full overflow-x-hidden">
        <SiteHeader />

        {loading ? (
          <div className="flex-1 p-6 flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : error ? (
          <div className="flex-1 p-6 text-red-600">{error}</div>
        ) : hr ? (
          <div className="flex-1 p-6 space-y-6">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-primary hover:underline mb-4"
            >
              ← Back to HR list
            </button>

            <HRDetailChart
              acceptedDates={hr.accepted_applications.map((a) => a.decided_at)}
              declinedDates={hr.declined_applications.map((a) => a.decided_at)}
              interviewDates={hr.interviews.map((i) => i.scheduled_at)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="w-full overflow-x-hidden">
              <div className="flex flex-col lg:flex-row gap-6 w-full">
                <Card className="flex-1 overflow-x-auto max-w-full">
                  <CardHeader>
                    <CardTitle>Candidate Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-x-auto">
                      <HRDetailTables
                        accepted={hr.accepted_applications as ApplicationSummary[]}
                        declined={hr.declined_applications as ApplicationSummary[]}
                        interviews={hr.interviews as InterviewSummary[]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        acceptedFilter={accFilter}
                        onAcceptedFilter={setAccFilter}
                        declinedFilter={decFilter}
                        onDeclinedFilter={setDecFilter}
                        interviewFilter={intFilter}
                        onInterviewFilter={setIntFilter}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1 overflow-x-auto max-w-full">
                  <CardHeader>
                    <CardTitle>Job Postings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-x-auto">
                      <JobPostingTable
                        jobs={hr.job_postings}
                        filter={jobFilter}
                        onFilterChange={setJobFilter}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 text-gray-500">No data found.</div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UserSidebar } from "./components/UserSidebar";
import { UserHeader } from "./components/UserHeader";
import { UserStatsCards } from "./UserStatsCards";
import { UsedResumesList } from "./UsedResumesList";
import { AppliedJobsList } from "./AppliedJobsList";
import { RecommendedJobs } from "./RecommendedJobs";
import { useDashboard } from "@/hooks/user/useDashboard";
import { Spinner } from "@/components/ui/Spinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function UserDashboardContainer() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-red-600">
        {error || "Failed to load dashboard data."}
      </div>
    );
  }

  // ✅ Count scheduled interviews where interview_date is not null
  const scheduledInterviews = data.applied_jobs.filter(
    (job: any) => job.status === "accepted" && job.interview_date
  ).length;

  return (
    <SidebarProvider>
      <UserSidebar variant="inset" />
      <SidebarInset>
        <UserHeader />
        <main className="flex-1 overflow-auto px-6 py-4 space-y-8">
          {/* 1) Stats */}
          <section>
            <UserStatsCards
              sent={data.applications_sent}
              interviews={scheduledInterviews}
            />
          </section>

          {/* 2) Tabs */}
          <section>
            <Tabs defaultValue="resumes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resumes">My Resumes</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>
              <TabsContent value="resumes">
                <UsedResumesList resumes={data.used_resumes} />
              </TabsContent>
              <TabsContent value="applications">
                <AppliedJobsList jobs={data.applied_jobs} />
              </TabsContent>
            </Tabs>
          </section>

          {/* 3) Recommendations */}
          <section>
            <RecommendedJobs jobs={data.recommended_jobs} />
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

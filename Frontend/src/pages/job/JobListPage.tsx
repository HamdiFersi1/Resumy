"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/userDashboard/components/UserSidebar";
import JobListContent from "@/components/jobs/jobList/JobListContent";

export default function JobListPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <UserSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <JobListContent />
        </div>
      </div>
    </SidebarProvider>
  );
}

// src/pages/InterviewsDashboardPage.tsx
"use client";

import InterviewListContainer from "@/components/interviews/dashboard/InterviewListContainer";
import { AppSidebar } from "@/components/dashboard/components/side-bar";
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { SiteNavbar } from "@/components/dashboard/components/site-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function InterviewsDashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <SiteNavbar />
        <div className="p-6">
          <InterviewListContainer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

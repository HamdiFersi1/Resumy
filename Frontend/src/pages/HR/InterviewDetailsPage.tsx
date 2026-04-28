"use client";

import { AppSidebar } from "@/components/dashboard/components/side-bar";
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { SiteNavbar } from "@/components/dashboard/components/site-navbar";
import { InterviewContainer } from "@/components/interviews/details/InterviewDetailsContainer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function InterviewPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <SiteNavbar />
        <div className="max-w-screen-md p-4 pl-10">
          <InterviewContainer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

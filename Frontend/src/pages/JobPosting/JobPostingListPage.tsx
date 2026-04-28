// src/pages/JobPostingListPage.tsx
import { JobPostingList } from "@/components/jobHR/jobList/JobPostingList";
import { AppSidebar } from "../../components/dashboard/components/side-bar";

import { SiteHeader } from "../../components/dashboard/components/site-header";
import { SiteNavbar } from "../../components/dashboard/components/site-navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


export default function JobPostingListPage() {
  return(
  <SidebarProvider>
    <AppSidebar variant="inset" />
    <SidebarInset>
      <SiteHeader />
      <SiteNavbar />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <JobPostingList/>;
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
  )
}



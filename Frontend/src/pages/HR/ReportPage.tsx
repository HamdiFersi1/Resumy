// src/pages/Hr/RapportPage.tsx
import { AppSidebar } from "@/components/dashboard/components/side-bar";
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { SiteNavbar } from "@/components/dashboard/components/site-navbar";
import { ReportContainer } from "@/components/Report/ReportContainer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RapportPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <SiteNavbar />
        <main className="p-6">
          <ReportContainer />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

// src/pages/ApplicationDetailPage.tsx
"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/components/side-bar";
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { SiteNavbar } from "@/components/dashboard/components/site-navbar";
import { ApplicationDetails } from "@/components/Application/ApplicationDetails";

export default function ApplicationDetailPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <SiteNavbar />
        <ApplicationDetails />
      </SidebarInset>
    </SidebarProvider>
  );
}

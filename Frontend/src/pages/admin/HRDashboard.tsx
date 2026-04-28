// src/pages/HRDashboard.tsx

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar"; // ✅ Fixed
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { HRGrid } from "@/components/dashboard/admin/HRTeam";
import { useHrTeam } from "@/hooks/admin/useHrTeam";
import { Loader2 } from "lucide-react";

export default function HRDashboard() {
  const { team, loading, error } = useHrTeam();

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 p-6 flex items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AdminSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex-1 p-6 text-red-600">{error}</div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const hrData = team.map((u) => ({
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    email: u.email,
    phone: "",
    avatar: "",
    hireDate: "",
    location: "",
  }));

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Our HR Team</h1>
            <p className="text-gray-500">Contact your HR representatives</p>
          </div>
          <HRGrid hrData={hrData} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

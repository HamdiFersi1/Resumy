// src/pages/admin/feedback.tsx
import { FeedbackAdminContainer } from "@/components/admin/feedback/FeedbackAdminContainer";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar"; // ✅ updated
import { SiteHeader } from "@/components/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminFeedbackPage() {
  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" /> {/* ✅ updated */}
      <SidebarInset>
        <SiteHeader />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-4">Admin Feedback Dashboard</h1>
          <FeedbackAdminContainer />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

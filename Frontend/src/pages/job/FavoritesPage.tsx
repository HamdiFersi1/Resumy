"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/jobs/jobList/JobCard";
import { Loader2, Star } from "lucide-react";
import jobApi, { Job } from "@/apis/jobApi";
import { UserSidebar } from "@/components/userDashboard/components/UserSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function FavoritesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobApi.getFavoritedJobs().then((data) => {
      setJobs(data);
      setLoading(false);
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden bg-background text-foreground">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-border">
          <UserSidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1.15 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 12,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              >
                <Star className="w-7 h-7 text-yellow-500 fill-yellow-300" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  My Favorite Jobs
                </h1>
                <p className="text-muted-foreground">
                  View all the jobs you've saved for later.
                </p>
              </div>
            </div>

            <Separator />

            {/* Job List */}
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                You haven't favorited any jobs yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

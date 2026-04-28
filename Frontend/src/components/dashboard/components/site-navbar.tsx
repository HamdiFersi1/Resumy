"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BellIcon } from "lucide-react";
import { differenceInHours, parseISO } from "date-fns";

import interviewsApi, { PaginatedInterviews } from "@/apis/HR/interviewsApi";
import { fetchApplicationDetail } from "@/apis/HR/applicationApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UpcomingNotif {
  interviewId: number;
  scheduled_at: string;
  applicant: string;
  jobDisplay: string;
}

export function SiteNavbar() {
  const [upcoming, setUpcoming] = useState<UpcomingNotif[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { title: "Dashboard", url: "/" },
    { title: "Decisions", url: "/decisionsDashboard" },
    { title: "Jobs", url: "/jobpostings" },
    { title: "Interviews", url: "/interviews" },
  ];

  useEffect(() => {
    (async () => {
      const data: PaginatedInterviews = await interviewsApi.getPaginated({ page: 1 });
      const now = new Date();

      const soon = data.results.filter((iv) => {
        if (!iv.scheduled_at) return false;
        const diff = differenceInHours(parseISO(iv.scheduled_at), now);
        return diff >= 0 && diff <= 24;
      });

      const enriched = await Promise.all(
        soon.map(async (iv) => {
          const app = await fetchApplicationDetail(iv.application);
          return {
            interviewId: iv.id,
            scheduled_at: iv.scheduled_at!,
            applicant: app.applicant,
            jobDisplay: `${app.job.company_name} — ${app.job.title}`,
          };
        })
      );

      setUpcoming(enriched);
    })().catch(console.error);
  }, []);

  return (
    <div className="relative flex h-16 items-center border-b bg-background px-4 lg:px-6">
      {/* Centered nav items */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            className={`text-sm font-medium transition-colors ${
              location.pathname === item.url
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      {/* Notification button on right */}
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              {upcoming.length > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                  {upcoming.length}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Upcoming Interviews</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {upcoming.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No interviews in next 24h
              </div>
            ) : (
              upcoming.map((n) => (
                <DropdownMenuItem
                  key={n.interviewId}
                  className="flex flex-col items-start px-4 py-2 hover:bg-muted/50 cursor-pointer"
                  onSelect={() => navigate(`/interviews/${n.interviewId}`)}
                >
                  <span className="font-medium text-sm">For: {n.applicant}</span>
                  <span className="text-xs text-muted-foreground">About: {n.jobDisplay}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.scheduled_at).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

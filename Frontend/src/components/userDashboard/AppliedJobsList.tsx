"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar } from "lucide-react";
import { parseISO, isValid, differenceInCalendarDays, format } from "date-fns";
import {
  fetchMyApplications,
  ApplicationDetail,
} from "@/apis/HR/applicationApi";

const CONTRACT_LABELS: Record<string, string> = {
  FT: "Full-time",
  PT: "Part-time",
  IN: "Internship",
  CT: "Contract",
  FL: "Freelance",
};

export function AppliedJobsList() {
  const [apps, setApps] = useState<ApplicationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyApplications()
      .then(setApps)
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const renderDeadline = (d: string | null) => {
    if (!d) return "—";
    const dt = parseISO(d);
    return isValid(dt) ? (
      <span
        className={
          differenceInCalendarDays(dt, new Date()) < 0
            ? "text-red-600"
            : "text-green-500"
        }
      >
        {format(dt, "MMMM d, yyyy")}
      </span>
    ) : (
      "—"
    );
  };

  if (loading) return <p>Loading your applications…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Applications</h2>
      {!apps.length ? (
        <p className="text-center text-muted-foreground">
          You haven’t applied to any jobs yet.
        </p>
      ) : (
        apps.map((app) => {
          const isOpen = expandedId === app.id;
          const appliedDate = parseISO(app.applied_at);
          const interviewDate = app.interview_date
            ? parseISO(app.interview_date)
            : null;

          const stepStatus = {
            Applied: true,
            Decision: app.status !== "submitted",
            Interview: app.status === "accepted" && !!interviewDate,
          };

          const steps = [
            {
              key: "Applied",
              icon: <CheckCircle size={20} />,
              label: `Applied on ${format(appliedDate, "MMMM d, yyyy")}`,
            },
            {
              key: "Decision",
              icon: <Clock size={20} />,
              label:
                app.status === "accepted"
                  ? "Accepted"
                  : app.status === "declined"
                  ? "Declined"
                  : "Decision: Pending",
            },
            {
              key: "Interview",
              icon: <Calendar size={20} />,
              label: interviewDate
                ? `Interview on ${format(interviewDate, "MMMM d, yyyy")}`
                : "Interview: Pending",
            },
          ];

          return (
            <Card
              key={app.id}
              className="rounded-lg border border-border hover:shadow-lg transition-shadow"
            >
              <CardHeader
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => toggle(app.id)}
              >
                <div>
                  <p className="text-lg font-medium text-foreground">
                    {app.job.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {app.job.company_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applied on {format(appliedDate, "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge
                  variant={
                    app.status === "accepted"
                      ? "success"
                      : app.status === "declined"
                      ? "destructive"
                      : "outline"
                  }
                  className="capitalize"
                >
                  {app.status}
                </Badge>
              </CardHeader>

              {isOpen && (
                <>
                  <Separator />
                  <CardContent className="space-y-6 p-4 bg-muted/40 dark:bg-muted/30">
                    {/* Progress Steps */}
                    <Card className="shadow-md mb-4 bg-background">
                      <CardHeader className="border-b border-border">
                        <h4 className="font-medium text-foreground">Application Progress</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          {steps.map((step, idx) => (
                            <React.Fragment key={step.key}>
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                                    stepStatus[step.key]
                                      ? "bg-black text-white"
                                      : "bg-background border-2 border-border text-muted-foreground"
                                  }`}
                                >
                                  {step.icon}
                                </div>
                                <span className="mt-2 text-xs font-semibold text-foreground">
                                  {step.key}
                                </span>
                                <span className="text-xs text-center text-muted-foreground max-w-[80px] mt-1">
                                  {step.label}
                                </span>
                              </div>
                              {idx < steps.length - 1 && (
                                <div
                                  className={`flex-1 h-1 mx-4 rounded-full ${
                                    stepStatus[steps[idx].key] &&
                                    stepStatus[steps[idx + 1].key]
                                      ? "bg-black"
                                      : "bg-border"
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Job Summary */}
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-foreground">{app.job.title}</p>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <span>{app.job.company_name}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{app.job.location}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="outline">
                          {CONTRACT_LABELS[app.job.contract_type]}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">
                        <span className="font-medium">Deadline:</span>{" "}
                        {renderDeadline(app.job.application_deadline)}
                      </p>
                    </div>

                    <section>
                      <h4 className="font-medium mb-1 text-foreground">Description</h4>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {app.job.job_description}
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium mb-1 text-foreground">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.job.required_skills.split(",").map((s, i) => (
                          <Badge key={i} variant="secondary">
                            {s.trim()}
                          </Badge>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h4 className="font-medium mb-1 text-foreground">Experience</h4>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {app.job.required_experience}
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium mb-1 text-foreground">Education</h4>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {app.job.required_education}
                      </p>
                    </section>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}

// src/components/Application/ApplicationDetails.tsx
"use client";

import  { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectSettings } from "@/lib/redux/settingsSlice";
import { useTransformedApplicationDetail } from "@/hooks/HR/useTransformedApplicationDetail";

import { ApplicationHeader } from "./ApplicationHeader";
import { TotalScoreCard } from "./charts/TotalScoreCard";
import { SkillBreakdownCard } from "./charts/SkillBreakdownCard";
import { SoftSkillsChart } from "./charts/SoftSkillsChart";
import { ProblemSolvingChart } from "./charts/ProblemSolvingChart";
import { ResumeSnapshot } from ".";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { JobCard } from "./JobCard";
import { ResumeTextCard } from "./SnapshotCard";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";

// API for fetching interviews
import interviewsApi from "@/apis/HR/interviewsApi";

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const jobId = new URLSearchParams(search).get("jobId");

  const settings = useAppSelector(selectSettings);
  const {
    app,
    loading,
    error,
    totalPct,
    expPct,
    skillsPct,
    projPct,
    eduPct,
    resume,
  } = useTransformedApplicationDetail(id);

  // hold the interview ID linked to this application
  const [interviewId, setInterviewId] = useState<number | null>(null);

  // when application is accepted, look up its interview
  useEffect(() => {
    if (app?.status === "accepted") {
      interviewsApi
        .getPaginated() // fetch a page of interviews
        .then(({ results }) => {
          // find the one whose `application` matches this app's id
          const match = results.find((iv) => iv.application === app.id);
          if (match) {
            setInterviewId(match.id);
          }
        })
        .catch(() => {
          // optionally handle or log the error
        });
    }
  }, [app]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!app) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto max-w-screen-2xl p-6">
      {/* 1) Application Header */}
      <section className="mb-6">
        <ApplicationHeader
          applicationId={app.id}
          jobTitle={app.job.title}
          applicant={app.applicant}
          appliedAt={app.applied_at}
          status={
            app.status as "submitted" | "scored" | "accepted" | "declined"
          }
        />
        {jobId && (
          <button
            className="mt-2 text-sm text-blue-600"
            onClick={() => navigate(`/dashboard?job=${jobId}`)}
          >
            ← Back to Job
          </button>
        )}
      </section>

      {/* 2) Scores & Charts */}
      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex flex-col gap-6 xl:w-[420px]">
          <TotalScoreCard totalScorePercent={totalPct} />
          <SkillBreakdownCard
            exp={expPct}
            skills={skillsPct}
            projects={projPct}
            education={eduPct}
          />
          <SoftSkillsChart applicationId={app.id} />
          <ProblemSolvingChart applicationId={app.id} />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <Tabs
            defaultValue="job-details"
            className="w-[800px] max-w-5xl mx-auto bg-muted/50 rounded-2xl shadow-lg"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="job-details">Job Details</TabsTrigger>
              <TabsTrigger value="resume-text">Resume Text</TabsTrigger>
              <TabsTrigger value="pdf-preview">PDF Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="job-details" className="p-8">
              <JobCard job={app.job} />
            </TabsContent>

            {resume && (
              <TabsContent value="resume-text" className="p-8">
                <ResumeTextCard resume={resume} />
              </TabsContent>
            )}

            <TabsContent value="pdf-preview" className="p-0">
              <Card className="overflow-hidden">
                <CardHeader className="p-0">
                  <CardTitle className="m-0 text-lg p-4">
                    Resume PDF Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ResumeSnapshot
                    snapshot={
                      typeof app.snapshot_json === "string"
                        ? JSON.parse(app.snapshot_json)
                        : app.snapshot_json
                    }
                    settings={settings}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 3) Interview Button */}
      {interviewId && (
        <Button
          variant="default"
          size="icon"
          onClick={() => navigate(`/interviews/${interviewId}`)}
          className="fixed bottom-8 right-8 shadow-lg"
        >
          <CalendarIcon className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

// src/components/interviews/details/ApplicationDetailsInterview.tsx
"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobCard } from "../../Application/JobCard";
import { ResumeTextCard } from "../../Application/SnapshotCard";
import type { InterviewContext } from "@/apis/HR/interviewsApi";

interface ApplicationDetailsProps {
  interview: InterviewContext;
}

export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  interview,
}) => {
  const { job, resume_snapshot } = interview;
  // إذا resume_snapshot undefined، نخليو raw كـ {} כדי name وما يطيحش
  const raw = resume_snapshot ?? {};

  const resume = {
    profile: {
      name: raw.name ?? "",
      summary: raw.summary ?? "",
      email: raw.contact?.email ?? "",
      phone: raw.contact?.phone ?? "",
      location: raw.location ?? "",
      url: raw.url ?? "",
    },
    workExperiences: Array.isArray(raw.experience)
      ? raw.experience.map((e: any) => ({
          company: e.company ?? "",
          jobTitle: e.title ?? "",
          date: e.date ?? "",
          descriptions: Array.isArray(e.description)
            ? e.description
            : [],
        }))
      : [],
    educations: Array.isArray(raw.education)
      ? raw.education.map((e: any) => ({
          school: e.school ?? "",
          degree: e.degree ?? "",
          date: e.date ?? "",
          descriptions: Array.isArray(e.additional_info)
            ? e.additional_info
            : [],
        }))
      : [],
    projects: Array.isArray(raw.projects)
      ? raw.projects.map((p: any) => ({
          project: p.title ?? "",
          date: p.date ?? "",
          descriptions: Array.isArray(p.description)
            ? p.description
            : [],
        }))
      : [],
    skills: {
      featuredSkills: [],
      descriptions: Array.isArray(raw.skills)
        ? raw.skills
        : typeof raw.skills === "string"
        ? raw.skills
            .split(/[,•;]/)
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    },
    custom: {
      descriptions: Array.isArray(raw.certifications)
        ? raw.certifications
        : [],
    },
  };

  return (
    <Card className="shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Application Details
        </CardTitle>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
        <Tabs defaultValue="job-details">
          <TabsList className="grid grid-cols-2 max-w-xs">
            <TabsTrigger value="job-details">Job Details</TabsTrigger>
            <TabsTrigger value="resume-text">Resume Details</TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value="job-details">
              <JobCard job={job} />
            </TabsContent>
            <TabsContent value="resume-text">
              <ResumeTextCard resume={resume} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground px-6 pb-6 pt-0">
        Review all application details before the interview.
      </CardFooter>
    </Card>
  );
};

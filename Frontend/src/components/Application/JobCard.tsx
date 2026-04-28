"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { JobPostingDetail } from "@/apis/HR/applicationApi";

const CONTRACT_LABELS: Record<JobPostingDetail["contract_type"], string> = {
  FT: "Full-time",
  PT: "Part-time",
  IN: "Internship",
  CT: "Contract",
  FL: "Freelance",
};

export function JobCard({ job }: { job: JobPostingDetail }) {
  if (!job) return null;

  return (
    <Card className="bg-muted/50 border border-border rounded-2xl shadow-lg w-[700px] max-w-5xl mx-auto">
      <CardHeader className="p-8">
        <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        {/* Company & Contract */}
        <section className="space-y-2">
          <h3 className="text-2xl font-semibold">Company & Contract</h3>
          <p className="text-justify leading-relaxed">
            <strong>Company:</strong> {job.company_name || "—"}
          </p>
          <p className="text-justify leading-relaxed">
            <strong>Contract Type:</strong> {CONTRACT_LABELS[job.contract_type]}
          </p>
        </section>

        <Separator />

        {/* Classification */}
        <section className="space-y-2">
          <h3 className="text-2xl font-semibold">Classification</h3>
          <p className="text-justify leading-relaxed">
            <strong>Category:</strong> {job.category || "—"}
          </p>
          <p className="text-justify leading-relaxed">
            <strong>Location:</strong> {job.location || "—"}
          </p>
          <p className="text-justify leading-relaxed">
            <strong>Experience Level:</strong> {job.experience_level || "—"}
          </p>
        </section>

        <Separator />

        {/* Application Period */}
        <section className="space-y-2">
          <h3 className="text-2xl font-semibold">Application Period</h3>
          <p className="text-justify leading-relaxed">
            <strong>Start:</strong>{" "}
            {new Date(job.application_start).toLocaleDateString()}
          </p>
          <p className="text-justify leading-relaxed">
            <strong>Deadline:</strong>{" "}
            {job.application_deadline
              ? new Date(job.application_deadline).toLocaleDateString()
              : "No deadline"}
          </p>
          <p className="text-justify leading-relaxed">
            <strong>Status:</strong>{" "}
            <span className={job.is_open ? "text-green-600" : "text-red-600"}>
              {job.is_open ? "Open" : "Closed"}
            </span>
          </p>
        </section>

        <Separator />

        {/* Job Description */}
        <section className="space-y-2">
          <h3 className="text-2xl font-semibold">Job Description</h3>
          <p className="text-justify leading-relaxed">
            {job.job_description || "No description provided."}
          </p>
        </section>

        <Separator />

        {/* Requirements */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Requirements</h3>

          {job.required_skills && (
            <div className="space-y-1">
              <h4 className="text-xl font-medium">Skills</h4>
              <p className="text-justify leading-relaxed">
                {job.required_skills}
              </p>
            </div>
          )}

          {job.required_experience && (
            <div className="space-y-1">
              <h4 className="text-xl font-medium">Experience</h4>
              <p className="text-justify leading-relaxed">
                {job.required_experience}
              </p>
            </div>
          )}

          {job.required_education && (
            <div className="space-y-1">
              <h4 className="text-xl font-medium">Education</h4>
              <p className="text-justify leading-relaxed">
                {job.required_education}
              </p>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

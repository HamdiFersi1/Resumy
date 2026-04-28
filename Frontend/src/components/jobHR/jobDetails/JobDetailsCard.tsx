"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { Job } from "@/apis/jobApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

interface Props {
  job: Job | null;
  loading: boolean;
  error: string | null;
  onDelete: () => void;
}

export function JobDetailsCard({ job, loading, error, onDelete }: Props) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Skeleton className="h-8 w-32 mb-4 rounded" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center text-muted-foreground">
        Job not found.
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto py-12 px-4 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Job Card */}
      <Card className="p-6 rounded-2xl shadow-sm border bg-background/90 dark:bg-muted/70 backdrop-blur-sm space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">{job.title}</h2>
            <p className="text-sm text-muted-foreground">
              {job.company_name} · {job.location}
            </p>
          </div>
          <Badge variant="secondary">{job.contract_type}</Badge>
        </div>

        <Separator />

        {/* Job Details */}
        <div className="space-y-1 text-sm">
          <h3 className="text-lg font-semibold">Job Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Info label="Category" value={job.category} />
            <Info label="Experience" value={job.experience_level} />
            <Info
              label="Period"
              value={`${new Date(job.application_start).toLocaleDateString()} → ${
                job.application_deadline
                  ? new Date(job.application_deadline).toLocaleDateString()
                  : "Open"
              }`}
              className="sm:col-span-2"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 text-sm">
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="whitespace-pre-wrap text-muted-foreground">
            {job.job_description}
          </p>
        </div>

        {/* Requirements */}
        <div className="space-y-4 text-sm">
          <h3 className="text-lg font-semibold">Required Skills & Key Responsibilities</h3>
          <Requirement label="Skills" value={job.required_skills} />
          <Requirement label="Experience" value={job.required_experience} />
          <Requirement label="Education" value={job.required_education} />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            onClick={() => navigate(`/jobpostings/${job.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

/* Reusable small info label:value */
function Info({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/* Reusable requirement block */
function Requirement({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground whitespace-pre-wrap pl-2">{value}</p>
    </div>
  );
}

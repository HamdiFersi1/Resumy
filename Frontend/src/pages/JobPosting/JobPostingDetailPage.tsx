"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobApi, { Job } from "@/apis/jobApi";
import { JobDetailsCard } from "@/components/jobHR/jobDetails/index";

export default function JobPostingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* fetch once */
  useEffect(() => {
    if (!id) return;
    jobApi
      .getOne(Number(id))
      .then(setJob)
      .catch(() => setError("Failed to load job posting."))
      .finally(() => setLoad(false));
  }, [id]);

  /* delete handler passed down */
  const handleDelete = async () => {
    if (!job || !confirm("Delete this job posting?")) return;
    await jobApi.delete(job.id);
    navigate("/jobpostings");
  };

  return (
    <JobDetailsCard
      job={job}
      loading={loading}
      error={error}
      onDelete={handleDelete}
    />
  );
}

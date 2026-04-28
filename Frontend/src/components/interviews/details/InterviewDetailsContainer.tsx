// src/components/interviews/details/InterviewDetailsContainer.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import interviewsApi, {
  InterviewContext,
  InterviewForm,
} from "@/apis/HR/interviewsApi";
import { InterviewDetailsForm } from "./InterviewForms/InterviewForm";
import { InterviewDetailsLayout } from "./InterviewDetailsLayout";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "sonner";

// For patch we only need these two:
type InterviewPatch = Partial<Omit<InterviewForm, "application">>;

export function InterviewContainer() {
  const { id } = useParams<{ id: string }>();
  const interviewId = Number(id);

  const [interview, setInterview] = useState<InterviewContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    interviewsApi
      .getOne(interviewId)
      .then((data) => {
        setInterview(data);
        setError(null);
      })
      .catch(() => setError("Failed to load interview."))
      .finally(() => setLoading(false));
  }, [interviewId]);

  const handleSave = async (vals: InterviewPatch) => {
    setLoading(true);
    try {
      const updated = await interviewsApi.patch(interviewId, vals);
      setInterview(updated);
      toast.success("Interview updated!");
      setEditing(false);
    } catch {
      toast.error("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error || !interview)
    return <div className="p-6 text-red-600">{error}</div>;

  return editing ? (
    <InterviewDetailsForm
      interview={interview}
      onCancel={() => setEditing(false)}
      onSave={handleSave}
    />
  ) : (
    <InterviewDetailsLayout interview={interview} />
  );
}

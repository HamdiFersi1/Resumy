/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/JobPostingFormPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jobApi from "@/apis/jobApi";
import { JobPostingForm } from "@/components/jobHR/jobPostingForm/JobPostingForm";
import type { JobForm } from "@/components/jobHR/jobPostingForm/types";

export default function JobPostingFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // initial empty form
  const [form, setForm] = useState<JobForm>({
    title: "",
    company_name: "",
    job_description: "",
    required_skills: "",
    required_experience: "",
    required_education: "",
    category: "",
    location: "",
    experience_level: "",
    contract_type: "FT",
    application_start: new Date().toISOString().slice(0, 10),
    application_deadline: null,
  });

  const [loading, setLoading] = useState<boolean>(!!id);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // fetch existing job when editing
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobApi
      .getOne(Number(id))
      .then((j) => {
        /* strip out read-only fields */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, created_at: __, is_open: ___, ...rest } = j;
        setForm(rest);
      })
      .catch(() => setError("Failed to load job posting."))
      .finally(() => setLoading(false));
  }, [id]);

  // update one field in the form
  const handleChange = (field: keyof JobForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (id) {
        await jobApi.update(Number(id), form);
      } else {
        await jobApi.create(form);
      }
      navigate("/jobpostings");
    } catch (err: any) {
      console.error("API validation errors:", err.response?.data || err);
      if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(
            ([field, msgs]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join("\n");
        setError(messages);
      } else {
        setError("Save failed.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <JobPostingForm
      isEdit={Boolean(id)}
      form={form}
      loading={loading}
      saving={saving}
      error={error}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}

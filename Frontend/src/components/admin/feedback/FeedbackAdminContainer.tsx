// src/components/admin/feedback/FeedbackAdminContainer.tsx
"use client";
import  { useEffect, useState } from "react";
import {
  fetchFeedbackSummary,
  FeedbackSummary,
} from "@/apis/HR/feedBackApi";
import { FeedbackSummaryTable } from "./FeedbackSummaryTable";
import { Spinner } from "@/components/ui/Spinner";

export function FeedbackAdminContainer() {
  const [data, setData] = useState<FeedbackSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbackSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return <FeedbackSummaryTable data={data} />;
}

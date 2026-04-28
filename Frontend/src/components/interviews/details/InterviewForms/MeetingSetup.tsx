// src/components/interviews/details/InterviewForms/MeetingSetup.tsx
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import interviewsApi from "@/apis/HR/interviewsApi";
import type { InterviewContext } from "@/apis/HR/interviewsApi";

interface MeetingSetupProps {
  interview: InterviewContext;
}

export const MeetingSetup: React.FC<MeetingSetupProps> = ({ interview }) => {
  const [link, setLink] = useState(interview.meeting_link ?? "");
  const [done, setDone] = useState(interview.done ?? false);
  const [loading, setLoading] = useState(false);

  // only show form if interview is within the next 24h
  const scheduledAt = interview.scheduled_at
    ? new Date(interview.scheduled_at)
    : null;
  const now = new Date();
  const msUntil = scheduledAt ? scheduledAt.getTime() - now.getTime() : -1;
  const within24h = msUntil >= 0 && msUntil <= 24 * 60 * 60 * 1000;

  const handleSend = async () => {
    if (!link) return;
    setLoading(true);
    try {
      await interviewsApi.patch(interview.id, { meeting_link: link });
      toast.success("Meeting link sent to applicant");
    } catch {
      toast.error("Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async () => {
    setLoading(true);
    try {
      await interviewsApi.patch(interview.id, { done: true });
      setDone(true);
      toast.success("Interview marked done");
    } catch {
      toast.error("Failed to mark as done");
    } finally {
      setLoading(false);
    }
  };

  // if not yet within 24h or already done, don't render the form
  if (!within24h || done) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border rounded-md bg-muted">
      <h3 className="text-lg font-semibold mb-2">Set Up Meeting</h3>
      <Input
        placeholder="Zoom / Google Meet link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        disabled={done}
        className="mb-3"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSend}
          disabled={!link || loading}
          className="flex-1"
        >
          {loading ? "Sending…" : "Send Link"}
        </Button>
        <Button
          variant="secondary"
          onClick={handleDone}
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Updating…" : "Mark as Done"}
        </Button>
      </div>
    </div>
  );
};

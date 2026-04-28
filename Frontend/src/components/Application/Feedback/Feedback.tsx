// src/components/FeedbackHeader/FeedbackHeader.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import {
  submitApplicationFeedback,
  fetchFeedbackForApplication,
  ApplicationFeedbackRecord,
} from "@/apis/HR/feedBackApi";

interface FeedbackHeaderProps {
  applicationId: number;
}

const REASONS = [
  { value: "skills_match", label: "Skills match" },
  { value: "experience_level", label: "Experience level" },
  { value: "profile_summary", label: "Profile summary" },
  { value: "education_fit", label: "Education fit" },
  { value: "total_score", label: "Total score" },
];

export function FeedbackHeader({ applicationId }: FeedbackHeaderProps) {
  const [existing, setExisting] = useState<ApplicationFeedbackRecord | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<"up" | "down" | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  // Load any prior feedback
  useEffect(() => {
    fetchFeedbackForApplication(applicationId)
      .then((arr) => arr.length && setExisting(arr[0]))
      .catch(() => {});
  }, [applicationId]);

  // Submit handler
  const handleSubmit = async () => {
    if (!choice) return;
    if (choice === "down" && !custom.trim()) {
      alert("Please enter comments when downvoting.");
      return;
    }
    setLoading(true);
    try {
      await submitApplicationFeedback({
        application_id: applicationId,
        positive: choice === "up",
        reasons,
        custom,
      });
      const recs = await fetchFeedbackForApplication(applicationId);
      setExisting(recs[0] || null);
      setOpen(false);
    } catch {
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  // If we've already submitted, render only the chosen thumb:
  if (existing) {
    return existing.positive ? (
      <ThumbsUp size={24} className="text-green-600" />
    ) : (
      <ThumbsDown size={24} className="text-red-600" />
    );
  }

  // Otherwise render both as triggers to open the dialog
  return (
    <>
      <div className="flex items-center space-x-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <ThumbsUp
              size={24}
              className="cursor-pointer text-gray-700 hover:text-green-600"
              onClick={() => setChoice("up")}
            />
          </DialogTrigger>
          <DialogTrigger asChild>
            <ThumbsDown
              size={24}
              className="cursor-pointer text-gray-700 hover:text-red-600"
              onClick={() => setChoice("down")}
            />
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Application Feedback</DialogTitle>
            </DialogHeader>

            <p className="mb-4">
              You chose <strong>{choice === "up" ? "👍 Up" : "👎 Down"}</strong>
              .
            </p>

            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={r.value}
                    checked={reasons.includes(r.value)}
                    onChange={(e) => {
                      const v = r.value;
                      setReasons((prev) =>
                        e.target.checked
                          ? [...prev, v]
                          : prev.filter((x) => x !== v)
                      );
                    }}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>

            {choice === "down" && (
              <textarea
                className="w-full mt-4 p-2 border rounded"
                placeholder="Enter comments..."
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            )}

            <DialogFooter className="space-x-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit}
                disabled={loading}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// src/components/Application/ApplicationHeader.tsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";

import {
  acceptApplication,
  declineApplication,
} from "@/apis/HR/applicationApi";
import { FeedbackHeader } from "@/components/Application/Feedback/Feedback";

interface Props {
  applicationId: number;
  jobTitle: string;
  applicant: string;
  appliedAt: string;
  status: "submitted" | "scored" | "accepted" | "declined";
}

export function ApplicationHeader({
  applicationId,
  jobTitle,
  applicant,
  appliedAt,
  status,
}: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [action, setAction] = useState<"accept" | "decline" | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (action === "accept") {
        const data = await acceptApplication(applicationId);
        navigate(`/interviews/${data.interview_id}`);
      } else {
        await declineApplication(applicationId);
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <CardTitle className="text-2xl">{jobTitle}</CardTitle>
          <CardDescription>
            Applied by {applicant}
            <br />
            on {new Date(appliedAt).toLocaleString()}
          </CardDescription>
        </div>

        <div className="flex items-center space-x-2">
          <Badge
            variant={
              status === "accepted"
                ? "secondary"
                : status === "declined"
                ? "destructive"
                : "outline"
            }
          >
            {statusLabel}
          </Badge>

          {status === "scored" && (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAction("accept");
                    setConfirmOpen(true);
                  }}
                  disabled={loading}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setAction("decline");
                    setConfirmOpen(true);
                  }}
                  disabled={loading}
                >
                  Decline
                </Button>
              </div>
              <DialogTrigger />
              <DialogContent className="max-w-md">
                <DialogHeader className="flex items-center space-x-2">
                  {action === "accept" ? (
                    <CheckCircle className="h-6 w-6 text-green-900" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <DialogTitle
                    className={
                      action === "accept" ? "text-green-700" : "text-red-700"
                    }
                  >
                    Confirm {action === "accept" ? "Acceptance" : "Decline"}
                  </DialogTitle>
                </DialogHeader>
                <p className="p-4">
                  Are you sure you want to <strong>{action}</strong> this
                  application?
                </p>
                <DialogFooter className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={action === "accept" ? "default" : "destructive"}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    Yes, {action === "accept" ? "Accept" : "Decline"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Feedback button always visible */}
          <FeedbackHeader applicationId={applicationId} />
        </div>
      </CardHeader>
    </Card>
  );
}

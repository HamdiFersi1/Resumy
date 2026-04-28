// src/pages/ApplicationSuccessPage.tsx
"use client";

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function ApplicationSuccessPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-muted p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="grid place-items-center pt-6">
          <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" />
          <CardTitle className="mt-4">Application Submitted!</CardTitle>
          <CardDescription>
            Your application (ID: {applicationId}) has been successfully
            submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            Thank you for applying. We&apos;ll review your submission and
            contact you with next steps.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4 pb-6">
          <Button onClick={() => navigate("/Candidate")}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

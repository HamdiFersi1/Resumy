/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/interviews/details/chatbot/ChatbotDrawer.tsx */
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/Spinner";
import interviewsApi from "@/apis/HR/interviewsApi";

interface ChatbotDrawerProps {
  interviewId: number;
  buttonSize?: "sm" | "lg" | "icon" | "default";
}

export function ChatbotDrawer({
  interviewId,
  buttonSize = "sm",
}: ChatbotDrawerProps) {
  const [open, setOpen] = useState(false);
  const [buckets, setBuckets] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const interview = await interviewsApi.generate(interviewId);
      const sessions = interview.questions_generated ?? [];
      const last = sessions.at(-1)?.questions;

      setBuckets(
        last && typeof last === "object" && !Array.isArray(last) ? last : {}
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
      setBuckets(null);
    } finally {
      setLoading(false);
    }
  };

  const hasBuckets = buckets && Object.keys(buckets).length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size={buttonSize}>
          ✨ Generate Qs
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-3xl flex flex-col h-full"
      >
        <SheetHeader className="flex items-center justify-between p-4 border-b">
          <SheetTitle>AI-Generated Questions</SheetTitle>
        </SheetHeader>

        {/* BODY — make sure children can shrink */}
        <div className="flex flex-col flex-1 min-h-0 p-4">
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="mb-4 w-full"
          >
            {loading ? <Spinner size="sm" /> : "Generate Questions"}
          </Button>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {!hasBuckets ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">
                {loading
                  ? "Generating…"
                  : error
                  ? "Try again."
                  : "Click “Generate Questions” to start."}
              </p>
            </div>
          ) : (
            /* full-height scroll area */
            <ScrollArea className="flex-1 h-full overflow-y-auto">
              <div className="space-y-6 pr-2">
                {Object.entries(buckets!).map(([category, qs]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {qs.length ? (
                        <ol className="list-decimal list-inside space-y-1">
                          {qs.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          (no questions)
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

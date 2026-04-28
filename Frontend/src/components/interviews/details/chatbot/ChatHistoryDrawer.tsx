// src/components/interviews/details/chatbot/ChatHistoryDrawer.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import interviewsApi, { GeneratedSession } from "@/apis/HR/interviewsApi";

interface ChatHistoryDrawerProps {
  buttonSize?: "sm" | "lg" | "icon" | "default";
}

export function ChatHistoryDrawer({
  buttonSize = "icon",
}: ChatHistoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<GeneratedSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    interviewsApi
      .getAllGeneratedSessions()
      .then((data) => {
        setSessions(data);
      })
      .catch((err) => {
        console.error("❌ [ChatHistory] failed to load sessions:", err);
      })
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size={buttonSize}
          className="fixed bottom-8 right-8 z-50"
        >
          📜
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-lg flex flex-col h-full"
      >
        <SheetHeader className="p-4 border-b flex items-center justify-between">
          <SheetTitle className="text-lg font-semibold">
            All AI Generation History
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <ScrollArea className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
            {sessions.length === 0 ? (
              <p className="text-center text-gray-500">
                No AI sessions generated yet.
              </p>
            ) : (
              sessions.map((sess, idx) => {
                return (
                  <Collapsible key={idx} defaultOpen={false} className="w-full">
                    <CollapsibleTrigger asChild>
                      <Card className="cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {sess.job_title} @ {sess.company_name}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">
                                {sess.applicant} —{" "}
                                {new Date(sess.session_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="space-y-4 p-4 bg-white">
                        {sess.questions &&
                        typeof sess.questions === "object" ? (
                          Object.entries(sess.questions).map(
                            ([category, qs]) => (
                              <Card key={category} className="border">
                                <CardHeader>
                                  <CardTitle className="capitalize text-sm">
                                    {category}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                  {Array.isArray(qs) ? (
                                    <ol className="list-decimal list-inside space-y-1">
                                      {qs.map((q, qidx) => (
                                        <li key={qidx} className="text-sm">
                                          {q}
                                        </li>
                                      ))}
                                    </ol>
                                  ) : (
                                    <p className="text-red-500">
                                      ⚠️ Expected array, got {typeof qs}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            )
                          )
                        ) : (
                          <p className="text-red-500">
                            ⚠️ sess.questions is{" "}
                            <code>{typeof sess.questions}</code>
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

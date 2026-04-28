/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Application/interviews/InterviewModal.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import interviewsApi from "@/apis/HR/interviewsApi";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface InterviewModalProps {
  interviewId: number;
}

export function InterviewModal({ interviewId }: InterviewModalProps) {
  const [open, setOpen] = React.useState(false);
  const [interview, setInterview] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [editing, setEditing] = React.useState(false);
  const [editedDate, setEditedDate] = React.useState<Date | null>(null);
  const [editedQuestions, setEditedQuestions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    interviewsApi
      .getOne(interviewId)
      .then((data) => {
        setInterview(data);
        const dt = data.scheduled_at ? new Date(data.scheduled_at) : null;
        setEditedDate(dt);
        setEditedQuestions(data.questions.slice());
      })
      .catch(() => setError("Failed to load interview."))
      .finally(() => setLoading(false));
  }, [open, interviewId]);

  const handleSave = async () => {
    if (!editedDate) return;
    await interviewsApi.patch(interviewId, {
      scheduled_at: editedDate.toISOString(),
      questions: editedQuestions,
    });
    setInterview({
      ...interview,
      scheduled_at: editedDate.toISOString(),
      questions: editedQuestions,
    });
    setEditing(false);
  };

  // build hour/minute/ampm options
  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const ampmOptions = ["AM", "PM"] as const;

  // helper to update editedDate
  const updateTime = (hour12: number, minute: number, ampm: string) => {
    if (!editedDate) return;
    let hr = hour12 % 12;
    if (ampm === "PM") hr += 12;
    const dt = new Date(editedDate);
    dt.setHours(hr, minute);
    setEditedDate(dt);
  };

  // derive current hour12, minute, ampm from editedDate
  const currentHour12 = editedDate
    ? ((editedDate.getHours() + 11) % 12) + 1
    : 12;
  const currentMinute = editedDate ? editedDate.getMinutes() : 0;
  const currentAmpm = editedDate
    ? editedDate.getHours() < 12
      ? "AM"
      : "PM"
    : "AM";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-8 right-8 shadow-lg"
        >
          📅
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0 bg-white">
        <DialogHeader className="border-b">
          <DialogTitle className="px-6 py-4 text-xl font-semibold">
            Interview Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : interview ? (
          <div className="px-6 py-4 space-y-6">
            {/* Scheduled At */}
            <div className="space-y-1">
              <Label>Scheduled At</Label>
              {editing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {editedDate
                        ? format(editedDate, "LLLL do, yyyy 'at' h:mm a")
                        : "Pick date & time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 grid gap-4">
                    {/* Calendar */}
                    <Calendar
                      mode="single"
                      selected={editedDate ?? undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        const dt = editedDate || new Date();
                        dt.setFullYear(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate()
                        );
                        setEditedDate(new Date(dt));
                      }}
                      initialFocus
                    />

                    {/* Time selectors */}
                    <div className="flex gap-2">
                      {/* Hour */}
                      <div className="flex-1">
                        <Label className="text-sm">Hour</Label>
                        <select
                          className="block w-full rounded border p-2"
                          value={currentHour12}
                          onChange={(e) =>
                            updateTime(
                              Number(e.target.value),
                              currentMinute,
                              currentAmpm
                            )
                          }
                        >
                          {hours12.map((h) => (
                            <option key={h} value={h}>
                              {h.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Minute */}
                      <div className="flex-1">
                        <Label className="text-sm">Min</Label>
                        <select
                          className="block w-full rounded border p-2"
                          value={
                            // snap minute to nearest 5
                            minutes.includes(currentMinute)
                              ? currentMinute
                              : Math.floor(currentMinute / 5) * 5
                          }
                          onChange={(e) =>
                            updateTime(
                              currentHour12,
                              Number(e.target.value),
                              currentAmpm
                            )
                          }
                        >
                          {minutes.map((m) => (
                            <option key={m} value={m}>
                              {m.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* AM/PM */}
                      <div className="flex-1">
                        <Label className="text-sm">AM/PM</Label>
                        <select
                          className="block w-full rounded border p-2"
                          value={currentAmpm}
                          onChange={(e) =>
                            updateTime(
                              currentHour12,
                              currentMinute,
                              e.target.value
                            )
                          }
                        >
                          {ampmOptions.map((ap) => (
                            <option key={ap} value={ap}>
                              {ap}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="rounded-md border px-3 py-2">
                  {interview.scheduled_at
                    ? format(
                        new Date(interview.scheduled_at),
                        "LLLL do, yyyy 'at' h:mm a"
                      )
                    : "Not scheduled"}
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-2">
              <Label>Questions</Label>
              {editing ? (
                <div className="space-y-2">
                  {editedQuestions.map((q, i) => (
                    <input
                      key={i}
                      className="block w-full rounded border px-3 py-2"
                      value={q}
                      onChange={(e) => {
                        const arr = editedQuestions.slice();
                        arr[i] = e.target.value;
                        setEditedQuestions(arr);
                      }}
                    />
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditedQuestions([...editedQuestions, ""])}
                  >
                    + Add question
                  </Button>
                </div>
              ) : (
                (interview.questions.length > 0 && (
                  <ol className="list-decimal list-inside">
                    {interview.questions.map((q: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, i: React.Key | null | undefined) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                )) || (
                  <div className="text-sm text-muted-foreground">
                    No questions added yet.
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}

        <DialogFooter className="space-x-2 px-6 py-4 border-t">
          {interview && (
            <Button variant="outline" onClick={() => setEditing((e) => !e)}>
              {editing ? "Cancel" : "Edit"}
            </Button>
          )}
          {editing && <Button onClick={handleSave}>Save</Button>}
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

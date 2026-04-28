/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/interviews/details/InterviewOverview.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { toast } from "sonner";
import { ChatbotDrawer } from "../chatbot/ChatbotDrawer";
import interviewsApi, { InterviewContext } from "@/apis/HR/interviewsApi";

export interface InterviewOverviewProps {
  interview: InterviewContext;
}

export const InterviewOverview: React.FC<InterviewOverviewProps> = ({
  interview,
}) => {
  const [local, setLocal] = useState(interview);

  useEffect(() => {
    setLocal(interview);
  }, [interview]);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (local.done && isEditing) {
      setIsEditing(false);
    }
  }, [local.done]);

  const [editedDate, setEditedDate] = useState<Date | null>(
    local.scheduled_at ? new Date(local.scheduled_at) : null
  );
  const [questions, setQuestions] = useState<string[]>([...local.questions]);
  const [editingTime, setEditingTime] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const ampmOptions = ["AM", "PM"] as const;
  const currentHour12 = editedDate
    ? ((editedDate.getHours() + 11) % 12) + 1
    : 12;
  const currentMinute = editedDate ? editedDate.getMinutes() : 0;
  const currentAmpm = editedDate
    ? editedDate.getHours() < 12
      ? "AM"
      : "PM"
    : "AM";

  const updateTime = (
    hour12: number,
    minute: number,
    ampm: (typeof ampmOptions)[number]
  ) => {
    if (!editedDate) return;
    let hr = hour12 % 12;
    if (ampm === "PM") hr += 12;
    const dt = new Date(editedDate);
    dt.setHours(hr, minute, 0, 0);
    setEditedDate(dt);
  };

  const updateQuestion = (i: number, val: string) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? val : q)));
  const addQuestion = () => setQuestions((qs) => [...qs, ""]);
  const removeQuestion = (i: number) =>
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!editedDate) {
      toast.error("Please pick a date & time.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await interviewsApi.patch(local.id, {
        scheduled_at: editedDate.toISOString(),
        questions,
      });
      setLocal(updated);
      toast.success("Interview updated!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <Card className="shadow-sm w-[500px]">
      <CardHeader>
        <div className="flex justify-between items-end">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              Interview Overview
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Edit interview details"
                : local.done
                ? "Interview completed"
                : "Details for the upcoming interview"}
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator className="mb-6" />

      <CardContent className="grid gap-6">
        {/* Scheduled Date */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="w-full">
              <Label className="text-muted-foreground text-sm">
                Scheduled Date
              </Label>
              {isEditing && !local.done ? (
                <Popover open={editingTime} onOpenChange={setEditingTime}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between mt-1"
                      onClick={() => setEditingTime(true)}
                    >
                      {editedDate
                        ? format(editedDate, "PPPp")
                        : "Pick date & time"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4 grid gap-4">
                    <Calendar
                      mode="single"
                      selected={editedDate ?? undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        const dt = new Date(date);
                        dt.setHours(
                          (currentHour12 % 12) + (currentAmpm === "PM" ? 12 : 0)
                        );
                        dt.setMinutes(currentMinute);
                        setEditedDate(dt);
                      }}
                      initialFocus
                    />
                    <div className="flex gap-2">
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
                      <div className="flex-1">
                        <Label className="text-sm">Minute</Label>
                        <select
                          className="block w-full rounded border p-2"
                          value={currentMinute}
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
                              {m.toString().padStart(2, "00")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm">AM/PM</Label>
                        <select
                          className="block w-full rounded border p-2"
                          value={currentAmpm}
                          onChange={(e) =>
                            updateTime(
                              currentHour12,
                              currentMinute,
                              e.target.value as any
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
                <p className="font-medium mt-1">
                  {local.scheduled_at
                    ? format(new Date(local.scheduled_at), "PPPp")
                    : "Not scheduled"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileTextIcon className="h-5 w-5 text-primary" />
            </div>
            <Label className="text-muted-foreground text-sm">
              Interview Questions
            </Label>
          </div>

          {isEditing && !local.done ? (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Textarea
                    value={q}
                    onChange={(e) => updateQuestion(i, e.currentTarget.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeQuestion(i)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addQuestion}>
                + Add Question
              </Button>
            </div>
          ) : questions.length > 0 ? (
            <div className="bg-muted/50 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2">
                {questions.map((q, i) => (
                  <li key={i} className="text-sm font-medium">
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic p-4 bg-muted/50 rounded-lg">
              No questions added yet.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-2 flex-wrap">
        <ChatbotDrawer interviewId={local.id} buttonSize="sm" />
        {!local.done && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedDate(
                      local.scheduled_at ? new Date(local.scheduled_at) : null
                    );
                    setQuestions([...local.questions]);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Interview
                </Button>
            
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

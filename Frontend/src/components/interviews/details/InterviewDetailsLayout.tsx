// src/components/interviews/details/InterviewDetailsLayout.tsx
"use client";

import React from "react";
import type { InterviewContext } from "@/apis/HR/interviewsApi";
import { InterviewOverview } from "./InterviewForms/InterviewOverview";
import { ApplicationDetails } from "./ApplicationDetailsInterview";
import { ChatHistoryDrawer } from "./chatbot/ChatHistoryDrawer";
import { MeetingSetup } from "./InterviewForms/MeetingSetup";

export interface InterviewDetailsLayoutProps {
  interview: InterviewContext;
}

export const InterviewDetailsLayout: React.FC<InterviewDetailsLayoutProps> = ({
  interview,
}) => {
  return (
    <div className="w-full">
      <div className="flex">
        <div className="flex flex-col gap-6 w-[600px] sticky top-6 left-0 self-start">
          <InterviewOverview interview={interview} />
          <MeetingSetup interview={interview} />
        </div>

        <div className="flex-1">
          <div className="mx-auto max-w-screen-2xl p-6">
            <ApplicationDetails interview={interview} />
          </div>
        </div>
      </div>
      <ChatHistoryDrawer buttonSize="default" />
    </div>
  );
};

// src/pages/HelpJobSeekerPage.tsx
"use client";

import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const seekerFaqs = [
  {
    question: "How do I apply for a job?",
    answer: (
      <p>
        Browse the “Job Postings” page, find a position you like, then click{" "}
        <strong>Apply</strong>. Fill out your details, upload your resume, and
        submit.
      </p>
    ),
  },
  {
    question: "Can I update my resume after applying?",
    answer: (
      <p>
        Yes. Go to “My Resumes” in your dashboard, upload a new version, then
        re-submit on the application detail page.
      </p>
    ),
  },
  {
    question: "How do I know if I’ve been accepted?",
    answer: (
      <p>
        Once your application is reviewed, the status will change under
        “Applications” in your dashboard. You’ll also receive an email
        notification.
      </p>
    ),
  },
  {
    question: "What if I want to decline an interview offer?",
    answer: (
      <p>
        In your dashboard, under “Interviews,” click into the scheduled
        interview and hit “Decline.” You’ll be prompted to confirm.
      </p>
    ),
  },
  {
    question: "Who can I contact for support?",
    answer: (
      <p>
        If you run into any issues, email{" "}
        <a href="mailto:support@resumy.ai">support@resumy.ai</a> or Call 
        +216 99 999 999. We’re here to help!
      </p>
    ),
  },
];

export default function HelpJobSeekerPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>FAQs Resumy</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {seekerFaqs.map((faq, i) => (
                <AccordionItem value={`faq-seeker-${i}`} key={i}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => navigate("/jobs")}>
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

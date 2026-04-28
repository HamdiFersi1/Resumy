// src/pages/HelpPage.tsx
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

const faqs = [
  {
    question: "How do I schedule an interview?",
    answer: (
      <p>
        Once an application is accepted, click the calendar button on its detail
        page. Pick your date/time and add any questions, then Save.
      </p>
    ),
  },
  {
    question: "Can I reschedule an interview?",
    answer: (
      <p>
        Yes — reopen the interview modal, click “Edit,” adjust date/time or
        questions, and then “Save.” Your changes take effect immediately.
      </p>
    ),
  },
  {
    question: "What happens when I decline an application?",
    answer: (
      <p>
        Declined applicants are removed from your interview queue and cannot be
        scheduled.
      </p>
    ),
  },
  {
    question: "How do I filter decisions by job or status?",
    answer: (
      <p>
        Use the toolbar at the top of the Decision Dashboard to pick “Accepted”
        or “Declined” and select a specific job from the dropdown. The table and
        charts will update automatically.
      </p>
    ),
  },
  {
    question: "How can I toggle dark mode?",
    answer: (
      <p>
        Open the Settings icon in the sidebar, then use the Dark/Light toggle.
        Your choice will persist across sessions.
      </p>
    ),
  },
  {
    question: "Can I export my data?",
    answer: (
      <p>
        At the moment, exporting isn’t built-in, but you can copy table data or
        use your browser’s print/PDF functionality. We plan to add a proper CSV
        export soon.
      </p>
    ),
  },
];

export function HelpPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex justify-start">
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem value={`faq-${i}`} key={i}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

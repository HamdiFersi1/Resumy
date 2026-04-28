"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export interface ApplicationSummary {
  id: number;
  applicant: string;
  job_title: string;
  decided_at: string;
}

export interface InterviewSummary {
  id: number;
  applicant: string;
  job_title: string;
  scheduled_at: string;
}

interface HRDetailTablesProps {
  accepted: ApplicationSummary[];
  declined: ApplicationSummary[];
  interviews: InterviewSummary[];
  activeTab: TabKey | "interviews";
  onTabChange: (tab: TabKey | "interviews") => void;
  acceptedFilter: string;
  onAcceptedFilter: (v: string) => void;
  declinedFilter: string;
  onDeclinedFilter: (v: string) => void;
  interviewFilter: string;
  onInterviewFilter: (v: string) => void;
}

export function HRDetailTables({
  accepted,
  declined,
  interviews,
  activeTab,
  onTabChange,
  acceptedFilter,
  onAcceptedFilter,
  declinedFilter,
  onDeclinedFilter,
  interviewFilter,
  onInterviewFilter,
}: HRDetailTablesProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-4">
      <TabsContent value="accepted">
        <Input
          placeholder="Filter by job title…"
          value={acceptedFilter}
          onChange={(e) => onAcceptedFilter(e.target.value)}
          className="mb-4 max-w-sm"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Decided At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accepted.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.applicant}</TableCell>
                <TableCell>{app.job_title}</TableCell>
                <TableCell>
                  {new Date(app.decided_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="declined">
        <Input
          placeholder="Filter by job title…"
          value={declinedFilter}
          onChange={(e) => onDeclinedFilter(e.target.value)}
          className="mb-4 max-w-sm"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Decided At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {declined.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.applicant}</TableCell>
                <TableCell>{app.job_title}</TableCell>
                <TableCell>
                  {new Date(app.decided_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="interviews">
        <Input
          placeholder="Filter by job title…"
          value={interviewFilter}
          onChange={(e) => onInterviewFilter(e.target.value)}
          className="mb-4 max-w-sm"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Scheduled At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((iv) => (
              <TableRow key={iv.id}>
                <TableCell>{iv.applicant}</TableCell>
                <TableCell>{iv.job_title}</TableCell>
                <TableCell>
                  {new Date(iv.scheduled_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}

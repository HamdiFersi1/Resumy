"use client";

import { useState, useEffect, useCallback } from "react";
import interviewsApi, { PaginatedInterviews } from "@/apis/HR/interviewsApi";
import { fetchApplicationDetail } from "@/apis/HR/applicationApi";
import { InterviewListTable } from "./InterviewListTable";
import { InterviewStatusChart } from "./InterviewStatusChart";
import { InterviewTotalChart } from "./InterviewTotalChart";

export interface EnrichedInterview {
  id: number;
  scheduled_at: string | null;
  created_at: string;
  questions: string[];
  applicationId: number;
  applicant: string;
  jobDisplay: string;
  done: boolean;
}

export default function InterviewListContainer() {
  const [rows, setRows] = useState<EnrichedInterview[]>([]);
  const [filteredRows, setFilteredRows] = useState<EnrichedInterview[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterField, setFilterField] = useState<"scheduled_at" | "created_at">("scheduled_at");
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.ceil(totalCount / perPage);

  const load = useCallback(async () => {
    const data: PaginatedInterviews = await interviewsApi.getPaginated({ page });
    setTotalCount(data.count);

    const enriched = await Promise.all(
      data.results.map(async (iv) => {
        const app = await fetchApplicationDetail(iv.application);
        return {
          id: iv.id,
          scheduled_at: iv.scheduled_at,
          created_at: iv.created_at,
          questions: iv.questions,
          applicationId: iv.application,
          applicant: app.applicant,
          jobDisplay: `${app.job.company_name} — ${app.job.title}`,
          done: iv.done,
        };
      })
    );

    setRows(enriched);
    setFilteredRows(enriched);
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const doneCount = filteredRows.filter((iv) => iv.done).length;
  const notDoneCount = filteredRows.filter((iv) => !iv.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InterviewStatusChart doneCount={doneCount} notDoneCount={notDoneCount} />
        <InterviewTotalChart
          interviews={filteredRows}
          selectedDate={selectedDate}
          filterField={filterField}
        />
      </div>

      <InterviewListTable
        interviews={rows}
        page={page}
        perPage={perPage}
        totalPages={totalPages}
        onPageChange={setPage}
        onFilteredChange={(filtered, date, field) => {
          setFilteredRows(filtered);
          setSelectedDate(date ?? null);
          setFilterField(field ?? "scheduled_at");
        }}
      />
    </div>
  );
}

// src/components/Rapport/ReportExporterTable.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  fetchAvailableDates,
  fetchReportCsv,
  fetchReportPdf,
  ReportType,
  AvailableDate,
} from "@/apis/HR/reportApi";

export function ReportExporterTable() {
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchAvailableDates()
      .then(setDates)
      .finally(() => setLoading(false));
  }, []);

  const types: { key: ReportType; label: string }[] = [
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
    { key: "interview", label: "Interviews" },
  ];

  if (loading) return <div className="p-4 text-center">Loading…</div>;
  if (!dates.length)
    return <div className="p-4 text-center">No data to export.</div>;

  const downloadCsv = async (date: string, type: ReportType) => {
    setBusy(true);
    try {
      const blob = await fetchReportCsv(date, type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${type}_${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download CSV.");
    } finally {
      setBusy(false);
    }
  };

  const downloadPdf = async (date: string) => {
    setBusy(true);
    try {
      const blob = await fetchReportPdf(date, date);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow className="bg-muted/40">
          <TableHead>Date</TableHead>
          {types.map((t) => (
            <TableHead key={t.key} className="text-center">
              {t.label}
            </TableHead>
          ))}
          <TableHead className="text-center">PDF</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-muted">
        {dates.map(({ date, accepted, declined, interview }) => (
          <TableRow key={date}>
            <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
            {types.map((t) => {
              const count = { accepted, declined, interview }[t.key];
              return (
                <TableCell key={t.key} className="text-center">
                  {count > 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => downloadCsv(date, t.key)}
                    >
                      {busy ? "…" : `CSV (${count})`}
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              );
            })}
            <TableCell className="text-center">
              <Button
                variant="default"
                size="sm"
                disabled={busy}
                onClick={() => downloadPdf(date)}
              >
                {busy ? "…" : "PDF"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

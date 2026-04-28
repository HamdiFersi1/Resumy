"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/Spinner";
import { FileText } from "lucide-react";
import { parseISO, format } from "date-fns";
import type { UsedResume } from "@/hooks/user/useDashboard";

export function UsedResumesList({ resumes }: { resumes: UsedResume[] }) {
  const [selected, setSelected] = useState<UsedResume | null>(null);
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  const handleView = async (r: UsedResume) => {
    if (selected?.parsed_resume_id === r.parsed_resume_id) {
      setSelected(null);
      return;
    }

    setSelected(r);
    const id = r.parsed_resume_id;
    if (blobUrls[id] || loadingId === id) return;

    setLoadingId(id);
    setErrorId(null);

    try {
      const res = await fetch(r.url!, { method: "GET" });
      if (!res.ok) throw new Error("Fetch failed");

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setBlobUrls((prev) => ({ ...prev, [id]: blobUrl }));
    } catch {
      setErrorId(id);
    } finally {
      setLoadingId(null);
    }
  };

  if (!resumes.length) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        You haven’t used any resumes yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-black dark:text-white">
        Resumes You’ve Applied With
      </h2>

      {selected && (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
          {loadingId === selected.parsed_resume_id ? (
            <div className="flex h-80 items-center justify-center bg-muted dark:bg-gray-900">
              <Spinner />
            </div>
          ) : errorId === selected.parsed_resume_id ? (
            <div className="p-6 text-red-600 text-center bg-muted dark:bg-gray-900">
              Couldn’t load preview.
            </div>
          ) : blobUrls[selected.parsed_resume_id] ? (
            <object
              data={blobUrls[selected.parsed_resume_id]}
              type="application/pdf"
              width="100%"
              height="600px"
              className="bg-white dark:bg-gray-900"
            >
              <p className="p-6 text-center text-gray-600 dark:text-gray-300">
                Preview unavailable.{" "}
                <a
                  href={blobUrls[selected.parsed_resume_id]}
                  download
                  className="underline"
                >
                  Download
                </a>
              </p>
            </object>
          ) : null}
        </div>
      )}

      <div className="grid gap-4">
        {resumes.map((r) => {
          const displayName = r.filename
            .replace(/^resumes\//, "")
            .replace(/\.pdf$/i, "");
          const dt = parseISO(r.applied_at);
          const appliedOn = isNaN(dt.getTime())
            ? "—"
            : format(dt, "MMM d, yyyy");

          return (
            <Card
              key={r.parsed_resume_id}
              className="border bg-white dark:bg-black dark:border-gray-700 hover:shadow transition"
            >
              <CardHeader className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-black dark:text-white" />
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Applied on {appliedOn}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-black dark:text-white border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  onClick={() => handleView(r)}
                >
                  {selected?.parsed_resume_id === r.parsed_resume_id
                    ? "Hide"
                    : "View"}
                </Button>
              </CardHeader>
              <CardContent className="p-0" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

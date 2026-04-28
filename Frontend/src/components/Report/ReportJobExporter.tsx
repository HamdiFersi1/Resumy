// // src/components/Rapport/ReportJobExporter.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
// import { fetchJobOptions } from "@/apis/HR/reportApi";
// import { fetchPopularityCsv, fetchPopularityPdf } from "@/apis/HR/reportApi";

// export function ReportJobExporter() {
//   const [jobs, setJobs] = useState<{ id: number; label: string }[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedJob, setSelectedJob] = useState<number | undefined>();
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     fetchJobOptions()
//       .then(setJobs)
//       .finally(() => setLoading(false));
//   }, []);

//   const download = async (asPdf = false) => {
//     if (!selectedJob) {
//       alert("Please select a job first.");
//       return;
//     }
//     setBusy(true);
//     try {
//       const blob = asPdf
//         ? await fetchPopularityPdf(selectedJob)
//         : await fetchPopularityCsv(selectedJob);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `job_${selectedJob}_popularity.${asPdf ? "pdf" : "csv"}`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch {
//       alert("Download failed. Please try again.");
//     } finally {
//       setBusy(false);
//     }
//   };

//   if (loading) return <div>Loading jobs…</div>;
//   if (!jobs.length) return <div>No jobs available.</div>;

//   return (
//     <div className="flex items-center space-x-4">
//       <Select
//         value={selectedJob?.toString() ?? ""}
//         onValueChange={(v) => setSelectedJob(v ? Number(v) : undefined)}
//       >
//         <SelectTrigger className="w-72">
//           <SelectValue placeholder="Pick job…" />
//         </SelectTrigger>
//         <SelectContent>
//           {jobs.map((j) => (
//             <SelectItem key={j.id} value={j.id.toString()}>
//               {j.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Button
//         variant="outline"
//         onClick={() => download(false)}
//         disabled={busy || selectedJob == null}
//       >
//         {busy ? "…" : "Download CSV"}
//       </Button>

//       <Button
//         variant="outline"
//         onClick={() => download(true)}
//         disabled={busy || selectedJob == null}
//       >
//         {busy ? "…" : "Download PDF"}
//       </Button>
//     </div>
//   );
// }

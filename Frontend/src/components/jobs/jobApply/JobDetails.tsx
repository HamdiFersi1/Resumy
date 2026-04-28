import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Job } from "@/apis/jobApi";
import { parseISO, isValid, differenceInCalendarDays, format } from "date-fns";

interface Props {
  job: Job;
}

const CONTRACT_LABELS: Record<string, string> = {
  FT: "Full-time",
  PT: "Part-time",
  IN: "Internship",
  CT: "Contract",
  FL: "Freelance",
};

export function JobDetails({ job }: Props) {
  let dateColorClass = "";
  let formattedDate = "";

  if (job.application_deadline) {
    const dt = parseISO(job.application_deadline);
    if (isValid(dt)) {
      dateColorClass =
        differenceInCalendarDays(dt, new Date()) < 0
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400";
      formattedDate = format(dt, "MMMM d, yyyy");
    }
  }

  const contractLabel = CONTRACT_LABELS[job.contract_type] || job.contract_type;

  return (
    <div className="space-y-8">
      {/* Title & Meta */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-black dark:text-white">{job.title}</h2>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <span>{job.company_name}</span>
          <Separator orientation="vertical" className="h-4 bg-gray-400 dark:bg-gray-600" />
          <span>{job.location}</span>
          <Separator orientation="vertical" className="h-4 bg-gray-400 dark:bg-gray-600" />
          <Badge variant="outline">{contractLabel}</Badge>
        </div>
        <div className="text-sm">
          <span className="font-medium">Application Deadline: </span>
          <span className={dateColorClass}>{formattedDate || "—"}</span>
        </div>
      </div>

      {/* Description */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Description</h3>
        <p className="whitespace-pre-line text-black dark:text-white">
          {job.job_description}
        </p>
      </section>

      {/* Experience */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Key Responsibilities</h3>
        <p className="whitespace-pre-line text-black dark:text-white">
          {job.required_experience}
        </p>
      </section>

      {/* Skills */}
      <section className="space-y-2">
  <h3 className="text-lg font-semibold text-black dark:text-white">
    Required Skills & Qualifications
  </h3>
  {job.required_skills ? (
    <ul className="flex flex-wrap gap-2 text-sm">
      {job.required_skills.split(",").map((skill, index) => (
        <li
          key={index}
          className="px-3 py-1 rounded-full border border-black dark:border-white text-sm text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {skill.trim()}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">Not specified.</p>
  )}
</section>



      {/* Education */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Education Required</h3>
        <p className="whitespace-pre-line text-black dark:text-white">
          {job.required_education}
        </p>
      </section>
    </div>
  );
}

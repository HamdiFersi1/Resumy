// src/components/Job/JobCard.tsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { parseISO, isValid, formatDistanceToNow } from "date-fns";
import { Star, StarOff, FileEdit, ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import jobApi, { Job, Favorite } from "@/apis/jobApi";
import { useTheme } from "@/components/ui/theme-provider";
import { fetchMyApplications } from "@/apis/HR/applicationApi";

const CONTRACT_LABELS: Record<string, string> = {
  FT: "Full-time",
  PT: "Part-time",
  IN: "Internship",
  CT: "Contract",
  FL: "Freelance",
};

interface JobCardProps {
  job: Job & {
    posted_at?: string;
    company_logo_url?: string;
    salary_range?: string;
    contract_type: string;
    is_open: boolean;
    company_name: string;
  };
}

export function JobCard({ job }: JobCardProps) {
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Check if user has already applied
  useEffect(() => {
    fetchMyApplications()
      .then((apps) => {
        if (apps.some((a) => a.job.id === job.id)) {
          setApplied(true);
        }
      })
      .catch(console.error);
  }, [job.id]);

  // Manage favorites
  useEffect(() => {
    jobApi.getFavorites().then((favs) => {
      const match = favs.find((f: Favorite) => f.job === job.id);
      if (match) setFavoriteId(match.id);
    });
  }, [job.id]);

  const handleToggleFavorite = async () => {
    try {
      if (favoriteId) {
        await jobApi.removeFavorite(favoriteId);
        setFavoriteId(null);
      } else {
        const fav = await jobApi.addFavorite(job.id);
        setFavoriteId(fav.id);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const rawDate = job.posted_at ?? job.created_at ?? "";
  const postedAgo = rawDate
    ? isValid(parseISO(rawDate))
      ? formatDistanceToNow(parseISO(rawDate), { addSuffix: true })
      : new Date(rawDate).toLocaleDateString()
    : "—";

  return (
    <>
      <motion.div
        whileHover={{ scale: applied ? 1 : 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card
          className={`flex flex-col h-96 rounded-2xl shadow-lg bg-background text-foreground ${
            applied ? "opacity-50" : ""
          }`}
        >
          <CardHeader className="flex-col space-y-3 pb-0">
            <div className="flex items-center justify-between">
              {job.company_logo_url && (
                <img
                  src={job.company_logo_url}
                  alt={`${job.company_name} logo`}
                  className="h-10 w-10 object-contain rounded"
                />
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {CONTRACT_LABELS[job.contract_type] ?? job.contract_type}
                </Badge>
                {!job.is_open && <Badge variant="destructive">Closed</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400"
                  onClick={handleToggleFavorite}
                >
                  <AnimatePresence mode="wait">
                    {favoriteId ? (
                      <motion.div
                        key="star-filled"
                        initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.3, rotate: 90, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                        }}
                      >
                        <StarOff className="fill-yellow-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="star-empty"
                        initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                        animate={{ scale: 1.2, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0.3, rotate: 90, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 20,
                        }}
                      >
                        <Star />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>

            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {job.category} • {job.location} • {job.experience_level}
            </CardDescription>
            {job.salary_range && (
              <span className="text-sm font-medium">{job.salary_range}</span>
            )}
          </CardHeader>

          <CardContent className="flex-1 text-sm whitespace-pre-line overflow-hidden text-ellipsis line-clamp-6">
            {job.job_description}
          </CardContent>

          <CardFooter className="flex items-center justify-between pt-0 mt-auto">
            <time className="text-xs text-muted-foreground" dateTime={rawDate}>
              {postedAgo}
            </time>
            <Button
              size="sm"
              className="px-6 py-2"
              onClick={() => setOpen(true)}
              disabled={applied || !job.is_open}
            >
              {applied ? "Applied" : "Apply"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-50 p-4 flex items-center justify-center backdrop-blur-md ${
              theme === "dark"
                ? "bg-black/60 text-white"
                : "bg-white/90 text-black"
            }`}
          >
            <div className="relative w-full max-w-5xl h-[90vh] bg-background text-foreground rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-5 text-lg font-bold text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>

              <div className="px-6 pt-6 text-center">
                <h2 className="text-3xl font-bold">
                  Important Before Applying
                </h2>
                <p className="text-sm mt-2 text-muted-foreground">
                  We use AI to parse your resume. Non-ATS formats may hurt your
                  score.
                </p>
              </div>

              <div className="flex-1 flex flex-col md:flex-row gap-6 px-6 py-4 overflow-hidden">
                {/* Left */}
                <div className="w-full md:w-[42%] flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto pr-2">
                    <h3 className="text-lg font-semibold mb-3">
                      Why this matters
                    </h3>
                    <ul className="list-disc pl-5 text-sm space-y-3 text-muted-foreground">
                      <li>
                        <b>AI Parsing:</b> Non-standard layouts can cause
                        parsing issues.
                      </li>
                      <li>
                        <b>Low Match Score:</b> Missing key details reduces
                        match rate.
                      </li>
                      <li>
                        <b>ATS Rules:</b> Avoid tables, graphics, or columns.
                      </li>
                      <li>
                        <b>Complete Data:</b> Ensure sections like skills &
                        experience are visible.
                      </li>
                    </ul>

                    <div className="mt-5 p-4 rounded-xl border border-border bg-muted/30 flex gap-3">
                      <Sparkles className="w-5 h-5 text-sky-500 mt-1" />
                      <div className="text-sm leading-relaxed text-muted-foreground">
                        <p className="text-base font-semibold text-foreground mb-1">
                          Recommendation
                        </p>
                        Use our resume builder to ensure your CV is parsed
                        correctly and scored fairly.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      variant="secondary"
                      className="w-full text-base py-4 gap-2 hover:bg-sky-500 hover:text-white"
                      onClick={() => navigate("/new-resume")}
                    >
                      <FileEdit className="w-4 h-4" />
                      Create ATS Resume
                    </Button>
                    <Button
                      className="w-full text-base py-4 gap-2 hover:bg-green-500 hover:text-white"
                      onClick={() => navigate(`/jobs/${job.id}/apply`)}
                    >
                      Continue Anyway
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-[1px] bg-border" />

                {/* Right */}
                <div className="w-full md:w-[58%] h-full flex items-center justify-center">
                  <img
                    src="/openresume-resume_page-0001.jpg"
                    alt="Resume Preview"
                    className="w-full h-full object-contain rounded border border-border shadow-md"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

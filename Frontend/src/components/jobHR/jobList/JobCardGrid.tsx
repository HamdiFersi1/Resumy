// src/components/jobList/JobCardGrid.tsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  X,
  Check,
} from "lucide-react";
import { Job } from "@/apis/jobApi";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface Props {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  onDelete: (id: number) => void;
  onClose?: (id: number) => void;
  onReopen?: (id: number) => void;
}

export function JobCardGrid({
  jobs,
  loading,
  error,
  onDelete,
  onClose,
  onReopen,
}: Props) {
  const navigate = useNavigate();
  const [jobToAct, setJobToAct] = useState<Job | null>(null);
  const [action, setAction] = useState<"delete" | "close" | "reopen" | null>(null);

  const confirmAction = () => {
    if (!jobToAct || !action) return;

    try {
      if (action === "delete") {
        onDelete(jobToAct.id);
      } else if (action === "close" && onClose) {
        onClose(jobToAct.id);
      } else if (action === "reopen" && onReopen) {
        onReopen(jobToAct.id);
      }
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setJobToAct(null);
      setAction(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No job postings found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, idx) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg line-clamp-1">
                    {job.title}
                  </CardTitle>
                  <Badge variant="secondary">{job.contract_type}</Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {job.company_name} · {job.location}
                </p>
              </CardContent>

              <hr className="my-2 mx-4" />

              <CardFooter className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/jobpostings/${job.id}`)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/jobpostings/${job.id}/edit`)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setJobToAct(job);
                          setAction("delete");
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-red-100 text-red-600">
                            <Trash2 className="h-6 w-6" />
                          </div>
                          <div>
                            <AlertDialogTitle className="text-left">
                              Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                              This will permanently delete this job posting.
                            </AlertDialogDescription>
                          </div>
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="gap-1">
                          <X className="h-4 w-4" />
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmAction}
                          className="gap-1 bg-red-600 hover:bg-red-700"
                        >
                          <Check className="h-4 w-4" />
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {(onClose || onReopen) && (
                  <div className="flex justify-center w-full">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            job.is_open
                              ? "text-purple-600 hover:text-purple-700"
                              : "text-green-600 hover:text-green-700"
                          }
                          onClick={() => {
                            setJobToAct(job);
                            setAction(job.is_open ? "close" : "reopen");
                          }}
                        >
                          {job.is_open ? (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Close
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Reopen
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-full ${
                                job.is_open
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {job.is_open ? (
                                <Lock className="h-6 w-6" />
                              ) : (
                                <Unlock className="h-6 w-6" />
                              )}
                            </div>
                            <div>
                              <AlertDialogTitle className="text-left">
                                {job.is_open
                                  ? "Close Job Posting"
                                  : "Reopen Job Posting"}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-left">
                                {job.is_open
                                  ? "This will prevent new applicants from applying. Existing applications will remain."
                                  : "This will allow new applicants to apply for this position."}
                              </AlertDialogDescription>
                            </div>
                          </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="gap-1">
                            <X className="h-4 w-4" />
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmAction}
                            className={`gap-1 ${
                              job.is_open
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

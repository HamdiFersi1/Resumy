"use client";

import { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { JobDetails } from "./JobDetails";
import { ResumeUploadForm } from "./ResumeUploadForm";
import { useApplyJob } from "@/hooks/jobs/useApplyJob";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function JobApplyContent() {
  const {
    job,
    loadingJob,
    jobError,
    fullNameState: [fullName, setFullName],
    emailState: [email, setEmail],
    fileState: [file, setFileEvent],
    uploading,
    uploadError,
    handleUpload,
  } = useApplyJob();

  const handleFileChange = (file: File) => {
    const syntheticEvent = {
      target: { files: [file] },
    } as unknown as ChangeEvent<HTMLInputElement>;
    setFileEvent(syntheticEvent);
  };

  if (loadingJob) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <Spinner size="lg" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black p-6 text-center">
        <p className="text-2xl font-medium text-black dark:text-white mb-4">
          {jobError ?? "Job not found"}
        </p>
        <Link
          to="/jobs"
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-300 transition-colors duration-200 font-medium"
        >
          Back to Job Listings
        </Link>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-black min-h-screen text-black dark:text-white"
    >
      <div className="mx-auto px-4 sm:px-8 py-12 md:py-20 max-w-screen-xl space-y-12">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link 
            to="/jobs" 
            className="flex items-center text-lg font-medium hover:underline transition-colors text-black dark:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Listings
          </Link>
          <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 dark:text-white text-black px-3 py-1.5 rounded-full">
            Step 2 of 2 • Application
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Job Details */}
          <aside className="lg:col-span-3">
            <Card className="bg-white dark:bg-neutral-900 text-black dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <CardHeader className="pb-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Job Details
                </h2>
              </CardHeader>
              <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
              <CardContent className="space-y-6">
                <JobDetails job={job} />
              </CardContent>
            </Card>
          </aside>

          {/* Right: Form */}
          <section className="lg:col-span-2">
            <Card className="bg-white dark:bg-neutral-900 text-black dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 p-8 sticky top-24">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 mb-4"></div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Your Application
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Applying for: <span className="font-semibold text-black dark:text-white">{job.title}</span>
                </p>
              </div>
              
              <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
              
              <CardContent className="flex flex-col items-center">
                <div className="w-full max-w-md space-y-6">      
                  <ResumeUploadForm
                    fullName={fullName}
                    setFullName={setFullName}
                    email={email}
                    setEmail={setEmail}
                    file={file}
                    onFileChange={handleFileChange}
                    uploading={uploading}
                    uploadError={uploadError}
                    onUpload={handleUpload}
                  />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </motion.main>
  );
}

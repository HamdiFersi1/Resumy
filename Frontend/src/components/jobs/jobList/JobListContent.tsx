"use client";

import { motion } from "framer-motion";
import { useJobListPageLogic } from "@/hooks/jobs/useJobListPage";
import { FilterSection } from "./FilterSection";
import { JobCard } from "./JobCard";
import { Pagination } from "./Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";

export default function JobListContent() {
  const {
    filters,
    page,
    jobs,
    loading,
    error,
    totalPages,
    handleFilterChange,
    resetFilters,
    setPage,
  } = useJobListPageLogic();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 sm:px-6 py-12 space-y-12 bg-background text-foreground"
    >
      {/* Header */}
      <header className="text-center space-y-4">
        <motion.h1
          className="text-4xl md:text-5xl font-bold tracking-tight"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          Find Your <span className="text-primary">Dream Job</span>
        </motion.h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover opportunities that match your skills and ambitions
        </p>
      </header>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 bg-background border border-border rounded-xl shadow-sm px-6 py-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Refine Your Search</h2>
        </div>
        <FilterSection
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      </motion.div>

      {/* Results */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {jobs.length > 0 ? `${jobs.length} Opportunities` : "No Results"}
          </h2>

          {totalPages > 1 && (
            <div className="hidden sm:flex">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>

        <Separator className="bg-border" />

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" className="text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-400/30 rounded-lg p-4 text-red-600 text-center">
            {error}
          </div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-6">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </motion.main>
  );
}

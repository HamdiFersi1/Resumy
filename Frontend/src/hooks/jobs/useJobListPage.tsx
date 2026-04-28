// src/hooks/useJobListPageLogic.ts
import { useState, useMemo } from "react"
import {
  useJobList,
  type JobQueryParams,
} from "@/hooks/jobs/useJobHook"

export function useJobListPageLogic() {
  // Initialize all available filters
  const [filters, setFilters] = useState<JobQueryParams>({
    category: "",
    location: "",
    experience_level: "",
    contract_type: "",   // Full‑time, Part‑time, etc.
    open: true,          // only show open listings
    search: "",          // keyword search across title/description
    ordering: "",        // e.g. "-application_deadline"
  })

  const [page, setPage] = useState(1)

  // Pull the current page of jobs
  const { jobs, count, loading, error } = useJobList(filters, page)
  const totalPages = useMemo(() => Math.ceil(count / 10), [count])

  // Call this to change any filter and reset back to page 1
  const handleFilterChange = (
    field: keyof JobQueryParams,
    value: string | boolean
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
    setPage(1)
  }

  // Reset everything back to defaults
  const resetFilters = () => {
    setFilters({
      category: "",
      location: "",
      experience_level: "",
      contract_type: "",
      open: true,
      search: "",
      ordering: "",
    })
    setPage(1)
  }

  return {
    filters,
    page,
    jobs,
    count,
    loading,
    error,
    totalPages,
    handleFilterChange,
    resetFilters,
    setPage,
  }
}

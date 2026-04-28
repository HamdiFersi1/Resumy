// src/components/jobList/SearchHeader.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { Search, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  filter: string;
  onFilterChange: (v: string) => void;
  onClear: () => void;
}

export function SearchHeader({ filter, onFilterChange, onClear }: Props) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-20 mb-8 px-4 py-4 rounded-b shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 pr-8"
            placeholder="Search by title or company"
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
          />
          {filter && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => navigate("/jobpostings/new")}>
          Add Posting
        </Button>
      </div>
    </div>
  );
}

// src/components/decisionDashboard/DecisionLeaderboard.tsx
"use client";

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Eye, Calendar as CalendarIcon } from "lucide-react";
import interviewsApi from "@/apis/HR/interviewsApi";
import { Button } from "@/components/ui/button";

export interface DecisionLeaderboardTableProps {
  decisions: Array<{
    id: number;
    applicant: string;
    job_title: string;
    total_score: number | null; // allow null
    applied_at: string;
    status: string;
  }>;
  page: number;
  perPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function DecisionLeaderboardTable({
  decisions,
  page,
  perPage,
  totalPages,
  onPageChange,
}: DecisionLeaderboardTableProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  type MenuState = { x: number; y: number; appId: number };
  const [menu, setMenu] = useState<MenuState | null>(null);

  const closeMenu = () => setMenu(null);

  const openMenu = (e: React.MouseEvent, appId: number) => {
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    setMenu({
      appId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const goToInterview = async (appId: number) => {
    try {
      const data = await interviewsApi.getPaginated({ application: appId });
      if (data.results.length) {
        navigate(`/interviews/${data.results[0].id}`);
      } else {
        alert("No interview scheduled yet.");
      }
    } catch {
      alert("Failed to load interview info.");
    } finally {
      closeMenu();
    }
  };

  const selected = menu && decisions.find((d) => d.id === menu.appId);

  return (
    <div ref={containerRef} className="relative" onClick={closeMenu}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Candidates</CardTitle>
        </CardHeader>
        {/* 
          Only scroll horizontally if the content truly overflows 
          (remove the always-on overflow-x-auto)
        */}
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Applied At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-muted">
                {decisions.map((d, idx) => {
                  const isOpen = menu?.appId === d.id;
                  return (
                    <TableRow
                      key={d.id}
                      className={`cursor-pointer transition-colors ${
                        isOpen ? "bg-accent/10" : "hover:bg-muted/20"
                      }`}
                      onContextMenu={(e) => openMenu(e, d.id)}
                      onClick={(e) => openMenu(e, d.id)}
                    >
                      <TableCell className="font-medium">
                        {(page - 1) * perPage + idx + 1}
                      </TableCell>
                      <TableCell>{d.applicant}</TableCell>
                      <TableCell>{d.job_title}</TableCell>
                      <TableCell>{d.status}</TableCell>
                      <TableCell className="text-right">
                        {/* guard against null: */}
                        {(d.total_score ?? 0).toFixed(4)}
                      </TableCell>
                      <TableCell>
                        {new Date(d.applied_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="justify-center gap-4 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </CardFooter>
      </Card>

      {menu && selected && (
        <div
          className="absolute z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          style={{ top: menu.y, left: menu.x, minWidth: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-3 text-sm hover:bg-muted/20"
            onClick={() => {
              navigate(`/application/${selected.id}`);
              closeMenu();
            }}
          >
            <Eye className="mr-2 h-4 w-4" /> View Details
          </Button>
          <div className="h-px bg-border" />
          {selected.status === "accepted" && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-4 py-3 text-sm hover:bg-muted/20"
              onClick={() => goToInterview(selected.id)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" /> Go to Interview
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

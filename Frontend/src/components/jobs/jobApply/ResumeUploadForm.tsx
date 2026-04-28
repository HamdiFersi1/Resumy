"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

interface ResumeUploadFormProps {
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  file: File | null;
  onFileChange: (file: File) => void;
  uploading: boolean;
  uploadError: string | null;
  onUpload: () => void;
}

export function ResumeUploadForm({
  fullName,
  setFullName,
  email,
  setEmail,
  file,
  onFileChange,
  uploading,
  uploadError,
  onUpload,
}: ResumeUploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover" || e.type === "dragenter") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileChange(e.dataTransfer.files[0]);
      }
    },
    [onFileChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  const openFileDialog = () => inputRef.current?.click();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpload();
  };

  const removeFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      onFileChange(null as unknown as File);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Resume *</Label>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`
            relative flex flex-col items-center justify-center text-center cursor-pointer
            border-2 border-dashed rounded-lg p-8 transition-all duration-200
            ${dragActive ? "border-primary bg-muted" : "border-border hover:border-primary/50"}
            ${file ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleChange}
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-10 w-10 text-green-600" />
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Drag & drop</span> your resume here
                <br />
                or <span className="underline">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">PDF, Max. 5MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="text-sm text-red-600 bg-red-100 dark:bg-red-900 p-3 rounded-md">
          {uploadError}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={uploading || !file}
        className="w-full py-3 text-base font-semibold"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}

"use client";

import { FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, CheckCircle2, XCircle } from "lucide-react";

export interface ProfileFormProps {
  firstName: string;
  lastName: string;
  loading: boolean;
  error?: string;
  success?: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}

export function ProfileForm({
  firstName,
  lastName,
  loading,
  error,
  success,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  onCancel,
}: ProfileFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(e);
    window.location.href = "/Udashboard";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-md rounded-xl border border-border overflow-hidden">
        <CardHeader className="bg-background text-center p-6 border-b border-border">
          <Avatar className="mx-auto w-20 h-20 border-2 border-border">
            <AvatarFallback className="bg-muted">
              <User className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-2xl font-semibold text-foreground">
            Profile Settings
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your personal information
          </p>
        </CardHeader>

        <CardContent className="bg-background p-6 space-y-5">
          {error && (
            <div className="flex items-center space-x-2 bg-muted border border-border p-3 rounded">
              <XCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-foreground">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-2 bg-muted border border-border p-3 rounded">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-foreground">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-foreground">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2 rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-full"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-foreground"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/Spinner"; // ← Import Spinner

import { useLogin } from "@/hooks/auth/useLoginHook";
import authApi from "@/apis/authApi";

export default function LoginPage() {
  /* -------------------------------------------------------------------- */
  /* authentication hook values                                           */
  /* -------------------------------------------------------------------- */
  const {
    email,
    setEmail,
    password,
    setPassword,
    error: authError,
    loading: loginLoading, // ← extract loading
    handleSubmit,
  } = useLogin();

  /* -------------------------------------------------------------------- */
  /* forgot-password local state                                          */
  /* -------------------------------------------------------------------- */
  const [forgotMode, setForgotMode] = useState(false); // toggle view
  const [forgotMsg, setForgotMsg] = useState(""); // success / error
  const [forgotLoading, setForgotLoading] = useState(false);

  /* -------------------------------------------------------------------- */
  /* helper: send reset-password request                                  */
  /* -------------------------------------------------------------------- */
  const handleForgotPassword = async () => {
    const trimmed = email.trim();

    // local validation first
    if (!trimmed) {
      setForgotMsg(" Please enter your email address first.");
      return;
    }

    setForgotLoading(true);
    setForgotMsg("");

    try {
      const res = await authApi.forgotPassword(trimmed);
      setForgotMsg(
        `✅ ${
          res.message || "A reset e-mail has been sent. Check your inbox ✉️"
        }`
      );
    } catch (err) {
      /* Map common error cases to friendly messages */
      let msg = " Oops, something went wrong. Please try again.";

      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;

        switch (status) {
          case 404:
            msg =
              " We couldn’t find any account with that e-mail. Check the spelling or sign up instead.";
            break;
          case 400:
            msg =
              data?.error ||
              " The e-mail field is required. Please enter your address.";
            break;
          default:
            msg = data?.error || data?.detail || msg;
        }
      } else if (err instanceof Error) {
        /* network / unexpected */
        msg = `❌ ${err.message}`;
      }

      setForgotMsg(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  /* -------------------------------------------------------------------- */
  /* render                                                               */
  /* -------------------------------------------------------------------- */
  return (
    <div className={cn("flex flex-col gap-6", "max-w-md mx-auto p-4")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
          <CardDescription>Log in with your email and password</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* auth error from login hook */}
              {authError && (
                <div className="text-red-600 text-center">{authError}</div>
              )}

              {/* forgot-password success / error */}
              {forgotMsg && (
                <div className="text-sm text-center text-blue-600">
                  {forgotMsg}
                </div>
              )}

              {/* e-mail field (always shown) */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* password + login button only when not in forgot-password mode */}
              {!forgotMode && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full flex justify-center items-center"
                    disabled={loginLoading} // ← disable while loading
                  >
                    {loginLoading && <Spinner size="sm" className="mr-2" />}
                    {/* ← show spinner while logging in */}
                    {loginLoading ? "Logging in…" : "Login"}
                  </Button>
                </>
              )}

              {/* forgot-password submit button */}
              {forgotMode && (
                <Button
                  type="button"
                  className="w-full"
                  disabled={forgotLoading}
                  onClick={handleForgotPassword}
                >
                  {forgotLoading ? "Sending e-mail…" : "Send Reset Link"}
                </Button>
              )}

              {/* footer links */}
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  className="text-primary underline"
                  onClick={() => {
                    setForgotMode((prev) => !prev);
                    setForgotMsg("");
                  }}
                >
                  {forgotMode ? "Back to Login" : "Forgot password?"}
                </button>

                <a href="/signup" className="text-primary underline">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// src/pages/settings/AccountSettingsPage.tsx
"use client";

import { useState, useEffect, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { AuthContext, AuthContextType } from "@/hooks/context/AuthContext";
import { cn } from "@/lib/utils";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/";

export default function AccountSettingsPage() {
  /* ——— context / nav ——— */
  const { user, setUser, changePassword } = useContext(
    AuthContext
  ) as AuthContextType;
  const navigate = useNavigate();

  /* ——— state ——— */
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPwd, setOld] = useState("");
  const [newPwd, setNew] = useState("");
  const [cnfPwd, setCnf] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [banner, setBanner] = useState<
    | undefined
    | { type: "success" | "error"; msg: string }
  >();

  /* ——— load profile once ——— */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}account/dashboarduser/profile/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (!res.ok) throw new Error();
        const d = await res.json();
        setFname(d.first_name || "");
        setLname(d.last_name || "");
      } catch {
        setBanner({ type: "error", msg: "Could not load profile." });
      }
    })();
  }, []);

  /* ——— profile save ——— */
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setBanner(undefined);

    try {
      await fetch(`${API}account/dashboarduser/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ first_name: fname, last_name: lname }),
      });
      setUser({ ...user!, first_name: fname, last_name: lname });
      setBanner({ type: "success", msg: "Profile updated" });
    } catch {
      setBanner({ type: "error", msg: "Profile update failed" });
    } finally {
      setSavingProfile(false);
    }
  }

  /* ——— password save ——— */
  async function savePwd(e: FormEvent) {
    e.preventDefault();
    setSavingPwd(true);
    setBanner(undefined);

    if (newPwd !== cnfPwd) {
      setBanner({ type: "error", msg: "Passwords do not match" });
      setSavingPwd(false);
      return;
    }

    const ok = await changePassword(oldPwd, newPwd);
    setBanner(
      ok
        ? { type: "success", msg: "Password changed. Please log in again." }
        : { type: "error", msg: "Password change failed." }
    );
    setSavingPwd(false);
  }

  /* ——— UI ——— */
  return (
    <main
      className={cn(
        "min-h-screen flex items-center justify-center px-4 py-12",
        /* light */
        "bg-gradient-to-b from-neutral-50 to-neutral-100",
        /* dark  */
        "dark:bg-black"
      )}
    >
      <section
        className={cn(
          "w-full max-w-lg p-8 space-y-10 rounded-2xl shadow-card backdrop-blur-xs",
          /* light glass */
          "bg-white/60 ring-1 ring-white/20",
          /* dark glass */
          "dark:bg-neutral-900/70 dark:ring-neutral-700"
        )}
      >
        {/* header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">
            Account Settings
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Manage your personal info & password
          </p>
        </div>

        {/* banner */}
        {banner && (
          <Alert
            variant={banner.type === "success" ? "success" : "destructive"}
            className={cn(
              "backdrop-blur-xs",
              "bg-white/70",
              "dark:bg-neutral-900/70"
            )}
          >
            {banner.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle className="capitalize">{banner.type}</AlertTitle>
            <AlertDescription>{banner.msg}</AlertDescription>
          </Alert>
        )}

        {/* tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="mx-auto flex gap-2 bg-transparent shadow-none">
            {["profile", "password"].map((v) => (
              <TabsTrigger
                key={v}
                value={v}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium",
                  "focus-visible:ring-2 focus-visible:ring-primary/50",
                  "data-[state=active]:bg-white/80 data-[state=active]:shadow",
                  "dark:data-[state=active]:bg-neutral-800/70"
                )}
              >
                {v === "profile" ? "Profile" : "Password"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* —— PROFILE —— */}
          <TabsContent value="profile">
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xs ring-1 ring-white/10 dark:ring-neutral-600">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your name details</CardDescription>
              </CardHeader>

              <form onSubmit={saveProfile}>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {[
                    ["First name", fname, setFname, "fn"],
                    ["Last name", lname, setLname, "ln"],
                  ].map(([label, val, setVal, id]) => (
                    <div key={id as string} className="flex flex-col gap-1">
                      <Label htmlFor={id as string}>{label}</Label>
                      <Input
                        id={id as string}
                        value={val as string}
                        onChange={(e) => (setVal as any)(e.target.value)}
                        className="h-11 rounded-xl placeholder:text-neutral-400 dark:bg-neutral-800/40"
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    disabled={savingProfile}
                    className="h-11 rounded-xl shadow-md hover:shadow-lg"
                  >
                    {savingProfile && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Save
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* —— PASSWORD —— */}
          <TabsContent value="password">
            <Card className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xs ring-1 ring-white/10 dark:ring-neutral-600">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Use a strong password you don't reuse elsewhere.
                </CardDescription>
              </CardHeader>

              <form onSubmit={savePwd}>
                <CardContent className="space-y-4">
                  {[
                    ["Current password", oldPwd, setOld, "old"],
                    ["New password", newPwd, setNew, "new"],
                    ["Confirm new password", cnfPwd, setCnf, "cnf"],
                  ].map(([label, val, setVal, id]) => (
                    <div key={id as string} className="flex flex-col gap-1">
                      <Label htmlFor={id as string}>{label}</Label>
                      <Input
                        id={id as string}
                        type="password"
                        value={val as string}
                        onChange={(e) => (setVal as any)(e.target.value)}
                        className="h-11 rounded-xl dark:bg-neutral-800/40"
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    disabled={savingPwd}
                    className="h-11 rounded-xl shadow-md hover:shadow-lg"
                  >
                    {savingPwd && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Update password
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

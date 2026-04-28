// src/pages/settings/AccountSettingsTabs.tsx
"use client";

import { useState, useContext, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AuthContext, AuthContextType } from "@/hooks/context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/";

export default function AccountSettingsTabs() {
  const { user, setUser, changePassword } = useContext(
    AuthContext
  ) as AuthContextType;
  const navigate = useNavigate();

  /* ── profile state ── */
  const [first, setFirst] = useState(user?.first_name ?? "");
  const [last, setLast] = useState(user?.last_name ?? "");
  const [savingProf, setSavingProf] = useState(false);

  /* ── password state ── */
  const [oldPwd, setOld] = useState("");
  const [newPwd, setNew] = useState("");
  const [cnfPwd, setCnf] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [banner, setBanner] = useState<
    | undefined
    | { t: "success" | "error"; msg: string }
  >();

  const rules = [
    { id: 1, re: /[A-Z]/, text: "Upper-case letter" },
    { id: 2, re: /[0-9]/, text: "Number" },
    { id: 3, re: /.{8,}/, text: "8+ characters" },
  ];
  const passOK = (re: RegExp) => re.test(newPwd);

  /* ── helpers ── */
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSavingProf(true);
    setBanner(undefined);
    try {
      await fetch(`${API}account/dashboarduser/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ first_name: first, last_name: last }),
      });
      setUser({ ...user!, first_name: first, last_name: last });
      setBanner({ t: "success", msg: "Profile updated" });
    } catch {
      setBanner({ t: "error", msg: "Update failed" });
    } finally {
      setSavingProf(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    if (newPwd !== cnfPwd) {
      setBanner({ t: "error", msg: "Passwords do not match" });
      return;
    }
    if (!rules.every((r) => passOK(r.re))) {
      setBanner({ t: "error", msg: "Weak password" });
      return;
    }
    setSavingPwd(true);
    const ok = await changePassword(oldPwd, newPwd);
    setSavingPwd(false);
    setBanner(
      ok
        ? { t: "success", msg: "Password changed — log in again." }
        : { t: "error", msg: "Password change failed" }
    );
    ok && setTimeout(() => navigate("/login"), 2500);
  }

  /* ── UI ── */
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center px-4 py-12
                 bg-gradient-to-b from-neutral-50 to-neutral-100
                 dark:bg-black"
    >
      <section
        className="w-full max-w-lg backdrop-blur-xs p-8 rounded-2xl shadow-card
                   space-y-8 bg-white/60 ring-1 ring-white/20
                   dark:bg-neutral-900/70 dark:ring-neutral-700"
      >
        <h1 className="text-center text-2xl font-semibold tracking-tight
                       text-neutral-800 dark:text-neutral-100">
          Account Settings
        </h1>

        {banner && (
          <Alert
            variant={banner.t === "success" ? "success" : "destructive"}
            className="backdrop-blur-xs bg-white/70 dark:bg-neutral-900/70"
          >
            <AlertTitle>{banner.msg}</AlertTitle>
          </Alert>
        )}

        {/* ── TOP NAV TABS ── */}
        <Tabs defaultValue="profile">
          <TabsList
            className="mx-auto mb-6 flex gap-2 bg-transparent shadow-none
                       justify-center"               /* ← center tab bar */
          >
            {["profile", "password"].map((v) => (
              <TabsTrigger
                key={v}
                value={v}
                className="rounded-full px-4 py-1.5 text-sm font-medium
                           data-[state=active]:bg-white/80 data-[state=active]:shadow
                           dark:data-[state=active]:bg-neutral-800/70"
              >
                {v === "profile" ? "Profile" : "Password"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ===== PROFILE TAB ===== */}
          <TabsContent value="profile">
            <form
              onSubmit={saveProfile}
              className="space-y-4 max-w-sm mx-auto"   /* ← centre form */
            >
              <div>
                <Label>Email</Label>
                <Input disabled value={user?.email ?? ""} className="opacity-60" />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  disabled
                  value={user?.username ?? ""}
                  className="opacity-60"
                />
              </div>
              <div>
                <Label htmlFor="first">First name</Label>
                <Input
                  id="first"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="last">Last name</Label>
                <Input
                  id="last"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                />
              </div>
              <Button disabled={savingProf} className="w-full">
                {savingProf && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </TabsContent>

          {/* ===== PASSWORD TAB ===== */}
          <TabsContent value="password">
            <form
              onSubmit={savePassword}
              className="space-y-4 max-w-sm mx-auto"   /* ← centre form */
            >
              <div>
                <Label htmlFor="old">Current password</Label>
                <Input
                  id="old"
                  type="password"
                  value={oldPwd}
                  onChange={(e) => setOld(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNew(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cnf">Confirm new password</Label>
                <Input
                  id="cnf"
                  type="password"
                  value={cnfPwd}
                  onChange={(e) => setCnf(e.target.value)}
                />
              </div>

              {newPwd && (
                <ul className="text-sm">
                  {rules.map((r) => (
                    <li
                      key={r.id}
                      className={passOK(r.re) ? "text-green-600" : "text-red-600"}
                    >
                      {r.text}
                    </li>
                  ))}
                </ul>
              )}

              <Button disabled={savingPwd} className="w-full">
                {savingPwd && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </section>
    </motion.main>
  );
}

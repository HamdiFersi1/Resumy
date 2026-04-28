// src/pages/SignupPage.tsx
import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext, AuthContextType } from "@/hooks/context/AuthContext";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  /* context & routing */
  const auth = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();
  const location = useLocation();
  const isHrSignup = location.pathname.includes("hr"); // /signup-hr

  /* local form state */
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* password requirements */
  const passwordRules = [
    { id: 1, regex: /[A-Z]/, text: "Upper-case letter" },
    { id: 2, regex: /[0-9]/, text: "Number" },
    { id: 3, regex: /.{8,}/, text: "8+ characters" },
  ];
  const isRuleOk = (r: RegExp) => r.test(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};

    // Basic required checks
    ["first_name", "last_name", "username", "email"].forEach((f) => {
      if (!formData[f as keyof typeof formData]) errs[f] = "Required";
    });

    if (!isHrSignup) {
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = "Passwords do not match";
      }
      passwordRules.forEach((r) => {
        if (!isRuleOk(r.regex)) errs.password = "Password weak";
      });
    }

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    /* --------------- submit to backend ------------------------------ */
    setIsSubmitting(true);
    try {
      // Call signup or signupHr and unpack { ok, isActive }
      let result: { ok: boolean; isActive: boolean };
      if (isHrSignup) {
        result = await auth.signupHr({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          role: "hr",
        });
      } else {
        result = await auth.signup({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.confirmPassword,
          role: "user",
        });
      }

      if (!result.ok) {
        setErrors({ form: "Signup failed. Try again." });
      } else {
        // If user is inactive (needs email confirmation), send them to the “Please confirm email” page
        if (!result.isActive) {
          setSuccess(true);
          setTimeout(() => navigate("/please-confirm-email"), 1000);
        } else {
          // If the new account was already active (rare), go to the correct dashboard
          setSuccess(true);
          setTimeout(() => {
            if (isHrSignup) navigate("/dashboard");
            else navigate("/Udashboard");
          }, 1000);
        }
      }
    } catch {
      setErrors({ form: "Signup failed. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-8 rounded-xl bg-background shadow-lg border border-border"
    >
      {/* success banner */}
      {success ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">
            {isHrSignup ? "HR Account Created!" : "Account Created!"}
          </h2>
          <p className="text-muted-foreground">
            {`Redirecting you to ${
              isHrSignup ? "HR Dashboard" : "confirmation page"
            }…`}
          </p>
        </div>
      ) : (
        <>
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {isHrSignup ? "Create HR Account" : "Create Account"}
            </h1>
          </div>

          {errors.form && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg flex items-start">
              <X className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={cn(errors.first_name && "border-red-500")}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={cn(errors.last_name && "border-red-500")}
                />
              </div>
            </div>

            {/* Username / Email */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={handleChange}
                className={cn(errors.username && "border-red-500")}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={cn(errors.email && "border-red-500")}
              />
            </div>

            {/* Password fields (only for user signup) */}
            {!isHrSignup && (
              <>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={cn(
                        errors.password && "border-red-500",
                        "pr-10"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={cn(errors.confirmPassword && "border-red-500")}
                  />
                </div>

                {/* Live password checklist */}
                {formData.password && (
                  <AnimatePresence>
                    <motion.ul
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 space-y-1 text-sm"
                    >
                      {passwordRules.map((rule) => {
                        const ok = isRuleOk(rule.regex);
                        return (
                          <li
                            key={rule.id}
                            className={cn(
                              "flex items-center gap-2",
                              ok ? "text-green-600" : "text-red-600"
                            )}
                          >
                            {ok ? <Check size={16} /> : <X size={16} />}
                            {rule.text}
                          </li>
                        );
                      })}
                    </motion.ul>
                  </AnimatePresence>
                )}
              </>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full mt-4 flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}

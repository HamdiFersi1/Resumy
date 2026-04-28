// src/hooks/useSignupForm.ts
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Requirements for password validation
const passwordRequirements = [
  { id: 1, text: "At least 8 characters", regex: /.{8,}/ },
  { id: 2, text: "At least 1 uppercase letter", regex: /[A-Z]/ },
  { id: 3, text: "At least 1 number", regex: /[0-9]/ },
  { id: 4, text: "At least 1 special character", regex: /[^A-Za-z0-9]/ },
];

export function useSignupForm() {
  const navigate = useNavigate();
  const { signup, signupHr } = useAuth()!;
  const location = useLocation();

  const isHrSignup = location.pathname.includes("hr");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else {
      for (const req of passwordRequirements) {
        if (!req.regex.test(formData.password)) {
          newErrors.password = "Password does not meet requirements";
          break;
        }
      }
    }

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const ok = isHrSignup
        ? await signupHr({
            // ← UPDATED
            email: formData.email,
            username: formData.username,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password,
          })
        : await signup({
            email: formData.email,
            username: formData.username,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password,
          });

      if (ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrors({ form: "Signup failed. Please try again." });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Signup failed. Please check your details and try again.";
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkPasswordRequirement = (regex: RegExp) =>
    regex.test(formData.password);

  // (motion variants unchanged)
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, duration: 0.5 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    errors,
    isSubmitting,
    success,
    handleChange,
    handleSubmit,
    checkPasswordRequirement,
    passwordRequirements,
    containerVariants,
    itemVariants,
  };
}

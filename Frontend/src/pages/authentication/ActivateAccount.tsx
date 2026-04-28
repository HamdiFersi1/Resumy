// src/pages/authentication/ActivateAccount.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ActivateAccount() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [msg, setMsg] = useState("Activating…");

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_BASE_URL}account/activate/${uid}/${token}/`
      )
      .then(() => {
        setMsg("Your account is active! Redirecting to login…");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        setMsg(err.response?.data?.detail || "Activation failed.");
      });
  }, [uid, token, navigate]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded text-center">
      <p>{msg}</p>
    </div>
  );
}

// src/pages/authentication/PleaseConfirmEmail.tsx
import { Link } from "react-router-dom";

export default function PleaseConfirmEmail() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded text-center">
      <h2 className="text-2xl font-semibold mb-4">Almost there!</h2>
      <p className="mb-6">
        Please check your email for an activation link. Click it to finish
        setting up your account.
      </p>
      <Link to="/login" className="text-blue-600 hover:underline">
        Back to Login
      </Link>
    </div>
  );
}

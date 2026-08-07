import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../services/authService";

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verificationStarted = useRef(false);
  const token = searchParams.get("token");

  const [status, setStatus] = useState(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "The verification link is missing its token."
  );

  useEffect(() => {
    if (!token) return;

    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.err || "We could not verify this email address."
        );
        setStatus("error");
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "loading" && <p>Verifying...</p>}
      {status === "success" && <p>✅ Email verified! Redirecting...</p>}
      {status === "error" && (
        <div className="text-center">
          <p>❌ Verification failed</p>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

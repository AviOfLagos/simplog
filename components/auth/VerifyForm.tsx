"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "lib/supabase/client";

export default function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pendingVerification");
    if (!pendingEmail) {
      router.push("/auth/signup");
      return;
    }
    setEmail(pendingEmail);

    // Get the verification code expiration time
    const checkExpiration = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("verification_codes")
          .select("expires_at")
          .eq("email", pendingEmail)
          .single();

        if (data?.expires_at) {
          const expirationTime = new Date(data.expires_at).getTime();
          const currentTime = Date.now();
          setRemainingTime(
            Math.max(0, Math.floor((expirationTime - currentTime) / 1000))
          );
        }
      } catch (err) {
        console.error("Error checking expiration:", err);
      }
    };

    checkExpiration();
  }, [router, supabase]);

  // Countdown timer
  useEffect(() => {
    if (remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;

    setError(null);
    setLoading(true);

    try {
      // Clean the code input (remove any non-digit characters)
      const cleanCode = code.replace(/\D/g, "");

      // First, check if there's a valid verification code
      const { data: verificationData, error: verificationError } =
        await supabase
          .from("verification_codes")
          .select("*")
          .eq("email", email)
          .single();

      if (verificationError || !verificationData) {
        setError("No verification code found. Please request a new code.");
        setLoading(false);
        return;
      }

      // Check if the code has expired
      const expirationTime = new Date(verificationData.expires_at).getTime();
      const currentTime = Date.now();

      if (currentTime > expirationTime) {
        setError("Verification code has expired. Please request a new code.");
        // Clean up expired code
        await supabase.from("verification_codes").delete().eq("email", email);
        setLoading(false);
        return;
      }

      // Check if the code matches
      if (verificationData.code !== cleanCode) {
        setError("Invalid verification code. Please try again.");
        setLoading(false);
        return;
      }

      // Code is valid - proceed with verification
      localStorage.setItem("verifiedEmail", email);

      // Delete used verification code
      await supabase.from("verification_codes").delete().eq("email", email);

      router.push("/auth/complete-signup");
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend code");
      }

      // Reset the countdown timer
      const { data } = await supabase
        .from("verification_codes")
        .select("expires_at")
        .eq("email", email)
        .single();

      if (data?.expires_at) {
        const expirationTime = new Date(data.expires_at).getTime();
        const currentTime = Date.now();
        setRemainingTime(
          Math.max(0, Math.floor((expirationTime - currentTime) / 1000))
        );
      }

      setError("A new verification code has been sent to your email.");
    } catch (err) {
      console.error("Error resending code:", err);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a code to {email}
          </p>
          {remainingTime > 0 && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Code expires in: {formatTime(remainingTime)}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="code" className="sr-only">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 6))}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="\d{6}"
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading || !code}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading || !code ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading || remainingTime > 0}
              className={`text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none ${
                loading || remainingTime > 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {remainingTime > 0
                ? `Resend code in ${formatTime(remainingTime)}`
                : "Resend verification code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

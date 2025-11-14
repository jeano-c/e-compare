"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetWithCodeAndPwd() {
  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  const CODE_LENGTH = 6;

  const [stage, setStage] = useState("request"); // "request" | "verifyCode" | "resetPassword"
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [resetId, setResetId] = useState(null);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCode = () => codeDigits.join("");

  // request reset email
  const handleRequest = async (e) => {
    e.preventDefault();
    if (!isLoaded || !isClient) return;

    try {
      const res = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      // Store reset ID in state instead of localStorage
      setResetId(res.id);

      setStage("verifyCode");
      setError("");
      setNewPassword("");
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      toast.success("Reset code sent. Check your email.");
    } catch (err) {
      console.error("Request reset error:", err);
      const msg = err.errors?.[0]?.message || "Could not send reset email";
      setError(msg);
      toast.error(msg);
    }
  };

  // ✅ Verify code AND reset password in one call
  const handleCodeAndPassword = async (e) => {
    e.preventDefault();
    if (!isLoaded || !isClient) return;

    const code = getCode();
    if (code.length !== CODE_LENGTH) {
      toast.error("Please enter all 6 digits");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      // Reload the signin instance with the reset ID to ensure we have the right session
      if (resetId && signIn.id !== resetId) {
        await signIn.reload({ id: resetId });
      }

      // Use attemptFirstFactor with BOTH code and password together
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (result.status === "complete") {
        toast.success("Password reset successful!");
        setResetId(null);
        // Redirect after successful reset
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        setError(`Unexpected status: ${result.status}. Please try again.`);
        toast.error("Reset failed");
      }
    } catch (err) {
      console.error("Reset error:", err);
      const msg =
        err.errors?.[0]?.message || "Reset failed — verify code and try again";
      setError(msg);
      toast.error(msg);
    }
  };

  // --- Input handlers for 6-digit code ---
  const handleDigitChange = (index, val) => {
    const value = val.slice(-1);
    if (!/^\d?$/.test(value)) return;

    const updated = [...codeDigits];
    updated[index] = value;
    setCodeDigits(updated);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && codeDigits[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;

    const arr = [...codeDigits];
    for (let i = 0; i < CODE_LENGTH; i++) arr[i] = paste[i] || "";
    setCodeDigits(arr);

    inputRefs.current[Math.min(paste.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleReset = () => {
    setStage("request");
    setError("");
    setCodeDigits(Array(CODE_LENGTH).fill(""));
    setNewPassword("");
    setEmail("");
    setResetId(null);
  };

  if (!isClient) return null; // Don't render until client-side

  return (
    <div className="min-h-screen flex justify-center items-center ">
      <div className="  w-[400px] px-6 py-8 rounded-md flex flex-col gap-8">
        {stage === "request" && (
          <>
            <h1 className="text-white text-3xl font-semibold">
              Reset your password
            </h1>
            <p className="text-white mt-2 text-sm">
              Enter the email you signed up with. We'll send you a number code to
               reset your password.
            </p>
            <form onSubmit={handleRequest} className="flex flex-col gap-4">
              <label className="text-white text-sm">Email address</label>
              <div className="glass-loginInput !h-[48px]">
                <input
                  type="email"
                  className="px-3 py-2 rounded-md text-black"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="glass-button mt-2 py-2 rounded-md text-white">
                Send code
              </button>
              <div className="flex justify-center">
                <Link href={`/sign-in`}>
                  <button
                    className="text-white underline underline-offset-5 text-sm hover:text-gray-300 cursor-pointer"
                    onClick={handleReset}
                  >
                    Back to login
                  </button>
                </Link>
              </div>
            </form>
          </>
        )}

        {stage === "verifyCode" && (
          <>
            <h1 className="text-white text-3xl font-semibold">
              Reset your password
            </h1>
            <p className="text-white mt-2 text-sm">
              Enter the {CODE_LENGTH}-digit code we sent to your email and your
              new password.
            </p>
            <form
              onSubmit={handleCodeAndPassword}
              className="flex flex-col gap-4"
            >
              <div>

                <label className="text-white text-sm block mb-2 ">
             Reset Code
                </label>
                <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
                  {codeDigits.map((digit, idx) => (
                    <div className="glass-loginInput !w-full" key={idx}>
                    <input
               key={idx}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                     className=" !p-0 w-full h-full  text-center px-2 py-3 rounded-md text-white text-xl"
                      value={digit}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      required
                    />
                      </div>
                  ))}
                </div>
              </div>

              
              <div>
                <label className="text-white text-sm block mb-2">
                  New Password
                </label>
                <div className="glass-loginInput !h-[52px]">
                  <input
                    type="password"
                    className=" px-3 py-2 rounded-md text-black w-full"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="glass-buttogn mt-2 py-2 rounded-md text-white">
                Reset Password
              </button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </>
        )}

        {stage !== "request" && (
          <div className="flex justify-center">
            <button
              className="text-white underline underline-offset-5 text-sm hover:text-gray-300"
              onClick={handleReset}
            >
              Back & resend
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

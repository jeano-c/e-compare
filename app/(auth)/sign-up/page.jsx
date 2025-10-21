"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { VscLoading } from "react-icons/vsc";
import { toast } from "sonner";

function Signup() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loadingButton, setLoadingButton] = useState("");
  const [error, setError] = useState("");

  // --- Handle Email/Password Signup ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoadingButton("signup");
    setError("");

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setLoadingButton("");
      return;
    }

    try {
      await signUp.create({
        emailAddress: email,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.message || "An error occurred during sign up";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingButton("");
    }
  };

  // --- Handle Email Verification ---
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoadingButton("verify");
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        window.location.href = "/";
      } else {
        setError("Verification incomplete. Please try again.");
        toast.error("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.message || "Invalid verification code";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingButton("");
    }
  };

  // --- Handle OAuth Signup ---
  const handleOAuthSignUp = (provider) => {
    if (!isLoaded) return;

    setLoadingButton(provider);

    signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: window.location.origin + "/sso-callback",
      redirectUrlComplete: window.location.origin + "/",
    });
  };

  // --- Verification View ---
  if (verifying) {
    return (
      <div className="flex flex-col lg:flex-row items-stretch justify-center max-w-screen overflow-x-hidden min-h-screen lg:h-screen text-white">
        <div className="min-h-[40vh] lg:min-h-screen w-full lg:w-1/2 px-6 sm:px-10 py-5 flex items-center justify-between flex-col sticky top-0">
          <div className="w-full">
            <h1
              onClick={() => router.push("/")}
              className="relative inline-block text-xl font-bold cursor-pointer sm:text-2xl group text-white"
            >
              Go to home
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
            </h1>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-semibold font-vagRounded sm:text-4xl lg:text-5xl text-white">
              Verify Your Email
            </h1>
            <p className="font-sans text-lg sm:text-xl lg:text-2xl mt-4">
              We sent a code to {email}
            </p>
          </div>

          <div className="hidden lg:block">
            <p className="text-xl font-bold">by Jeacodes</p>
          </div>
        </div>

        <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto !bg-black/20 inner-shadow-y">
          <form onSubmit={handleVerify}>
            <div className="mb-7 sm:mb-10">
              <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
                Verification Code
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="glass-input"
                placeholder="Enter 6-digit code"
              />
            </div>

            <div className="flex flex-col items-center justify-between gap-8">
              <button
                type="submit"
                disabled={loadingButton !== "" || !isLoaded}
                className="px-8 text-lg glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white !w-[50%]"
              >
                {loadingButton === "verify" ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              <button
                type="button"
                onClick={() => setVerifying(false)}
                disabled={loadingButton !== ""}
                className="text-white underline underline-offset-2 disabled:opacity-50"
              >
                Back to sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Signup Form View ---
  return (
    <div className="flex flex-col lg:flex-row items-stretch justify-center max-w-screen overflow-x-hidden min-h-screen lg:h-screen text-white">
      {/* Left Side */}
      <div className="min-h-[40vh] lg:min-h-screen w-full lg:w-1/2 px-6 sm:px-10 py-5 flex items-center justify-between flex-col sticky top-0">
        <div className="w-full">
          <h1
            onClick={() => router.push("/")}
            className="relative inline-block text-xl font-bold cursor-pointer sm:text-2xl group text-white"
          >
            Go to home
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
          </h1>
        </div>

        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-semibold font-vagRounded sm:text-4xl lg:text-5xl text-white">
            Welcome to
          </h1>
          <p className="font-baloo text-5xl sm:text-6xl lg:text-8xl">
            E-Compare
          </p>
          <p className="font-semibold font-vagRounded text-lg sm:text-xl lg:text-2xl mt-2">
            Sign up for free.
          </p>
        </div>

        <div className="hidden lg:block">
          <p className="text-xl font-bold">by Jeacodes</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto !bg-black/20 inner-shadow-y scrollbar scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Email
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input h-[64px]"
            />
          </div>

          {/* Username */}
          <div className="mb-7 sm:mb-10">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Username
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="glass-input h-[64px]"
            />
          </div>

          {/* Password */}
          <div className="mb-7">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Password
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input h-[64px]"
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-7">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Confirm Password
            </p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="glass-input h-[64px]"
            />
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center justify-between gap-8 sm:gap-10">
            <div id="clerk-captcha"></div>
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loadingButton !== "" || !isLoaded}
                className="px-8 text-lg glass-loginButton  sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white "
              >
                {loadingButton === "signup" ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

            <p className="text-xl text-center sm:text-2xl text-white">or</p>

            {/* OAuth Buttons */}
            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_google")}
                disabled={loadingButton !== "" || !isLoaded}
                className=" flex flex-row items-center text-white justify-center gap-2 px-6 text-base glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                {loadingButton === "oauth_google" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <FcGoogle className="text-3xl sm:text-4xl" />
                )}
                <span className="hidden sm:inline">
                  {loadingButton === "oauth_google"
                    ? "Loading..."
                    : "Continue with Google"}
                </span>
                <span className="sm:hidden">
                  {loadingButton === "oauth_google" ? "Loading..." : "Google"}
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleOAuthSignUp("oauth_facebook")}
                disabled={loadingButton !== "" || !isLoaded}
                className="flex flex-row items-center justify-center text-white px-6 text-base glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                {loadingButton === "oauth_facebook" ? (
                  <VscLoading className="text-3xl sm:text-4xl animate-spin" />
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 48 48"
                      className="sm:w-[38px] sm:h-[38px]"
                    >
                      <path
                        fill="#039be5"
                        d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73
                        c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359
                        c-0.548-0.074-1.707-0.236-3.897-0.236
                        c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701
                        v13.729C22.089,42.905,23.032,43,24,43
                        c0.875,0,1.729-0.08,2.572-0.194V29.036z"
                      ></path>
                    </svg>

                    <span className="hidden sm:inline">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Continue with Facebook"}
                    </span>
                    <span className="sm:hidden">
                      {loadingButton === "oauth_facebook"
                        ? "Loading..."
                        : "Facebook"}
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Login link */}
            <p className="font-sans text-sm text-center text-white sm:text-base">
              Already have an account?{" "}
              <span
                onClick={() =>
                  loadingButton === "" && router.push("/sign-in")
                }
                className={`font-bold text-white underline underline-offset-2 ${
                  loadingButton === ""
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                Login
              </span>
            </p>
          </div>
        </form>

        <div className="mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by Jeacodes</p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

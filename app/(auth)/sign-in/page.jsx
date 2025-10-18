"use client";

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { ImFacebook2 } from "react-icons/im";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { VscLoading } from "react-icons/vsc";
import { toast } from "sonner";

function Signin() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === "complete") {
        // Set the session with appropriate duration based on rememberMe
        await setActive({
          session: result.createdSessionId,
          // If rememberMe is true, set a longer session
          // If false, session expires when browser closes
          beforeEmit: async (session) => {
            // You can also set custom session properties here if needed
            return session;
          },
        });

        // Store rememberMe preference in localStorage for the session configuration
        if (typeof window !== "undefined") {
          if (rememberMe) {
            localStorage.setItem("clerk_remember_me", "true");
          } else {
            localStorage.removeItem("clerk_remember_me");
          }
        }

        toast.success("Login successful!", {
          description: "Welcome back to E-Compare",
        });

        router.push("/");
      } else {
        // Handle other statuses if needed
        const errorMsg = "Sign in incomplete. Please try again.";
        toast.error("Login failed", {
          description: errorMsg,
        });
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      const errorMessage =
        err.errors?.[0]?.message || "Invalid email or password";
      toast.error("Login failed", {
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider) => {
    if (!isLoaded) return;

    const strategy = provider === "google" ? "oauth_google" : "oauth_facebook";

    // Store rememberMe preference before OAuth redirect
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("clerk_remember_me", "true");
      } else {
        localStorage.removeItem("clerk_remember_me");
      }
    }

    try {
      signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: window.location.origin + "/sso-callback",
        redirectUrlComplete: window.location.origin + "/",
      });
    } catch (err) {
      const providerName = provider === "google" ? "Google" : "Facebook";
      toast.error(`${providerName} login failed`, {
        description: "Please try again or use a different method",
      });
    }
  };

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
            Welcome to
          </h1>
          <p className="font-sans text-5xl font-bold sm:text-6xl lg:text-8xl">
            E-Compare
          </p>
          <div className="lg:pl-9">
            <p className="font-sans text-lg font-light sm:text-xl lg:text-2xl mt-1">
              Start your <span className="font-bold">smart</span> online
              shopping here
            </p>
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-xl font-bold">by jeacodes</p>
        </div>
      </div>

      {/* right side */}
      <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-7 sm:mb-10">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Email or Username
            </p>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input"
              placeholder="Enter your username or email"
            />
          </div>

          <div className="mb-7">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Password
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex flex-row items-start justify-between gap-4 mb-10 sm:flex-row sm:items-center sm:mb-20">
            <div className="flex items-center">
              <input
                className="glass-checkbox"
                type="checkbox"
                id="option1"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="option1"
                className="text-lg leading-none cursor-pointer sm:text-2xl text-white"
              >
                Remember me
              </label>
            </div>
            <div className="flex items-center">
              <h1
                onClick={() => router.push("/forgot-password")}
                className="text-white relative inline-block text-lg font-medium cursor-pointer sm:text-2xl font-vagRounded group"
              >
                Forgot password
                <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-8 sm:gap-15">
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="w-full px-8 text-lg glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <VscLoading className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Login Now"
                )}
              </button>
            </div>

            <div>
              <p className="text-xl text-center sm:text-2xl text-white">or</p>
            </div>

            <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={!isLoaded}
                className="flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
              >
                <FcGoogle className="text-3xl sm:text-4xl" />
                <span className="hidden sm:inline">Login with Google</span>
                <span className="sm:hidden">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                disabled={!isLoaded}
                className="glass-button w-full flex justify-center items-center rounded-l-2xl rounded-r-none"
              >
                <div className="bg-[#1877F2] p-2 sm:p-3 rounded-md">
                  <ImFacebook2 className="text-2xl text-white sm:text-3xl" />
                </div>
                <span className="hidden sm:inline">Login with Facebook</span>
                <span className="sm:hidden">Facebook</span>
              </button>
            </div>

            <div>
              <p className="font-sans text-sm text-center text-white sm:text-base">
                Don't have account?{" "}
                <span
                  onClick={() => router.push("/sign-up")}
                  className="font-bold text-white underline cursor-pointer underline-offset-2"
                >
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </form>

        {/* Mobile footer */}
        <div className="mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by jeacodes</p>
        </div>
      </div>
    </div>
  );
}

export default Signin;

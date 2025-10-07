"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { FcGoogle } from "react-icons/fc";
import { ImFacebook2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { VscLoading } from "react-icons/vsc";
import { useSignIn } from "@clerk/clerk-react";

function Signup() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || oauthLoading) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        firstName,
        lastName,
        username,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      toast.success("Verification code sent to your email");
    } catch (err) {
      toast.error(
        err.errors?.[0]?.message || "An error occurred during signup"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success("Signup successful! Redirecting...");
        window.location.href = "/";
      }
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!isLoaded || !signInLoaded) return;
    setOauthLoading(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
      });
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "OAuth login failed");
      setOauthLoading(false);
      console.log(err);
    }
  };

  const signInWithFacebook = async () => {
    if (!isLoaded) return;
    setOauthLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_facebook",
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      toast.error(err.errors?.[0]?.message || "OAuth sign-in failed");
      setOauthLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="px-6 sm:px-10 py-10 bg-[#ffffff] flex items-center justify-center  min-h-screen font-vagRounded font-light">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#000000] text-center">
              Verify Your Email
            </h2>
            <p className="text-base text-center text-gray-600 sm:text-lg">
              We sent a code to {email}
            </p>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="glass-input"
            />

            <button
              onClick={handleVerification}
              disabled={loading || oauthLoading}
              className="w-full cursor-pointer glass-button sm:w-auto"
            >
              {loading ? (
                <VscLoading className="inline-block text-2xl animate-spin" />
              ) : (
                "Verify Email"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-10 min-h-screen font-vagRounded font-light">
      <form onSubmit={handleSubmit}>
        {/* First + Last Name */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-0 mb-7">
          <div className="flex w-full sm:w-[48%] flex-col">
            <p className="mb-2 text-xl font-medium sm:text-2xl">First name</p>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="glass-input"
            />
          </div>
          <div className="flex w-full sm:w-[48%] flex-col">
            <p className="mb-2 text-xl font-medium sm:text-2xl">Last name</p>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        {/* Username + Email */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-0 mb-7">
          <div className="flex w-full sm:w-[48%] flex-col">
            <p className="mb-2 text-xl font-medium sm:text-2xl">Username</p>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input"
            />
          </div>
          <div className="flex w-full sm:w-[48%] flex-col">
            <p className="mb-2 text-xl font-medium sm:text-2xl">Email</p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-0 mb-7">
          <div className="flex w-full sm:w-[48%] flex-col">
            <p className="mb-2 text-xl font-medium sm:text-2xl">Password</p>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input"
            />
          </div>
          <div className="flex w-full sm:w-[48%] flex-col">
            <p className="mb-2 text-xl font-medium sm:text-2xl">
              Confirm Password
            </p>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="glass-input"
            />
          </div>
        </div>

        <div className="flex justify-center w-full mt-10">
          <button
            type="submit"
            disabled={!isLoaded || loading || oauthLoading}
            className="w-full glass-button sm:w-auto"
          >
            {loading ? (
              <VscLoading className="inline-block text-2xl animate-spin" />
            ) : (
              "Sign up Now"
            )}
          </button>
        </div>

        {/* Captcha */}
        <div className="flex justify-center w-full mt-6">
          <div id="clerk-captcha" data-cl-theme="light" data-cl-size="normal" />
        </div>
      </form>

      {/* OAuth Buttons */}
      <p className="mt-10 text-lg font-bold text-center sm:text-xl">OR</p>
      <div className="w-full sm:w-[90%] lg:w-[75%] mx-auto flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 mt-6">
        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={!isLoaded || oauthLoading || loading}
          className="glass-button w-full sm:w-[48%] flex flex-row justify-center items-center gap-2 text-base sm:text-xl px-6 sm:px-8"
        >
          {oauthLoading ? (
            <VscLoading className="text-2xl animate-spin" />
          ) : (
            <FcGoogle className="text-3xl sm:text-4xl" />
          )}
          {oauthLoading ? (
            "Loading..."
          ) : (
            <>
              <span className="hidden sm:inline">Login with Google</span>
              <span className="sm:hidden">Google</span>
            </>
          )}
        </button>

        {/* Facebook */}
        <button
          onClick={signInWithFacebook}
          disabled={!isLoaded || oauthLoading || loading}
          className="glass-button w-full sm:w-[48%] flex flex-row justify-center items-center gap-2 text-base sm:text-xl px-6 sm:px-8"
        >
          {oauthLoading ? (
            <VscLoading className="text-2xl animate-spin" />
          ) : (
            <div className="bg-[#1877F2] p-2 sm:p-3 rounded-md">
              <ImFacebook2 className="text-2xl text-white sm:text-3xl" />
            </div>
          )}
          {oauthLoading ? (
            "Loading..."
          ) : (
            <>
              <span className="hidden sm:inline">Login with Facebook</span>
              <span className="sm:hidden">Facebook</span>
            </>
          )}
        </button>
      </div>
      <p className="mt-20 text-xl font-semibold text-center font-vagRounded">
        by Jeacodes
      </p>
    </div>
  );
}

export default Signup;

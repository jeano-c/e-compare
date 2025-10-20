"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import { ImFacebook2 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { VscLoading } from "react-icons/vsc";
import { toast } from "sonner"

function Signup() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle email/password sign up
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;

    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Create the sign up
      await signUp.create({
        emailAddress: email,
        password: password,
        username: username,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Show verification form
      setVerifying(true);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  // Handle email verification
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      // Verify the email code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        // Set the active session
        await setActive({ session: completeSignUp.createdSessionId });
        // Redirect to home or dashboard
        router.push("/");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        setError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign up
  const handleOAuthSignUp = (provider) => {
    if (!isLoaded) return;

    signUp.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: window.location.origin + "/sso-callback",
      redirectUrlComplete: window.location.origin + "/",
    });
  };

  // Show verification form
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

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center justify-between gap-8">
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="px-8 text-lg glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white !w-[50%]"
              >
                {loading ? (
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
                className="text-white underline underline-offset-2"
              >
                Back to sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          <p className="font-baloo text-5xl  sm:text-6xl lg:text-8xl">
            E-Compare
          </p>
          <div className="">
            <p className="font-vagRounded text-lg font-regular sm:text-xl lg:text-2xl mt-1">
              Sign up for free
            </p>
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="text-xl font-bold">by Jeacodes</p>
        </div>
      </div>

      {/* right side */}
      <div className="w-full px-6 py-10 lg:w-1/2 sm:px-10 lg:overflow-y-auto !bg-black/20 inner-shadow-y">
        <form onSubmit={handleSubmit}>
          <div className="mb-7 sm:mb-10">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Email
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input h-[64px] "
            />
          </div>

          <div className="mb-7 sm:mb-10">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded">
              Username
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="glass-input h-[64px] "
            />
          </div>

          <div className="mb-7">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded ">
              Password
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input h-[64px] "
            />
          </div>

          <div className="mb-7">
            <p className="mb-2 text-xl font-light text-white sm:text-2xl font-vagRounded ">
              Confirm Password
            </p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="glass-input h-[64px] "
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center justify-between gap-8 sm:gap-10">
            <div id="clerk-captcha"></div>
            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                disabled={loading || !isLoaded}
                className="px-8 text-lg glass-loginButton sm:w-auto sm:text-xl sm:px-12 font-vagRounded text-white w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2 ">
                    <VscLoading className="animate-spin" />
                    Signing up...
                  </span>
                ) : (
                  "Sign up"
                )}
              </button>
            </div>

           
                       <div>
                         <p className=" text-center text-white font-vagRounded text-[24px]">or</p>
                       </div>
           
                       <div className="flex flex-col items-center justify-center w-full gap-4 sm:gap-5 text-[16px]">
                         <button
                           type="button"
                           onClick={() => handleOAuthSignIn("google")}
                           disabled={!isLoaded}
                           className="flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
                         >
                           <FcGoogle className="text-2xl sm:text-4xl" />
                           <span className="hidden  sm:inline">Login with Google</span>
                           <span className="sm:hidden">Google</span>
                         </button>
                         <button
                           type="button"
                           onClick={() => handleOAuthSignIn("facebook")}
                           disabled={!isLoaded}
                          className="flex flex-row items-center text-white justify-center w-full gap-2 px-6 text-base glass-button sm:w-auto sm:text-xl sm:px-12 font-vagRounded"
           
                         >
             <div className="p-2 sm:p-1 rounded-md">
             <svg
               xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 512 512"
               className="w-7 h-7 sm:w-8 sm:h-8 rounded-md"
             >
               <rect width="512" height="512" fill="#1877F2" rx="15" />
               <path
                 fill="#fff"
                 d="M355.6 330.7l11.3-73.8h-70.8v-47.9c0-20.2 9.9-39.9 41.6-39.9h32.2V105c0 0-29.2-5-57.2-5-58.3 0-96.4 35.4-96.4 99.5v57.3H140v73.8h76.3v178.3c15.3 2.4 30.9 3.7 46.8 3.7s31.5-1.3 46.8-3.7V330.7h45.7z"
               />
             </svg>
           </div>
                           <span className="text-hidden sm:inline">Login with Facebook</span>
                           <span className="sm:hidden">Facebook</span>
                         </button>
                       </div>
           
                       <div>
                         <p className=" text-[16px] text-center text-white ">
                           Don't have account?{" "}
                           <span
                             onClick={() => router.push("/sign-in")}
                             className="font-vagRounded font-semibold text-[16px] text-white underline cursor-pointer underline-offset-2"
                           >
                             Sign up
                           </span>
                         </p>
                       </div>
                     </div>
                   </form>
        {/* Mobile footer */}
        <div className="mt-8 text-center lg:hidden">
          <p className="text-lg font-bold">by Jeacodes</p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

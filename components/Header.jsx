"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FaHistory } from "react-icons/fa";
import ShaderBackground from "./BackGround";
import { dark } from "@clerk/themes";

export default function Header() {
  const { user } = useUser();
  return (
    <>
      <ShaderBackground />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          color: "white",
          textAlign: "center",
          fontSize: "2rem",
        }}
      ></div>
      <header className="flex justify-between items-center p-10 gap-4 h-16 font-vagRounded font-light bg-header-gradient ">
        <p className="font-bold font-sans text-3xl">E-COMPARE</p>
        <div className="flex justify-center items-center gap-5">
          <SignedOut>
            <Link href="/sign-in">
              <button className="glass-button">Sign In</button>
            </Link>
            <Link href="/sign-up">
              <button className="glass-button">Sign Up</button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                baseTheme: dark,
              }}
            >
              <UserButton.UserProfilePage
                appearance={{
                  baseTheme: dark,
                }}
                label="History"
                url="custom-history"
                labelIcon={<FaHistory size={16} />}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Activity History</h2>
                </div>
              </UserButton.UserProfilePage>
            </UserButton>
          </SignedIn>
        </div>
      </header>
    </>
  );
}

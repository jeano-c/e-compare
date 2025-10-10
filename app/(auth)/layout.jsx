"use client";
import ShaderBackground from "@/components/BackGround";
export default function AuthLayout({ children }) {
  return (
    <div className="auth-wrapper">
      <ShaderBackground />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          fontSize: "2rem",
        }}
      ></div>
      {children}
    </div>
  );
}

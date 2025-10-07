"use client";
import Header from "@/components/Header";
import ShaderBackground from "@/components/BackGround";
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

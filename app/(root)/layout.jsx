"use client";
import Header from "@/components/Header";
import "@/app/globals.css";
export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

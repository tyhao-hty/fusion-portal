import { Navbar } from "@/components/Navbar";
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">{children}</main>
    </>
  );
}

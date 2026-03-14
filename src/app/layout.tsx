import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { validateEnv } from "@/lib/env";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Job Catchr",
  description: "Find jobs, track applications, discover connections",
};

// Validate env vars at startup (server-side only, runs once per cold start)
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (err) {
    console.error('[startup]', err instanceof Error ? err.message : err)
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StepNav from "@/components/StepNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hada Madrina — AI Career Assistant",
  description: "Your magical AI-powered career advisor for job applications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <StepNav />
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

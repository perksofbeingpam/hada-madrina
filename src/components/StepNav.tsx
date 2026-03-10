"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { href: "/", label: "Profile", num: 1 },
  { href: "/new-application", label: "Job", num: 2 },
  { href: "/audit", label: "Audit", num: 3 },
  { href: "/cv-preview", label: "Generate", num: 4 },
  { href: "/chat", label: "Chat", num: 5 },
];

export default function StepNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 py-4 px-6 border-b border-gray-100 bg-white">
      <span className="text-lg font-bold text-purple-700 mr-6">✦ Hada Madrina</span>
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isActive = pathname === step.href;
          const currentIndex = steps.findIndex((s) => s.href === pathname);
          const isDone = i < currentIndex;

          return (
            <div key={step.href} className="flex items-center">
              <Link
                href={step.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : isDone
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : isDone
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isDone ? "✓" : step.num}
                </span>
                {step.label}
              </Link>
              {i < steps.length - 1 && (
                <span className="text-gray-300 mx-0.5">›</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import Spinner from "@/components/Spinner";
import type { AuditReport } from "@/types";

function GapBadge({ severity }: { severity: string }) {
  const colors = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-green-100 text-green-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-600"}`}>
      {severity}
    </span>
  );
}

export default function AuditPage() {
  const router = useRouter();
  const {
    userProfile,
    jobDescription,
    researchResults,
    auditReport,
    setAuditReport,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<AuditReport | null>(auditReport);

  useEffect(() => {
    if (!auditReport && userProfile && jobDescription) {
      runAudit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAudit() {
    if (!userProfile || !jobDescription) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          jobDescription,
          researchResults,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate audit");
      setReport(data.audit);
      setAuditReport(data.audit);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!userProfile || !jobDescription) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">Missing profile or job description.</p>
        <a href="/" className="text-purple-600 underline">Start over →</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✦ Hada Madrina Audit
        </h1>
        <p className="text-gray-500">
          Analysing your fit for <strong>{jobDescription.job_title}</strong> at{" "}
          <strong>{jobDescription.company_name}</strong>
        </p>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <Spinner label="Hada Madrina is analysing your profile and researching the company..." />
          <p className="text-sm text-gray-400 mt-2">This may take 20–30 seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={runAudit}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-4">
          {/* Match Score */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Match Assessment</h2>
              <span className="text-2xl font-bold text-purple-700">{report.match_score}</span>
            </div>
            <p className="text-gray-600 text-sm">{report.match_summary}</p>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Your Strengths</h2>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  <span className="text-gray-700">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          {report.gaps.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Gaps & Workarounds</h2>
              <div className="space-y-4">
                {report.gaps.map((gap, i) => (
                  <div key={i} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <GapBadge severity={gap.severity} />
                      <span className="text-sm font-semibold text-gray-800">{gap.gap}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-600">Workaround: </span>
                      {gap.workaround}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Vibe */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Company Vibe — {jobDescription.company_name}
            </h2>
            <p className="text-sm text-gray-600 mb-3">{report.company_vibe}</p>
            {report.company_red_flags.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-700 mb-2">Red Flags</p>
                {report.company_red_flags.map((flag, i) => (
                  <p key={i} className="text-sm text-red-600 flex gap-2">
                    <span>⚠</span> {flag}
                  </p>
                ))}
              </div>
            )}
            {researchResults && researchResults.culture.length === 0 && (
              <p className="text-xs text-gray-400 italic mt-2">
                No recent public data found for this company. Analysis based on job description only.
              </p>
            )}
          </div>

          {/* Strategy */}
          <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6">
            <h2 className="text-lg font-bold text-purple-900 mb-3">
              ✦ Your Winning Strategy
            </h2>
            <ul className="space-y-2">
              {report.strategy.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-purple-500 font-bold">{i + 1}.</span>
                  <span className="text-purple-800">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={runAudit}
              className="border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Re-run Audit
            </button>
            <button
              onClick={() => router.push("/cv-preview")}
              className="flex-grow bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Generate CV & Cover Letter →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

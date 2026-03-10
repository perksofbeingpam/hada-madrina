"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import Spinner from "@/components/Spinner";
import type { CVOutput } from "@/types";

function CVPreview({ cv }: { cv: CVOutput }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 font-sans text-sm shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{cv.name}</h1>
        <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
          {cv.contact.email && <span>{cv.contact.email}</span>}
          {cv.contact.phone && <span>· {cv.contact.phone}</span>}
          {cv.contact.location && <span>· {cv.contact.location}</span>}
          {cv.contact.linkedin && (
            <span>· <a href={cv.contact.linkedin} className="text-blue-600">{cv.contact.linkedin}</a></span>
          )}
        </div>
      </div>

      {/* Summary */}
      {cv.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{cv.summary}</p>
        </div>
      )}

      {/* Core Skills */}
      {cv.core_skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Core Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {cv.core_skills.map((skill, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-3">
            Experience
          </h2>
          {cv.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-gray-900">{exp.title}</span>
                  <span className="text-gray-500"> · {exp.company}</span>
                  {exp.location && <span className="text-gray-400 text-xs"> · {exp.location}</span>}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{exp.dates}</span>
              </div>
              <ul className="mt-1 ml-4 space-y-0.5">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="text-gray-600 text-xs list-disc">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Education
          </h2>
          {cv.education.map((edu, i) => (
            <div key={i} className="flex justify-between text-sm">
              <div>
                <span className="font-medium text-gray-900">{edu.degree}</span>
                <span className="text-gray-500"> · {edu.institution}</span>
              </div>
              <span className="text-xs text-gray-400">{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {cv.certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Certifications
          </h2>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
            {cv.certifications.map((cert, i) => (
              <span key={i}>{cert}</span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1 mb-2">
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {cv.languages.map((lang, i) => (
              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CVPreviewPage() {
  const router = useRouter();
  const {
    userProfile,
    jobDescription,
    auditReport,
    cvOutput,
    coverLetter,
    setCVOutput,
    setCoverLetter,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState("");
  const [cv, setCv] = useState<CVOutput | null>(cvOutput);
  const [letter, setLetter] = useState(coverLetter);
  const [activeTab, setActiveTab] = useState<"cv" | "letter">("cv");
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!cvOutput && userProfile && jobDescription && auditReport) {
      generateAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateAll() {
    if (!userProfile || !jobDescription || !auditReport) return;
    setLoading(true);
    setError("");

    try {
      setLoadingStep("Rewriting your CV to match the role...");
      const cvRes = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, jobDescription, auditReport }),
      });
      const cvData = await cvRes.json();
      if (!cvRes.ok) throw new Error(cvData.error || "Failed to generate CV");

      setCv(cvData.cv);
      setCVOutput(cvData.cv);

      setLoadingStep("Writing your cover letter...");
      const letterRes = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvOutput: cvData.cv,
          jobDescription,
          auditReport,
        }),
      });
      const letterData = await letterRes.json();
      if (!letterRes.ok) throw new Error(letterData.error || "Failed to generate cover letter");

      setLetter(letterData.coverLetter);
      setCoverLetter(letterData.coverLetter);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  async function handleDownloadPDF(includeCoverLetter = false) {
    if (!cv) return;
    setPdfLoading(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvOutput: cv,
          coverLetter: includeCoverLetter ? letter : undefined,
        }),
      });

      const isFallback = res.headers.get("X-Fallback") === "true";

      if (isFallback) {
        // Open in new tab for print-to-PDF
        const html = await res.text();
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (win) {
          win.onload = () => {
            setTimeout(() => win.print(), 500);
          };
        }
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cv.name.replace(/\s+/g, "_")}_CV.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to export PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  if (!userProfile || !jobDescription || !auditReport) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">Please complete the audit first.</p>
        <a href="/audit" className="text-purple-600 underline">Go to Audit →</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Step 4: Your Documents
          </h1>
          <p className="text-gray-500">
            Tailored for <strong>{jobDescription.job_title}</strong> at{" "}
            <strong>{jobDescription.company_name}</strong>
          </p>
        </div>
        {cv && (
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadPDF(false)}
              disabled={pdfLoading}
              className="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {pdfLoading ? "Exporting..." : "↓ CV PDF"}
            </button>
            <button
              onClick={() => handleDownloadPDF(true)}
              disabled={pdfLoading}
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              ↓ Full Package PDF
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
          <Spinner label={loadingStep} />
          <p className="text-sm text-gray-400 mt-2">This may take 30–45 seconds</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={generateAll} className="mt-2 text-sm text-red-600 underline">
            Try again
          </button>
        </div>
      )}

      {cv && !loading && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
            <strong>Important:</strong> Always review your generated CV before submitting. Never claim experience you don&apos;t have.
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("cv")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "cv" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              CV Preview
            </button>
            <button
              onClick={() => setActiveTab("letter")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "letter" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Cover Letter
            </button>
          </div>

          {activeTab === "cv" && <CVPreview cv={cv} />}

          {activeTab === "letter" && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cover Letter</h2>
              {letter ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  {letter.split("\n\n").map((para, i) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">Cover letter not yet generated.</p>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={generateAll}
              className="border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Regenerate
            </button>
            <button
              onClick={() => router.push("/chat")}
              className="flex-grow bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              ✦ Chat with Hada Madrina →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

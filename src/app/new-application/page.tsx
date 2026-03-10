"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import Spinner from "@/components/Spinner";
import type { JobDescription } from "@/types";

export default function NewApplicationPage() {
  const router = useRouter();
  const {
    userProfile,
    setJobDescription,
    setRawJDText,
    setResearchResults,
    jobDescription,
    rawJDText,
  } = useAppStore();

  const [text, setText] = useState(rawJDText);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [parsed, setParsed] = useState<JobDescription | null>(jobDescription);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "confirm">(
    jobDescription ? "confirm" : "input"
  );
  const [ocrLoading, setOcrLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 mb-4">No profile found. Please start from the beginning.</p>
        <a href="/" className="text-purple-600 underline">Go to Profile →</a>
      </div>
    );
  }

  async function handleOCR(file: File) {
    setOcrLoading(true);
    try {
      // Dynamically import Tesseract to avoid SSR issues
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(file, "eng");
      setText(data.text);
    } catch (e) {
      setError("OCR failed. Please paste the job description text manually.");
      console.error(e);
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleParse() {
    if (!text.trim()) {
      setError("Please paste the job description first.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      setLoadingStep("Parsing job description...");
      const jdRes = await fetch("/api/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const jdData = await jdRes.json();
      if (!jdRes.ok) throw new Error(jdData.error || "Failed to parse JD");

      setParsed(jdData.jd);
      setStep("confirm");

      // Kick off research in background
      setLoadingStep("Researching company...");
      try {
        const researchRes = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName: jdData.jd.company_name }),
        });
        const researchData = await researchRes.json();
        if (researchData.results) {
          setResearchResults(researchData.results);
        }
      } catch {
        // Research is optional, don't fail
        console.warn("Research failed, continuing without it");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  function handleConfirm() {
    if (!parsed) return;
    setJobDescription(parsed);
    setRawJDText(text);
    router.push("/audit");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Step 2: Job Description
        </h1>
        <p className="text-gray-500">
          Paste the job posting or upload a screenshot. Hada Madrina will analyse it.
        </p>
      </div>

      {step === "input" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => imageRef.current?.click()}
              className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <span>📸</span>
              {ocrLoading ? "Extracting text..." : "Upload Screenshot (OCR)"}
            </button>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleOCR(file);
              }}
            />
          </div>

          {ocrLoading && <Spinner label="Running OCR on image..." />}

          <textarea
            className="w-full h-64 p-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none font-mono"
            placeholder="Paste the full job description here...&#10;&#10;Include the job title, company, responsibilities, requirements, etc."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="mt-2 text-right text-xs text-gray-400">
            {text.length} characters
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleParse}
            disabled={loading || ocrLoading || !text.trim()}
            className="mt-4 w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? loadingStep || "Analysing..." : "Analyse Job Description →"}
          </button>

          {loading && <Spinner label={loadingStep} />}
        </div>
      )}

      {step === "confirm" && parsed && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{parsed.job_title}</h2>
                <p className="text-gray-600 font-medium">{parsed.company_name}</p>
                <p className="text-sm text-gray-400">
                  {[parsed.location, parsed.employment_type].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                JD Parsed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {parsed.required_skills.map((skill, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Key Requirements</p>
                <ul className="space-y-1">
                  {parsed.required_experience_years && (
                    <li className="text-gray-600 text-xs">
                      📅 {parsed.required_experience_years} experience
                    </li>
                  )}
                  {parsed.required_education && (
                    <li className="text-gray-600 text-xs">
                      🎓 {parsed.required_education}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {parsed.key_responsibilities.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-gray-700 mb-2 text-sm">Key Responsibilities</p>
                <ul className="space-y-1">
                  {parsed.key_responsibilities.slice(0, 4).map((resp, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-gray-300">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("input")}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              ← Edit JD
            </button>
            <button
              onClick={handleConfirm}
              className="flex-grow bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Run Hada Madrina Audit →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

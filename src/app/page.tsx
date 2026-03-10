"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import Spinner from "@/components/Spinner";
import type { UserProfile } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { setUserProfile, setRawProfileText, userProfile, rawProfileText } =
    useAppStore();

  const [text, setText] = useState(rawProfileText);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<UserProfile | null>(userProfile);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"input" | "confirm">(
    userProfile ? "confirm" : "input"
  );
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleParse() {
    if (!text.trim()) {
      setError("Please paste your profile text first.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse profile");
      setParsed(data.profile);
      setStep("confirm");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!parsed) return;
    setUserProfile(parsed);
    setRawProfileText(text);
    router.push("/new-application");
  }

  function handleEdit() {
    setStep("input");
    setParsed(null);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✦ Meet Your Hada Madrina
        </h1>
        <p className="text-gray-500">
          Your magical AI career advisor. Let&apos;s start with your professional profile.
        </p>
      </div>

      {step === "input" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Step 1: Your Profile
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste your LinkedIn &quot;About&quot; + experience text, or the full text of your existing CV.
          </p>

          <textarea
            className="w-full h-64 p-4 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none font-mono"
            placeholder="Paste your LinkedIn profile or CV text here...&#10;&#10;Example:&#10;Jane Doe&#10;Senior Product Manager | London&#10;&#10;Experience:&#10;Product Manager at Acme Corp (2020–Present)&#10;- Led cross-functional teams to deliver..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="mt-3 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const content = await file.text();
                setText(content);
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-sm text-purple-600 hover:text-purple-800 underline"
            >
              Upload .txt file
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-400">
              {text.length} characters
            </span>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleParse}
            disabled={loading || !text.trim()}
            className="mt-4 w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Parsing your profile..." : "Parse My Profile →"}
          </button>

          {loading && <Spinner label="Extracting your profile data..." />}
        </div>
      )}

      {step === "confirm" && parsed && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{parsed.name}</h2>
                <p className="text-sm text-gray-500">
                  {[parsed.location, parsed.email].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Profile Parsed
              </span>
            </div>

            {parsed.summary && (
              <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
                {parsed.summary}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Experience ({parsed.experience.length} roles)
                </p>
                {parsed.experience.slice(0, 3).map((exp, i) => (
                  <div key={i} className="mb-1">
                    <span className="text-gray-800 font-medium">{exp.title}</span>
                    <span className="text-gray-500"> at {exp.company}</span>
                  </div>
                ))}
                {parsed.experience.length > 3 && (
                  <p className="text-gray-400 text-xs">
                    +{parsed.experience.length - 3} more
                  </p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">
                  Skills ({parsed.skills.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {parsed.skills.slice(0, 8).map((skill, i) => (
                    <span
                      key={i}
                      className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {parsed.skills.length > 8 && (
                    <span className="text-gray-400 text-xs">
                      +{parsed.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Review before proceeding:</strong> Make sure the parsed profile looks correct.
            Always review your generated CV before submitting to employers.
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              ← Edit Profile
            </button>
            <button
              onClick={handleConfirm}
              className="flex-2 flex-grow bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Looks Good — Add Job Description →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

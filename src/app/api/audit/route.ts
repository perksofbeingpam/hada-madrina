import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { AUDIT_SYSTEM } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userProfile, jobDescription, researchResults } = await req.json();

    if (!userProfile || !jobDescription) {
      return NextResponse.json(
        { error: "Missing userProfile or jobDescription" },
        { status: 400 }
      );
    }

    const tavilyResults = researchResults
      ? JSON.stringify(researchResults)
      : "No live research data available for this company.";

    const system = AUDIT_SYSTEM(
      JSON.stringify(userProfile),
      JSON.stringify(jobDescription),
      tavilyResults
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content:
            "Please produce the audit report based on the inputs in the system prompt.",
        },
      ],
      system,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    try {
      // Strip markdown code blocks if present
      const cleaned = content.text
        .replace(/^```json\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      const audit = JSON.parse(cleaned);
      return NextResponse.json({ audit });
    } catch {
      const retryResponse = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content:
              "Please produce the audit report based on the inputs in the system prompt.",
          },
          { role: "assistant", content: content.text },
          {
            role: "user",
            content:
              "The JSON you returned is invalid. Return ONLY a valid JSON object with no markdown or explanation.",
          },
        ],
        system,
      });

      const retryContent = retryResponse.content[0];
      if (retryContent.type !== "text") {
        return NextResponse.json({ error: "Failed to generate audit" }, { status: 500 });
      }

      const cleaned = retryContent.text
        .replace(/^```json\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();
      const audit = JSON.parse(cleaned);
      return NextResponse.json({ audit });
    }
  } catch (error) {
    console.error("audit error:", error);
    return NextResponse.json({ error: "Failed to generate audit report" }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CV_REWRITER_SYSTEM } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function parseJSON(text: string) {
  const cleaned = text
    .replace(/^```json\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { userProfile, jobDescription, auditReport } = await req.json();

    if (!userProfile || !jobDescription || !auditReport) {
      return NextResponse.json(
        { error: "Missing required inputs" },
        { status: 400 }
      );
    }

    const system = CV_REWRITER_SYSTEM(
      JSON.stringify(userProfile),
      JSON.stringify(jobDescription),
      JSON.stringify(auditReport)
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: "Please rewrite the CV based on the inputs in the system prompt.",
        },
      ],
      system,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    try {
      const cv = parseJSON(content.text);
      return NextResponse.json({ cv });
    } catch {
      const retryResponse = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: "Please rewrite the CV based on the inputs in the system prompt.",
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
        return NextResponse.json({ error: "Failed to generate CV" }, { status: 500 });
      }

      const cv = parseJSON(retryContent.text);
      return NextResponse.json({ cv });
    }
  } catch (error) {
    console.error("generate-cv error:", error);
    return NextResponse.json({ error: "Failed to generate CV" }, { status: 500 });
  }
}

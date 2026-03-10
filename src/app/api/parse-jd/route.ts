import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { JD_PARSER_SYSTEM } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "No job description text provided" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: text }],
      system: JD_PARSER_SYSTEM,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    try {
      const jd = JSON.parse(content.text);
      return NextResponse.json({ jd });
    } catch {
      const retryResponse = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [
          { role: "user", content: text },
          { role: "assistant", content: content.text },
          {
            role: "user",
            content:
              "The JSON you returned is invalid. Please return ONLY a valid JSON object with no other text.",
          },
        ],
        system: JD_PARSER_SYSTEM,
      });

      const retryContent = retryResponse.content[0];
      if (retryContent.type !== "text") {
        return NextResponse.json({ error: "Failed to parse job description" }, { status: 500 });
      }

      const jd = JSON.parse(retryContent.text);
      return NextResponse.json({ jd });
    }
  } catch (error) {
    console.error("parse-jd error:", error);
    return NextResponse.json({ error: "Failed to parse job description" }, { status: 500 });
  }
}

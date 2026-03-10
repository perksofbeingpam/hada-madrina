import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { PROFILE_PARSER_SYSTEM } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "No profile text provided" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      system: PROFILE_PARSER_SYSTEM,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    try {
      const profile = JSON.parse(content.text);
      return NextResponse.json({ profile });
    } catch {
      // Retry with correction
      const retryResponse = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [
          { role: "user", content: text },
          { role: "assistant", content: content.text },
          {
            role: "user",
            content:
              "The JSON you returned is invalid. Please return ONLY a valid JSON object with no other text, comments, or markdown.",
          },
        ],
        system: PROFILE_PARSER_SYSTEM,
      });

      const retryContent = retryResponse.content[0];
      if (retryContent.type !== "text") {
        return NextResponse.json({ error: "Failed to parse profile" }, { status: 500 });
      }

      const profile = JSON.parse(retryContent.text);
      return NextResponse.json({ profile });
    }
  } catch (error) {
    console.error("parse-profile error:", error);
    return NextResponse.json(
      { error: "Failed to parse profile" },
      { status: 500 }
    );
  }
}

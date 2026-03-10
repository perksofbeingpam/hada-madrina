import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CHAT_SYSTEM } from "@/lib/prompts";
import type { ChatMessage } from "@/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile, jobDescription, auditReport, cvOutput } =
      await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const system = CHAT_SYSTEM(
      JSON.stringify(userProfile || {}),
      JSON.stringify(jobDescription || {}),
      JSON.stringify(auditReport || {}),
      JSON.stringify(cvOutput || {})
    );

    const anthropicMessages = messages.map((m: ChatMessage) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: anthropicMessages,
      system,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ reply: content.text });
  } catch (error) {
    console.error("chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}

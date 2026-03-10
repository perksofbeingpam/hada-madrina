import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { COVER_LETTER_SYSTEM } from "@/lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { cvOutput, jobDescription, auditReport } = await req.json();

    if (!cvOutput || !jobDescription || !auditReport) {
      return NextResponse.json(
        { error: "Missing required inputs" },
        { status: 400 }
      );
    }

    const system = COVER_LETTER_SYSTEM(
      JSON.stringify(cvOutput),
      JSON.stringify(jobDescription),
      JSON.stringify(auditReport)
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: "Please write the cover letter based on the inputs in the system prompt.",
        },
      ],
      system,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response type" }, { status: 500 });
    }

    return NextResponse.json({ coverLetter: content.text });
  } catch (error) {
    console.error("generate-cover-letter error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}

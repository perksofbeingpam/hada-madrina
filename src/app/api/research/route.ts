import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { companyName } = await req.json();

    if (!companyName?.trim()) {
      return NextResponse.json({ error: "No company name provided" }, { status: 400 });
    }

    const tavilyKey = process.env.TAVILY_API_KEY;

    if (!tavilyKey) {
      // Return empty results if no Tavily key configured
      return NextResponse.json({
        results: { culture: [], news: [] },
        warning: "No Tavily API key configured. Company research unavailable.",
      });
    }

    const [cultureRes, newsRes] = await Promise.all([
      fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${companyName} employee reviews culture reddit glassdoor 2025`,
          search_depth: "advanced",
          max_results: 5,
        }),
      }),
      fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${companyName} recent news layoffs hiring growth 2025`,
          search_depth: "basic",
          max_results: 3,
        }),
      }),
    ]);

    const [cultureData, newsData] = await Promise.all([
      cultureRes.json(),
      newsRes.json(),
    ]);

    return NextResponse.json({
      results: {
        culture: cultureData.results || [],
        news: newsData.results || [],
      },
    });
  } catch (error) {
    console.error("research error:", error);
    return NextResponse.json(
      { error: "Research failed", results: { culture: [], news: [] } },
      { status: 500 }
    );
  }
}

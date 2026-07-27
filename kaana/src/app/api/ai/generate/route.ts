import { NextResponse } from "next/server";
import { generateMarketingCopy } from "@/lib/ai/gemini";
import { aiGuard, parseAiRequestBody } from "@/lib/ai/request";

const MAX_PROMPT_LENGTH = Number(process.env.GEMINI_MAX_PROMPT_LENGTH ?? 400);

export async function POST(request: Request) {
  const guard = aiGuard(request);
  if (guard.blocked) return guard.blocked;

  const body = await parseAiRequestBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body._hp) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json(
      { error: "Please enter a topic or prompt." },
      { status: 400 },
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  try {
    const text = await generateMarketingCopy(prompt);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[kaana/ai/generate]", err);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? "Gemini request failed. Try GEMINI_MODEL=gemini-3.6-flash in .env.local."
            : "Could not generate content. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}

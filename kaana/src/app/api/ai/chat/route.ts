import { NextResponse } from "next/server";
import { generateChatReply } from "@/lib/ai/gemini";
import { aiGuard, parseAiRequestBody } from "@/lib/ai/request";

const MAX_MESSAGE_LENGTH = Number(process.env.GEMINI_CHAT_MAX_LENGTH ?? 300);

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

  const message = String(body.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "Please enter a message." },
      { status: 400 },
    );
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  try {
    const text = await generateChatReply(message);
    return NextResponse.json({ text });
  } catch (err) {
    console.error("[kaana/ai/chat]", err);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? "Chat unavailable. Check GEMINI_API_KEY and GEMINI_MODEL in .env.local."
            : "Could not reply right now. Please try again shortly.",
      },
      { status: 502 },
    );
  }
}

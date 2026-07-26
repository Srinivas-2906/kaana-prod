import { NextResponse } from "next/server";
import {
  checkAiRateLimit,
  getClientKey,
  isAllowedAiOrigin,
} from "@/lib/ai/rateLimit";

export async function parseAiRequestBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const raw = await request.text();
  if (!raw.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function aiConfigMissingResponse() {
  return NextResponse.json(
    {
      error:
        process.env.NODE_ENV === "development"
          ? "Add GEMINI_API_KEY to kaana/.env.local and restart npm run dev."
          : "AI demo is temporarily unavailable.",
    },
    { status: 503 },
  );
}

export function aiRateLimitResponse(rate: {
  ok: false;
  status: number;
  error: string;
  retryAfterSec?: number;
}) {
  const headers: HeadersInit = {};
  if (rate.retryAfterSec) {
    headers["Retry-After"] = String(rate.retryAfterSec);
  }
  return NextResponse.json({ error: rate.error }, { status: rate.status, headers });
}

export function aiGuard(request: Request):
  | { blocked: NextResponse; clientKey?: undefined }
  | { blocked: null; clientKey: string } {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return { blocked: aiConfigMissingResponse() };
  }
  if (!isAllowedAiOrigin(request)) {
    return { blocked: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  const clientKey = getClientKey(request);
  const rate = checkAiRateLimit(clientKey);
  if (!rate.ok) {
    return { blocked: aiRateLimitResponse(rate) };
  }
  return { blocked: null, clientKey };
}

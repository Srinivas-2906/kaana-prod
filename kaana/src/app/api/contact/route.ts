import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Hook for email/CRM integration (Resend, SendGrid, etc.)
    console.info("[kaana/contact]", {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() ?? "",
      message: message.trim(),
      at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

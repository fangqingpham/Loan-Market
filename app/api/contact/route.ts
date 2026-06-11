import { NextResponse } from "next/server";
import { APP_NAME } from "@/lib/constants";

/**
 * Contact form endpoint.
 *
 * Receives a submission from the public Contact page (components/marketing/ContactForm.tsx)
 * and forwards it to Web3Forms, which emails it to the inbox tied to your access key.
 * The submitter's address is set as reply-to, so replying from the inbox goes straight
 * back to them.
 *
 * Web3Forms sends from its own verified mail servers, so there is NO domain to own and
 * NO DNS to configure. You only need one free access key.
 *
 * Setup (one time):
 *   1. Go to https://web3forms.com, enter seed2success.financial@outlook.com, and submit.
 *      Web3Forms emails you an access key (a UUID). All submissions go to that inbox.
 *   2. In the Vercel dashboard, add an environment variable:
 *        WEB3FORMS_ACCESS_KEY = <the key from step 1>
 *   3. Redeploy.
 *
 * The access key is safe to expose, but keeping it in an env var keeps it out of the repo.
 */

export const runtime = "nodejs";

type Payload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people leave this hidden field blank. Silently accept and drop.
  if ((body.company ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and message." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }
  if (name.length > 200 || email.length > 200 || subject.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "That message is too long." }, { status: 400 });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("[contact] Missing WEB3FORMS_ACCESS_KEY — cannot send contact email.");
    return NextResponse.json(
      { error: "Email isn't set up yet. Please try again later." },
      { status: 503 }
    );
  }

  const subjectLine = subject
    ? `[${APP_NAME} contact] ${subject}`
    : `[${APP_NAME} contact] New message from ${name}`;

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: subjectLine,
        from_name: `${APP_NAME} contact form`,
        replyto: email, // reply goes back to the person who wrote in
        name,
        email,
        message,
      }),
    });

    const result = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      message?: string;
    };

    if (!res.ok || !result.success) {
      console.error("[contact] Web3Forms send failed:", res.status, result.message);
      return NextResponse.json(
        { error: "We couldn't send your message. Please try again shortly." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[contact] Web3Forms request error:", err);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

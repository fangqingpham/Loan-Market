"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button, Input, Textarea, Icon } from "@/components/ui";
import { APP_NAME } from "@/lib/constants";

/**
 * Contact box used on the public Contact page. Renders a "Send an email" button
 * that opens a modal with a short form (name, email, subject, message). On submit
 * it sends the message to the support inbox via Web3Forms.
 *
 * Styling mirrors FlashModal so the popup feels native to the rest of the site.
 *
 * Submits directly to Web3Forms from the browser. The Web3Forms access key is
 * public by design (it's an alias for the destination inbox and safe to expose),
 * so no server route or environment variable is needed — submissions go straight
 * to the inbox tied to this key.
 */

const WEB3FORMS_ACCESS_KEY = "2560bc60-27ca-4e2d-9afb-82ffb5472db8";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  function resetForm() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setCompany("");
    setStatus("idle");
    setErrorMsg("");
  }

  function close() {
    setOpen(false);
    // Reset after the modal is gone so fields don't flicker while closing.
    window.setTimeout(resetForm, 200);
  }

  // Focus the first field when the modal opens.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Allow Escape to close.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const n = name.trim();
    const em = email.trim();
    const msg = message.trim();

    if (!n || !em || !msg) {
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Honeypot: if the hidden field was filled, treat as a bot — drop silently.
    if (company.trim() !== "") {
      setStatus("success");
      return;
    }

    const subj = subject.trim();
    const subjectLine = subj
      ? `[${APP_NAME} contact] ${subj}`
      : `[${APP_NAME} contact] New message from ${n}`;

    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: subjectLine,
          from_name: `${APP_NAME} contact form`,
          replyto: em,
          botcheck: false,
          name: n,
          email: em,
          message: msg,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };
      if (!data.success) {
        setStatus("error");
        setErrorMsg(data.message || "We couldn't send your message. Please try again shortly.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("We couldn't send your message. Please check your connection and try again.");
    }
  }

  const submitting = status === "submitting";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Send an email
      </Button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-form-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={close}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                &times;
              </span>
            </button>

            {status === "success" ? (
              <div className="space-y-3 py-2 text-center">
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-verified-100 text-verified-700">
                  <Icon name="check" className="h-6 w-6" />
                </span>
                <h2 id="contact-form-title" className="text-lg font-semibold text-slate-900">
                  Message sent
                </h2>
                <p className="text-sm text-slate-600">
                  Thanks for reaching out. We read every message and aim to reply by email within a
                  couple of business days.
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={close}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name="message" className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <h2 id="contact-form-title" className="text-base font-semibold text-slate-900">
                      Email us
                    </h2>
                    <p className="text-sm text-slate-600">
                      Send us a message and we will reply by email within a couple of business days.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <Input
                    ref={firstFieldRef}
                    id="contact-name"
                    name="name"
                    label="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                  />
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    label="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                  <Input
                    id="contact-subject"
                    name="subject"
                    label="Subject (optional)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's this about?"
                  />
                  <Textarea
                    id="contact-message"
                    name="message"
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="How can we help?"
                    required
                  />

                  {/* Honeypot: hidden from people, catches bots. */}
                  <input
                    type="text"
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />

                  {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

                  <p className="text-xs text-slate-500">
                    Never include your SIN, bank login, passwords, or financial documents.
                  </p>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={close} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? "Sending\u2026" : "Send message"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

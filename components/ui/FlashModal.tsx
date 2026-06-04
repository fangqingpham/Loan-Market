"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * A small, dismissible modal ("popup") for flash messages passed via the URL
 * (?message= / ?error=). The parent SERVER component reads those search params
 * and passes them in as props, so this component never needs useSearchParams
 * (and therefore needs no Suspense boundary). On dismiss it strips the query
 * string with router.replace so a refresh won't re-open the popup.
 *
 * Used on the public boards to surface the daily contact-limit notice (and any
 * other request-flow message) as a popup rather than an inline banner.
 */
export function FlashModal({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  const text = error || message || "";
  const isError = Boolean(error);

  // Re-open whenever a new message/error arrives (props change on navigation).
  useEffect(() => {
    if (text) setDismissed(false);
  }, [text]);

  // Allow Escape to close.
  useEffect(() => {
    if (!text || dismissed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDismissed(true);
        router.replace(pathname);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [text, dismissed, pathname, router]);

  if (!text || dismissed) return null;

  function close() {
    setDismissed(true);
    router.replace(pathname); // drop ?message / ?error without a full reload
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={close}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold " +
              (isError
                ? "bg-amber-100 text-amber-700"
                : "bg-verified-100 text-verified-700")
            }
            aria-hidden="true"
          >
            {isError ? "!" : "\u2713"}
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              {isError ? "Just a moment" : "All set"}
            </h2>
            <p className="text-sm text-slate-600">{text}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

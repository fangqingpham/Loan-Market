"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import {
  APP_NAME,
  LEGAL_ENTITY,
  PLATFORM_DISCLAIMER,
  SAFETY_WARNINGS,
  ROUTES,
} from "@/lib/constants";
import { cn } from "@/lib/helpers";

type TermsAgreementFieldProps = {
  agreed: boolean;
  onAgreeChange: (agreed: boolean) => void;
};

export function TermsAgreementField({ agreed, onAgreeChange }: TermsAgreementFieldProps) {
  const [open, setOpen] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setScrolledToBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
  }

  useEffect(() => {
    if (!open) return;
    setScrolledToBottom(false);
    window.setTimeout(updateScrollState, 0);
  }, [open]);

  function openAgreement() {
    setOpen(true);
  }

  function agree() {
    onAgreeChange(true);
    setOpen(false);
  }

  return (
    <>
      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="agree"
            value="on"
            checked={agreed}
            required
            readOnly
            onClick={(event) => {
              event.preventDefault();
              openAgreement();
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
          />
          <span>
            <button
              type="button"
              onClick={openAgreement}
              className="text-left text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900"
            >
              I agree to the Terms of Service, Privacy Policy, and Disclaimer.
            </button>
          </span>
        </label>
        <p className="pl-6 text-xs text-slate-500">
          Review full pages:{" "}
          <Link href={ROUTES.terms} className="font-medium text-brand-700 hover:underline">
            Terms of Service
          </Link>
          {", "}
          <Link href={ROUTES.privacy} className="font-medium text-brand-700 hover:underline">
            Privacy Policy
          </Link>
          {", "}
          <Link href={ROUTES.disclaimer} className="font-medium text-brand-700 hover:underline">
            Disclaimer
          </Link>
        </p>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-agreement-title"
          className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-0 sm:items-center sm:p-4"
        >
          <div className="flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:mx-auto sm:max-w-2xl sm:rounded-2xl">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <h2 id="terms-agreement-title" className="text-base font-semibold text-slate-900">
                Terms Agreement
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Scroll to the bottom before agreeing.
              </p>
            </div>

            <div
              ref={scrollRef}
              onScroll={updateScrollState}
              className="max-h-[62vh] overflow-y-auto px-4 py-4 text-sm leading-6 text-slate-700 sm:px-5"
            >
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Terms of Service</h3>
                <p>
                  {APP_NAME} is operated by {LEGAL_ENTITY}. Creating an account means you
                  agree to use the platform lawfully, provide accurate information, and follow
                  the consent-based contact flow.
                </p>
                <p>{PLATFORM_DISCLAIMER}</p>
                <p>
                  Any loan, application, quote, agreement, communication, payment, or
                  transaction is strictly between the borrower and the lender or broker.
                </p>
              </section>

              <section className="mt-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Safety Rules</h3>
                <ul className="list-disc space-y-1 pl-5">
                  {SAFETY_WARNINGS.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </section>

              <section className="mt-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Privacy Policy</h3>
                <p>
                  Borrower contact details stay hidden unless the borrower approves a specific
                  contact request. We collect account, profile, listing, request, message, and
                  technical information as needed to operate and secure the service.
                </p>
                <p>
                  Do not send sensitive information through the platform, including SIN, bank
                  login credentials, passwords, tax documents, pay stubs, bank statements, or ID
                  documents.
                </p>
              </section>

              <section className="mt-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Disclaimer</h3>
                <p>
                  Loan Market is an introduction platform only. We do not verify, endorse,
                  recommend, guarantee, approve, underwrite, arrange, or participate in loans.
                </p>
                <p>
                  Users are responsible for their own due diligence, legal compliance, and
                  decisions before entering any agreement.
                </p>
              </section>

              <section className="mt-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">Full Legal Pages</h3>
                <p>
                  This modal summarizes the agreement. The full legal pages remain available:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={ROUTES.terms} className="font-medium text-brand-700 hover:underline">
                    Terms of Service
                  </Link>
                  <Link href={ROUTES.privacy} className="font-medium text-brand-700 hover:underline">
                    Privacy Policy
                  </Link>
                  <Link href={ROUTES.disclaimer} className="font-medium text-brand-700 hover:underline">
                    Disclaimer
                  </Link>
                </div>
              </section>

              <p className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                End of agreement.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={agree}
                disabled={!scrolledToBottom}
                className={cn(!scrolledToBottom && "cursor-not-allowed")}
              >
                I have read and agree
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

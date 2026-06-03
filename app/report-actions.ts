"use server";

/**
 * Report submission action, shared by loan-request cards, product cards, and
 * the message thread.
 *
 * Reporting requires being signed in. The actual report row is created by the
 * SECURITY DEFINER `submit_report` RPC, which resolves the reported user_id
 * from the target server-side (the reporter never needs — and never sees — the
 * other party's user id). Exactly one target is passed.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getCurrentUser } from "@/lib/auth";
import { ROUTES, REPORT_REASONS } from "@/lib/constants";

const REASON_VALUES = REPORT_REASONS.map((r) => r.value);

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitReportAction(formData: FormData): Promise<void> {
  // Where to send the user back to afterwards (defaults to home).
  const returnTo = str(formData, "return_to") || ROUTES.home;

  const back = (key: "message" | "error", text: string): never => {
    redirect(`${returnTo}?${key}=${encodeURIComponent(text)}`);
  };

  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  const reason = str(formData, "reason");
  const description = str(formData, "description");
  const loanRequestId = str(formData, "loan_request_id");
  const lenderListingId = str(formData, "lender_listing_id");
  const conversationId = str(formData, "conversation_id");

  if (!reason || !REASON_VALUES.includes(reason)) {
    back("error", "Please choose a valid reason for the report.");
  }

  const targets = [loanRequestId, lenderListingId, conversationId].filter(Boolean);
  if (targets.length !== 1) {
    back("error", "Could not determine what to report. Please try again.");
  }

  const supabase = createClient();
  // postgrest-js widens rpc args to `never` in this version; cast at the call
  // boundary (same workaround used for .insert()/.update() across the app).
  const { error } = await supabase.rpc("submit_report", {
    p_reason: reason,
    p_description: description || null,
    p_loan_request_id: loanRequestId || null,
    p_lender_listing_id: lenderListingId || null,
    p_conversation_id: conversationId || null,
  } as never);

  if (error) {
    const m = (error.message ?? "").toLowerCase();
    if (m.includes("duplicate_active_report")) {
      back(
        "message",
        "You've already reported this. Our team is reviewing it and will follow up as soon as possible."
      );
    }
    if (m.includes("cannot report yourself")) back("error", "You can't report yourself.");
    if (m.includes("not found")) back("error", "That item is no longer available.");
    back("error", "Could not submit your report. Please try again.");
  }

  back("message", "Thank you for reporting. We will investigate the issue and notify you as soon as possible.");
}

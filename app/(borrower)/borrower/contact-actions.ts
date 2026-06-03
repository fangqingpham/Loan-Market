"use server";

/**
 * Borrower-side contact-request actions: APPROVE or REJECT a pending request
 * from a lender.
 *
 * Business logic lives in SECURITY DEFINER database functions (Stage 2):
 *   - approve_contact_request(p_request_id) — recipient-only. For a free
 *     lender→borrower request it enforces the lender's WEEKLY APPROVED-contact
 *     cap (counting approved, not pending), then opens the conversation via
 *     _open_conversation. Returns the new status.
 *   - reject_contact_request(p_request_id) — recipient-only; no conversation.
 * We call them through the cookie-bound client (auth.uid() = borrower) and
 * translate the weekly-cap exception into the required launch message.
 *
 * IMPORTANT: the weekly cap is enforced against the LENDER, but it is checked at
 * APPROVAL time — so the borrower is the one who sees the limit message. That's
 * intentional: a conversation (and thus an "approved contact") only comes into
 * existence when the borrower approves.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { ROUTES } from "@/lib/constants";

const BORROWER_CR = ROUTES.borrowerContactRequests;

/** The exact launch-limit message required by the product spec. */
const WEEKLY_LIMIT_MESSAGE = "You have reached your weekly launch contact limit.";

function backWith(key: "message" | "error", text: string): never {
  redirect(`${BORROWER_CR}?${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * After an approval, look up the conversation that was just opened for this
 * contact request and redirect into its message thread. If no conversation
 * exists yet (e.g. a payment-pending request), this returns and the caller
 * falls back to its normal redirect.
 */
async function redirectToConversation(requestId: string): Promise<void> {
  const supabase = createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_request_id", requestId)
    .maybeSingle();
  const conv = data as { id: string } | null;
  if (conv?.id) {
    redirect(`${ROUTES.messages}/${conv.id}`);
  }
}

function friendlyApprove(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  // The RPC raises: 'Lender weekly free contact limit reached (X of Y)'
  if (m.includes("weekly") && m.includes("limit")) {
    return WEEKLY_LIMIT_MESSAGE;
  }
  if (m.includes("only the recipient")) {
    return "You can only respond to your own contact requests.";
  }
  if (m.includes("only pending")) {
    return "This request has already been handled.";
  }
  return "Could not approve the request. Please try again.";
}

function friendlyReject(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("only the recipient")) {
    return "You can only respond to your own contact requests.";
  }
  if (m.includes("only pending")) {
    return "This request has already been handled.";
  }
  return "Could not reject the request. Please try again.";
}

export async function approveContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith("error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("approve_contact_request", {
    p_request_id: requestId,
  } as never);

  if (error) backWith("error", friendlyApprove(error.message));

  revalidatePath(BORROWER_CR);
  // Approval opens a conversation — take the user straight into the thread.
  // (If payment were required the request would be 'approved_pending_payment'
  // with no conversation yet; we fall back to the contact-requests page.)
  await redirectToConversation(requestId);
  backWith("message", "Contact approved. A message thread is now open.");
}

export async function rejectContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith("error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("reject_contact_request", {
    p_request_id: requestId,
  } as never);

  if (error) backWith("error", friendlyReject(error.message));

  revalidatePath(BORROWER_CR);
  backWith("message", "Contact request declined.");
}

/**
 * Borrower cancels a request THEY sent to a lender (borrower→lender, from the
 * product board). The RPC is requester-only and enforces that.
 */
export async function cancelListingContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith("error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("cancel_contact_request", {
    p_request_id: requestId,
  } as never);

  if (error) {
    const m = (error.message ?? "").toLowerCase();
    if (m.includes("only the requester")) {
      backWith("error", "You can only cancel requests you sent.");
    }
    if (m.includes("can no longer be cancelled")) {
      backWith("error", "This request can no longer be cancelled.");
    }
    backWith("error", "Could not cancel the request. Please try again.");
  }

  revalidatePath(BORROWER_CR);
  backWith("message", "Contact request cancelled.");
}

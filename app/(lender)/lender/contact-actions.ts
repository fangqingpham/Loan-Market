"use server";

/**
 * Lender-side contact-request actions: REQUEST a borrower's contact, and CANCEL
 * a pending request.
 *
 * All business logic lives in SECURITY DEFINER database functions (Stage 2):
 *   - request_loan_request_contact(p_loan_request_id) — checks is_verified_lender,
 *     blocks duplicate active requests for the same loan request, creates a
 *     'pending' contact_request. No contact info is exposed.
 *   - cancel_contact_request(p_request_id) — requester-only.
 * We just call them through the cookie-bound client (so auth.uid() is the
 * lender) and translate raised exceptions into friendly messages.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { ROUTES, DAILY_CONTACT_LIMIT_MESSAGE } from "@/lib/constants";

const BOARD = ROUTES.loanRequests;
const LENDER_CR = ROUTES.lenderContactRequests;

function backWith(path: string, key: "message" | "error", text: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * After an approval, look up the conversation just opened for this contact
 * request and redirect into its thread. Returns (no redirect) if none exists.
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

/**
 * Map a Postgres error raised by the RPC to a friendly, user-facing message.
 * The DB functions raise specific text we can match on.
 */
function friendly(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("daily_contact_limit_reached")) {
    return DAILY_CONTACT_LIMIT_MESSAGE;
  }
  if (m.includes("insufficient_credits")) {
    return "You don't have enough credits to contact this borrower. Please buy more credits and try again.";
  }
  if (m.includes("only verified lenders")) {
    return "Your account needs to be active before you can request borrower contact.";
  }
  if (m.includes("already exists")) {
    return "You already have an active contact request for this loan request.";
  }
  if (m.includes("not found") || m.includes("not active")) {
    return "That loan request is no longer available.";
  }
  if (m.includes("not allowed")) {
    return "Contact is not allowed for this request.";
  }
  return "Could not complete that action. Please try again.";
}

export async function requestContactAction(formData: FormData): Promise<void> {
  const loanRequestId = str(formData, "loan_request_id");
  // Where to send the user back to (defaults to the board).
  const returnTo = str(formData, "return_to") || BOARD;
  if (!loanRequestId) backWith(returnTo, "error", "Missing loan request.");

  const supabase = createClient();
  const { error } = await supabase.rpc("request_loan_request_contact", {
    p_loan_request_id: loanRequestId,
  } as never);

  if (error) backWith(returnTo, "error", friendly(error.message));

  revalidatePath(returnTo);
  revalidatePath(LENDER_CR);
  backWith(
    returnTo,
    "message",
    "Contact request sent. The borrower will be notified to approve or decline."
  );
}

export async function cancelContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith(LENDER_CR, "error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("cancel_contact_request", {
    p_request_id: requestId,
  } as never);

  if (error) backWith(LENDER_CR, "error", friendly(error.message));

  revalidatePath(LENDER_CR);
  backWith(LENDER_CR, "message", "Contact request cancelled.");
}

/**
 * INCOMING borrower→lender requests (from the product board "Contact This
 * Lender" button). Here the LENDER is the recipient, so the lender approves or
 * rejects. The RPCs are recipient-only and enforce that. For borrower→lender
 * there is no weekly cap. Approval opens a conversation (free path while
 * listing-contact payment is disabled).
 */
function friendlyRespond(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("only the recipient")) {
    return "You can only respond to requests addressed to you.";
  }
  if (m.includes("only pending")) {
    return "This request has already been handled.";
  }
  return "Could not complete that action. Please try again.";
}

export async function approveListingContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith(LENDER_CR, "error", "Missing request id.");

  const supabase = createClient();
  const { data, error } = await supabase.rpc("approve_contact_request", {
    p_request_id: requestId,
  } as never);
  if (error) backWith(LENDER_CR, "error", friendlyRespond(error.message));

  revalidatePath(LENDER_CR);

  // If listing-contact payment is enabled, approving a borrower→lender request
  // yields 'approved_pending_payment' and NO conversation opens until the
  // borrower pays. Otherwise it's 'approved' and a thread opens now.
  const status = data as unknown as string | null;
  if (status === "approved_pending_payment") {
    backWith(
      LENDER_CR,
      "message",
      "Approved. The borrower has been asked to pay the platform communication fee; messaging opens once they pay."
    );
  }

  // Free path — take the lender straight into the newly opened thread.
  await redirectToConversation(requestId);
  backWith(LENDER_CR, "message", "Request approved. A message thread is now open.");
}

export async function rejectListingContactAction(formData: FormData): Promise<void> {
  const requestId = str(formData, "request_id");
  if (!requestId) backWith(LENDER_CR, "error", "Missing request id.");

  const supabase = createClient();
  const { error } = await supabase.rpc("reject_contact_request", {
    p_request_id: requestId,
  } as never);
  if (error) backWith(LENDER_CR, "error", friendlyRespond(error.message));

  revalidatePath(LENDER_CR);
  backWith(LENDER_CR, "message", "Request declined.");
}

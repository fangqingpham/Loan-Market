"use server";

/**
 * Admin actions for the report queue.
 *
 * Authorization: every action re-checks is_admin() server-side, and the DB
 * enforces it too (rep_update is admin-only; lender_profiles/loan_requests/
 * lender_listings updates are admin-or-owner with the admin path used here).
 *
 * What admins can do from a report:
 *  - set status: open / reviewing / closed
 *  - add an admin note (stored on the report's admin_notes column)
 *  - suspend the reported user (lenders → verification_status = 'suspended')
 *  - remove related content (loan request / product → status 'removed_by_admin')
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { ReportStatus, Database } from "@/types/database";

type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];
type LenderProfileUpdate = Database["public"]["Tables"]["lender_profiles"]["Update"];
type LoanRequestUpdate = Database["public"]["Tables"]["loan_requests"]["Update"];
type ListingUpdate = Database["public"]["Tables"]["lender_listings"]["Update"];

function detailPath(id: string): string {
  return `${ROUTES.adminReports}/${id}`;
}

function fail(id: string, message: string): never {
  redirect(`${detailPath(id)}?error=${encodeURIComponent(message)}`);
}

function ok(id: string, message: string): never {
  redirect(`${detailPath(id)}?message=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

const VALID_STATUS: ReportStatus[] = ["open", "reviewing", "closed"];

export async function setReportStatusAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const next = str(formData, "status") as ReportStatus;
  if (!id) redirect(ROUTES.adminReports);
  if (!VALID_STATUS.includes(next)) fail(id, "Invalid status.");
  if (!(await isAdmin())) redirect(ROUTES.adminReports);

  const supabase = createClient();
  const patch: ReportUpdate = { status: next };
  const { error } = await supabase.from("reports").update(patch as never).eq("id", id);
  if (error) fail(id, "Could not update the report status. Please try again.");

  revalidatePath(detailPath(id));
  revalidatePath(ROUTES.adminReports);
  ok(id, `Report marked as ${next}.`);
}

export async function addReportNoteAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const note = str(formData, "admin_notes");
  if (!id) redirect(ROUTES.adminReports);
  if (!note) fail(id, "The note can't be empty.");
  if (!(await isAdmin())) redirect(ROUTES.adminReports);

  const supabase = createClient();
  const patch: ReportUpdate = { admin_notes: note };
  const { error } = await supabase.from("reports").update(patch as never).eq("id", id);
  if (error) fail(id, "Could not save the note. Please try again.");

  revalidatePath(detailPath(id));
  ok(id, "Note saved.");
}

/**
 * Suspend the reported user. Account-level suspension is only modeled for
 * LENDERS (verification_status = 'suspended'), which removes them from the
 * directory/boards and is enforced across the app. Borrowers have no
 * account-suspend field in the schema — for a reported borrower the moderation
 * lever is removing their content (see removeReportedContentAction); this action
 * reports that clearly rather than silently doing nothing.
 */
export async function suspendReportedUserAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const reportedUserId = str(formData, "reported_user_id");
  if (!id) redirect(ROUTES.adminReports);
  if (!reportedUserId) fail(id, "Missing reported user.");
  if (!(await isAdmin())) redirect(ROUTES.adminReports);

  const supabase = createClient();

  // Find the reported user's lender profile (if any).
  const { data: lenderData } = await supabase
    .from("lender_profiles")
    .select("id, verification_status")
    .eq("user_id", reportedUserId)
    .maybeSingle();
  const lender = lenderData as { id: string; verification_status: string } | null;

  if (!lender) {
    fail(
      id,
      "This user isn't a lender. Account-level suspension applies to lenders; for a borrower, remove their related content instead."
    );
  }

  const patch: LenderProfileUpdate = {
    verification_status: "suspended",
    verification_notes: "Suspended following a user report.",
  };
  const { error } = await supabase
    .from("lender_profiles")
    .update(patch as never)
    .eq("id", lender!.id);
  if (error) fail(id, "Could not suspend the lender. Please try again.");

  revalidatePath(detailPath(id));
  ok(id, "Reported lender has been suspended.");
}

/**
 * Remove the content the report points at:
 *  - related loan request → status 'removed_by_admin'
 *  - related lender listing → status 'removed_by_admin'
 * (A conversation report has no content to remove; the admin uses status/notes
 * and/or suspension instead.)
 */
export async function removeReportedContentAction(formData: FormData): Promise<void> {
  const id = str(formData, "id");
  const loanRequestId = str(formData, "loan_request_id");
  const lenderListingId = str(formData, "lender_listing_id");
  if (!id) redirect(ROUTES.adminReports);
  if (!(await isAdmin())) redirect(ROUTES.adminReports);

  const supabase = createClient();

  if (loanRequestId) {
    const patch: LoanRequestUpdate = { status: "removed_by_admin" };
    const { error } = await supabase.from("loan_requests").update(patch as never).eq("id", loanRequestId);
    if (error) fail(id, "Could not remove the loan request. Please try again.");
    revalidatePath(detailPath(id));
    ok(id, "The reported loan request has been removed.");
  }

  if (lenderListingId) {
    const patch: ListingUpdate = { status: "removed_by_admin" };
    const { error } = await supabase.from("lender_listings").update(patch as never).eq("id", lenderListingId);
    if (error) fail(id, "Could not remove the product. Please try again.");
    revalidatePath(detailPath(id));
    ok(id, "The reported product has been removed.");
  }

  fail(id, "This report has no related content to remove.");
}

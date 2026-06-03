"use server";

/**
 * Admin server actions for lender verification.
 *
 * Authorization model:
 *  - These run through the COOKIE-BOUND server client. Every action re-checks
 *    `is_admin()` server-side before doing anything, and the DB enforces it too:
 *    RLS `lp_update` allows the write only for admins, and the
 *    `guard_lender_verification` trigger permits changes to verification_status
 *    ONLY when the caller is an admin. So a non-admin (or a lender trying to
 *    self-approve) is blocked in three independent places.
 *  - `admin_notes` is admin-only by RLS (`an_all`).
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { LenderVerificationStatus, Database } from "@/types/database";

type LenderProfileUpdate = Database["public"]["Tables"]["lender_profiles"]["Update"];
type AdminNoteInsert = Database["public"]["Tables"]["admin_notes"]["Insert"];

function detailPath(id: string): string {
  return `${ROUTES.adminLenders}/${id}`;
}

function fail(id: string, message: string): never {
  redirect(`${detailPath(id)}?error=${encodeURIComponent(message)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Shared status setter. `reason` (optional) is stored in verification_notes so
 * there's a record of why a lender was rejected/suspended/approved.
 */
async function setVerificationStatus(
  formData: FormData,
  next: LenderVerificationStatus,
  okMessage: string
) {
  const id = str(formData, "id");
  if (!id) redirect(ROUTES.adminLenders);

  // Server-side admin gate (defense in depth on top of RLS + trigger).
  if (!(await isAdmin())) {
    redirect(ROUTES.adminLenders);
  }

  const reason = str(formData, "reason");
  // Require a reason for the negative actions.
  if ((next === "rejected" || next === "suspended") && !reason) {
    fail(id, "Please provide a reason before rejecting or suspending.");
  }

  const supabase = createClient();
  const patch: LenderProfileUpdate = {
    verification_status: next,
    ...(reason ? { verification_notes: reason } : {}),
  };
  const { error } = await supabase.from("lender_profiles").update(patch as never).eq("id", id);
  if (error) fail(id, "Could not update the lender. Please try again.");

  revalidatePath(detailPath(id));
  revalidatePath(ROUTES.adminLenders);
  redirect(`${detailPath(id)}?message=${encodeURIComponent(okMessage)}`);
}

export async function approveLenderAction(formData: FormData): Promise<void> {
  await setVerificationStatus(formData, "verified", "Lender approved and verified.");
}

export async function rejectLenderAction(formData: FormData): Promise<void> {
  await setVerificationStatus(formData, "rejected", "Lender rejected.");
}

export async function suspendLenderAction(formData: FormData): Promise<void> {
  await setVerificationStatus(formData, "suspended", "Lender suspended.");
}

/** Re-activate a rejected/suspended lender back to pending for another review. */
export async function resetLenderToPendingAction(formData: FormData): Promise<void> {
  await setVerificationStatus(
    formData,
    "pending_verification",
    "Lender set back to pending review."
  );
}

export async function addAdminNoteAction(formData: FormData): Promise<void> {
  const lenderProfileId = str(formData, "id");
  const relatedUserId = str(formData, "related_user_id");
  const note = str(formData, "note");
  if (!lenderProfileId) redirect(ROUTES.adminLenders);
  if (!note) fail(lenderProfileId, "The note can't be empty.");

  if (!(await isAdmin())) {
    redirect(ROUTES.adminLenders);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.adminLenders);

  const payload: AdminNoteInsert = {
    admin_user_id: user.id,
    related_user_id: relatedUserId || null,
    related_lender_profile_id: lenderProfileId,
    note,
  };
  const { error } = await supabase.from("admin_notes").insert(payload as never);
  if (error) fail(lenderProfileId, "Could not save the note. Please try again.");

  revalidatePath(detailPath(lenderProfileId));
  redirect(`${detailPath(lenderProfileId)}?message=${encodeURIComponent("Note added.")}`);
}

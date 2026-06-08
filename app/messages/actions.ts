"use server";

/**
 * Messaging server action: send a message into an approved conversation.
 *
 * Security is enforced by the database, not here:
 *   - RLS `msg_insert` requires the sender to be the current user AND a
 *     participant of the conversation AND the conversation to be 'active' AND
 *     no block between the two parties. A non-participant's insert is rejected.
 *   - `expires_at` is set automatically by the `set_message_expiry` trigger
 *     (created_at + the configured retention window, default 6 months) — we
 *     never set it from app code.
 *
 * We insert through the cookie-bound client so `auth.uid()` is the sender.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { ROUTES } from "@/lib/constants";
import type { Database } from "@/types/database";

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const conversationId = str(formData, "conversation_id");
  const body = str(formData, "body");
  const safetyAck = formData.get("safety_ack");

  const thread = `${ROUTES.messages}/${conversationId}`;

  if (!conversationId) redirect(ROUTES.messages);
  if (!body) {
    redirect(`${thread}?error=${encodeURIComponent("Message can't be empty.")}`);
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const { count, error: countError } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("sender_user_id", user.id);
  if (countError) {
    redirect(`${thread}?error=${encodeURIComponent("Could not send your message.")}`);
  }
  if ((count ?? 0) === 0 && safetyAck !== "on") {
    redirect(`${thread}?error=${encodeURIComponent("Please confirm the safety notice before your first message.")}`);
  }

  // Build a properly-typed payload, cast only at the call boundary (the same
  // postgrest `never`-widening workaround used elsewhere in the app).
  const payload: MessageInsert = {
    conversation_id: conversationId,
    sender_user_id: user.id,
    body,
  };

  const { error } = await supabase.from("messages").insert(payload as never);
  if (error) {
    // RLS rejection (not a participant / conversation closed / blocked) or any
    // other failure lands here. Keep the reason generic and safe.
    redirect(`${thread}?error=${encodeURIComponent("Could not send your message.")}`);
  }

  revalidatePath(thread);
  redirect(thread);
}

/**
 * Block the other participant of a conversation. Once the block row exists, the
 * msg_insert RLS policy (via conversation_blocked()) prevents EITHER party from
 * posting new messages. The block_in_conversation RPC resolves the other
 * participant server-side (the blocker can't read their user id directly).
 */
export async function blockAction(formData: FormData): Promise<void> {
  const conversationId = str(formData, "conversation_id");
  const thread = `${ROUTES.messages}/${conversationId}`;
  if (!conversationId) redirect(ROUTES.messages);

  const supabase = createClient();
  const { error } = await supabase.rpc("block_in_conversation", {
    p_conversation_id: conversationId,
  } as never);
  if (error) {
    redirect(`${thread}?error=${encodeURIComponent("Could not block this user.")}`);
  }

  revalidatePath(thread);
  redirect(`${thread}?message=${encodeURIComponent("You've blocked this user. They can no longer message you here.")}`);
}

/** Remove a block the current user placed on their conversation partner. */
export async function unblockAction(formData: FormData): Promise<void> {
  const conversationId = str(formData, "conversation_id");
  const thread = `${ROUTES.messages}/${conversationId}`;
  if (!conversationId) redirect(ROUTES.messages);

  const supabase = createClient();
  const { error } = await supabase.rpc("unblock_in_conversation", {
    p_conversation_id: conversationId,
  } as never);
  if (error) {
    redirect(`${thread}?error=${encodeURIComponent("Could not unblock this user.")}`);
  }

  revalidatePath(thread);
  redirect(`${thread}?message=${encodeURIComponent("You've unblocked this user. Messaging is open again.")}`);
}

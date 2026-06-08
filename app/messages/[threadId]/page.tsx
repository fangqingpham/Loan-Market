import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, Icon } from "@/components/ui";
import { sendMessageAction } from "@/app/messages/actions";
import { ReportButton, BlockButton } from "@/components/safety";
import { createClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/auth";
import { ROUTES, MESSAGING_SAFETY_WARNING } from "@/lib/constants";
import { formatDate } from "@/lib/helpers";
import type { ConversationStatus } from "@/types/database";

export const metadata: Metadata = { title: "Conversation" };

type ConvRow = {
  id: string;
  borrower_id: string;
  lender_id: string;
  status: ConversationStatus;
  created_at: string;
};

type MsgRow = {
  id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

/** Format a timestamp as a short date + time for message bubbles. */
function formatStamp(iso: string): string {
  const d = new Date(iso);
  return `${formatDate(iso)}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: { threadId: string };
  searchParams?: { error?: string; message?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = createClient();

  // ACCESS CONTROL: RLS conv_select only returns this row if the current user
  // is a participant (borrower or lender of THIS conversation) or an admin.
  // If they aren't, the query yields null and we send them back to the list —
  // an unapproved/unrelated user can never load the thread.
  const { data: convData } = await supabase
    .from("conversations")
    .select("id, borrower_id, lender_id, status, created_at")
    .eq("id", params.threadId)
    .maybeSingle();
  const conversation = convData as ConvRow | null;

  if (!conversation) {
    redirect(`${ROUTES.messages}?error=${encodeURIComponent("Conversation not found or access denied.")}`);
  }

  const role = profile.role;
  const isAdmin = role === "admin";
  // If the row came back and the viewer isn't an admin, RLS guarantees they're
  // a participant — so only borrower/lender participants can post.
  const canPost = !isAdmin && conversation.status === "active";

  // Resolve the other party's display name (safe fields only).
  let otherName = "Conversation";
  if (role === "borrower" || isAdmin) {
    const { data } = await supabase
      .from("lender_directory" as never)
      .select("id, business_name")
      .eq("id", conversation.lender_id)
      .maybeSingle();
    const lender = data as { business_name: string | null } | null;
    if (role === "borrower") otherName = lender?.business_name || "Verified lender";
  }
  if (role === "lender" || isAdmin) {
    const { data } = await supabase
      .from("borrower_profiles")
      .select("id, display_name")
      .eq("id", conversation.borrower_id)
      .maybeSingle();
    const borrower = data as { display_name: string | null } | null;
    if (role === "lender") otherName = borrower?.display_name?.trim() || "Anonymous borrower";
  }
  if (isAdmin) otherName = "Conversation (admin view)";

  // Messages (RLS msg_select restricts to participants/admin), oldest first.
  const { data: msgData } = await supabase
    .from("messages")
    .select("id, sender_user_id, body, created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });
  const messages = (msgData as MsgRow[] | null) ?? [];
  const hasSentMessage = messages.some((message) => message.sender_user_id === profile.userId);

  // Has the current user blocked their partner? (participants only)
  let iBlocked = false;
  if (!isAdmin) {
    const { data: blockedData } = await supabase.rpc("i_blocked_partner", {
      p_conversation_id: conversation.id,
    } as never);
    iBlocked = Boolean(blockedData);
  }
  // Participants may post only when active, not admin, and they haven't blocked.
  const canSend = canPost && !iBlocked;

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href={ROUTES.messages}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          All messages
        </Link>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name="user" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{otherName}</h1>
              <p className="text-xs text-slate-500">Opened {formatDate(conversation.created_at)}</p>
            </div>
          </div>
          {/* Safety controls (participants only) */}
          {!isAdmin && (
            <div className="flex items-center gap-3">
              <ReportButton conversationId={conversation.id} returnTo={`${ROUTES.messages}/${conversation.id}`} />
              <BlockButton conversationId={conversation.id} blocked={iBlocked} />
            </div>
          )}
        </div>

        {/* Safety warning — shown at the top of every thread, before any message. */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="shield" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <p className="text-xs leading-relaxed text-amber-900">{MESSAGING_SAFETY_WARNING}</p>
          </div>
        </div>

        {searchParams?.message && (
          <div className="mt-4 rounded-xl border border-verified-500/30 bg-verified-100/50 px-3 py-2 text-sm text-verified-700">
            {searchParams.message}
          </div>
        )}
        {searchParams?.error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}

        {/* Messages */}
        <div className="mt-6 flex flex-col gap-3">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-slate-500">
                No messages yet. Say hello — and remember the guidance above.
              </CardContent>
            </Card>
          ) : (
            messages.map((m) => {
              const mine = m.sender_user_id === profile.userId;
              return (
                <div
                  key={m.id}
                  className={mine ? "flex flex-col items-end" : "flex flex-col items-start"}
                >
                  <div
                    className={
                      mine
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2 text-sm text-white"
                        : "max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-sm text-slate-900"
                    }
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                  <span className="mt-1 text-[11px] text-slate-400">{formatStamp(m.created_at)}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        {canSend ? (
          <form action={sendMessageAction} className="mt-6 flex flex-col gap-2">
            <input type="hidden" name="conversation_id" value={conversation.id} />
            {!hasSentMessage && (
              <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <input
                  type="checkbox"
                  name="safety_ack"
                  required
                  className="mt-0.5 h-4 w-4 rounded border-amber-400"
                />
                <span>
                  Before my first message, I confirm I understand: Loan Market does not lend,
                  approve, or arrange loans. I will not upload documents or share my SIN, bank
                  login, passwords, tax documents, pay stubs, bank statements, or ID, and I will
                  not pay upfront fees to receive a loan.
                </span>
              </label>
            )}
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Write a message…"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Never share SIN, bank logins, passwords, or send upfront fees.
              </p>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Send
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
            {isAdmin
              ? "Admin view — read only."
              : iBlocked
                ? "You've blocked this user. Unblock above to send messages again."
                : "This conversation is closed. You can read it, but new messages can't be sent."}
          </div>
        )}
      </div>
    </Container>
  );
}

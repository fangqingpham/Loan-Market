"use client";

/**
 * Block / unblock control for a message thread. Shows the relevant action based
 * on whether the current user has already blocked their conversation partner.
 * Posting to the block/unblock actions; the DB enforces the messaging block.
 */
import { blockAction, unblockAction } from "@/app/messages/actions";

export function BlockButton({
  conversationId,
  blocked,
}: {
  conversationId: string;
  blocked: boolean;
}) {
  if (blocked) {
    return (
      <form action={unblockAction}>
        <input type="hidden" name="conversation_id" value={conversationId} />
        <button
          type="submit"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          Unblock user
        </button>
      </form>
    );
  }
  return (
    <form action={blockAction}>
      <input type="hidden" name="conversation_id" value={conversationId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-600"
      >
        Block user
      </button>
    </form>
  );
}

import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Messaging uses a single shared surface at /messages (the thread must be
 * shared between borrower and lender anyway). This role-specific path just
 * forwards there; the (lender) layout still gates access to lenders.
 */
export default function LenderMessagesRedirect() {
  redirect(ROUTES.messages);
}

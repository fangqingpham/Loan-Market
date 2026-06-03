import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/**
 * Messaging uses a single shared surface at /messages (the thread must be
 * shared between borrower and lender anyway). This role-specific path just
 * forwards there; the (borrower) layout still gates access to borrowers.
 */
export default function BorrowerMessagesRedirect() {
  redirect(ROUTES.messages);
}

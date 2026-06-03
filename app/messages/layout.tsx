import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

/**
 * All /messages routes require a signed-in user. Per-conversation access is
 * enforced separately by RLS (only participants can read a conversation or its
 * messages) and re-checked in the thread page.
 */
export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}

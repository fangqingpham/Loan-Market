"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { dashboardPathFor } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import type { Database, UserRole } from "@/types/database";

type NotificationTarget = Pick<
  Database["public"]["Tables"]["notifications"]["Row"],
  "type" | "link_url" | "related_entity_type" | "related_entity_id"
>;

type ProfileRole = Pick<Database["public"]["Tables"]["profiles"]["Row"], "role">;
type ContactRequestDirection = Pick<
  Database["public"]["Tables"]["contact_requests"]["Row"],
  "direction"
>;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function safeInternalPath(value: string, fallback: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}

async function roleForCurrentUser(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<UserRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  const profile = data as ProfileRole | null;
  return profile?.role ?? null;
}

function fallbackPathFor(role: UserRole | null): string {
  return role ? dashboardPathFor(role) : ROUTES.home;
}

async function notificationDestination(
  supabase: ReturnType<typeof createClient>,
  notification: NotificationTarget | null,
  role: UserRole | null
): Promise<string> {
  const fallback = fallbackPathFor(role);
  if (!notification) return fallback;

  if (
    notification.related_entity_type === "conversation" &&
    notification.related_entity_id
  ) {
    return `${ROUTES.messages}/${notification.related_entity_id}`;
  }

  if (
    notification.type === "contact_request_approved" &&
    notification.related_entity_type === "contact_request" &&
    notification.related_entity_id
  ) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("contact_request_id", notification.related_entity_id)
      .maybeSingle();
    const conversation = data as { id: string } | null;
    if (conversation?.id) return `${ROUTES.messages}/${conversation.id}`;
  }

  if (
    (notification.type === "contact_request_new" ||
      notification.type === "contact_request_declined" ||
      notification.type === "contact_request_approved") &&
    notification.related_entity_type === "contact_request" &&
    notification.related_entity_id
  ) {
    const { data } = await supabase
      .from("contact_requests")
      .select("direction")
      .eq("id", notification.related_entity_id)
      .maybeSingle();
    const request = data as ContactRequestDirection | null;
    if (request?.direction === "lender_to_borrower") {
      return notification.type === "contact_request_new"
        ? ROUTES.borrowerContactRequests
        : ROUTES.lenderContactRequests;
    }
    if (request?.direction === "borrower_to_lender") {
      return notification.type === "contact_request_new"
        ? ROUTES.lenderContactRequests
        : ROUTES.borrowerContactRequests;
    }
  }

  return safeInternalPath(notification.link_url ?? "", fallback);
}

export async function openNotificationAction(formData: FormData): Promise<void> {
  const id = str(formData, "notification_id");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  const role = await roleForCurrentUser(supabase, user.id);
  let notification: NotificationTarget | null = null;

  if (id) {
    const { data } = await supabase
      .from("notifications")
      .select("type, link_url, related_entity_type, related_entity_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    notification = data as NotificationTarget | null;

    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("user_id", user.id);
  }

  const linkUrl = notification
    ? await notificationDestination(supabase, notification, role)
    : safeInternalPath(str(formData, "link_url"), fallbackPathFor(role));

  revalidatePath("/");
  redirect(safeInternalPath(linkUrl, fallbackPathFor(role)));
}

export async function markAllNotificationsReadAction(formData: FormData): Promise<void> {
  const returnTo = safeInternalPath(str(formData, "return_to") || "/", "/");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() } as never)
    .eq("user_id", user.id)
    .is("read_at", null);

  revalidatePath(returnTo);
  redirect(returnTo);
}

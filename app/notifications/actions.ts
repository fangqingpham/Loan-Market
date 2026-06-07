"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { dashboardPathFor } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function safeInternalPath(value: string, fallback: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}

async function fallbackPath(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return ROUTES.login;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = data as { role: "borrower" | "lender" | "admin" } | null;
  return profile ? dashboardPathFor(profile.role) : ROUTES.login;
}

export async function openNotificationAction(formData: FormData): Promise<void> {
  const id = str(formData, "notification_id");
  const linkUrl = safeInternalPath(str(formData, "link_url"), await fallbackPath());

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(ROUTES.login);

  if (id) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() } as never)
      .eq("id", id)
      .eq("user_id", user.id);
  }

  revalidatePath("/");
  redirect(linkUrl);
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

import { createClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type NotificationSummary = {
  unreadCount: number;
  notifications: NotificationRow[];
};

export async function getNotificationSummary(limit = 8): Promise<NotificationSummary> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { unreadCount: 0, notifications: [] };
  }

  const [countResult, listResult] = await Promise.all([
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  return {
    unreadCount: countResult.count ?? 0,
    notifications: (listResult.data as NotificationRow[] | null) ?? [],
  };
}


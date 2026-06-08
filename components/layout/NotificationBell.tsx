"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/helpers";
import {
  markAllNotificationsReadAction,
  openNotificationAction,
} from "@/app/notifications/actions";
import type { NotificationRow } from "@/lib/notifications";

function formatWhen(value: string): string {
  const timestamp = new Date(value).getTime();
  const diff = Date.now() - timestamp;
  if (!Number.isFinite(diff)) return "";

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export function NotificationBell({
  unreadCount,
  notifications,
  className,
}: {
  unreadCount: number;
  notifications: NotificationRow[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold leading-5 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            {unreadCount > 0 && (
              <form action={markAllNotificationsReadAction}>
                <input type="hidden" name="return_to" value={pathname} />
                <button
                  type="submit"
                  className="text-xs font-medium text-brand-700 hover:text-brand-900"
                >
                  Mark all as read
                </button>
              </form>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => {
                const unread = !notification.read_at;
                return (
                  <form key={notification.id} action={openNotificationAction}>
                    <input type="hidden" name="notification_id" value={notification.id} />
                    <input type="hidden" name="link_url" value={notification.link_url || ""} />
                    <button
                      type="submit"
                      className={cn(
                        "block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50",
                        unread && "bg-brand-50/50"
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-sm text-slate-900",
                              unread ? "font-semibold" : "font-medium"
                            )}
                          >
                            {notification.title}
                          </span>
                          {notification.body && (
                            <span className="mt-0.5 block text-sm leading-5 text-slate-600">
                              {notification.body}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatWhen(notification.created_at)}
                        </span>
                      </span>
                    </button>
                  </form>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

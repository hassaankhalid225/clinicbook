"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/core/notifications";

export function NotificationDropdown({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => i.unread).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border bg-popover shadow-lg">
            <div className="border-b px-4 py-2.5 text-sm font-semibold">
              Notifications
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  You&apos;re all caught up.
                </p>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 border-b px-4 py-3 last:border-0",
                      n.unread && "bg-primary/5",
                    )}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.unread ? "bg-primary" : "bg-transparent")} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{n.body}</p>
                      <p className="text-xs text-muted-foreground/70">{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

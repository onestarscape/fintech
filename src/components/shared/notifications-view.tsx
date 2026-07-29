import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/messages";

export async function NotificationsView() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllNotificationsRead}>
            <input type="hidden" name="user_id" value={user!.id} />
            <Button type="submit" variant="ghost" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {notifications?.map((n) => (
          <Card key={n.id} className={`p-4 ${!n.is_read ? "border-accent/40 bg-accent-soft/40" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                {n.message && <p className="mt-1 text-sm text-muted">{n.message}</p>}
                <p className="mt-1.5 font-mono-data text-xs text-muted">
                  {new Date(n.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {!n.is_read && (
                <form action={markNotificationRead}>
                  <input type="hidden" name="notification_id" value={n.id} />
                  <button type="submit" className="text-xs font-medium text-accent whitespace-nowrap">
                    Mark read
                  </button>
                </form>
              )}
            </div>
          </Card>
        ))}

        {!notifications?.length && (
          <Card className="p-10 text-center">
            <p className="text-sm text-muted">No notifications yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

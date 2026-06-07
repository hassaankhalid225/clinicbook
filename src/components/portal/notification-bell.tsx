import { getNotifications, type NotifAudience } from "@/core/notifications";
import { NotificationDropdown } from "./notification-dropdown";

export async function NotificationBell({ audience }: { audience: NotifAudience }) {
  const items = await getNotifications(audience);
  return <NotificationDropdown items={items} />;
}

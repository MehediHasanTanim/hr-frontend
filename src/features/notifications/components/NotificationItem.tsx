"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell, FileText, Pen, DollarSign, BellRing } from "lucide-react";

import { useMarkRead } from "../hooks/useNotifications";
import { useToastStore } from "@/stores/toast.store";
import type { Notification } from "../types/notification.types";

const iconMap: Record<string, React.ReactNode> = {
  LEAVE_REQUESTED: <BellRing className="size-4 text-blue-500" />,
  LEAVE_APPROVED: <BellRing className="size-4 text-green-500" />,
  LEAVE_REJECTED: <BellRing className="size-4 text-red-500" />,
  PAYSLIP_READY: <DollarSign className="size-4 text-amber-500" />,
  POLICY_PUBLISHED: <FileText className="size-4 text-purple-500" />,
  AUDIT_EXPORT_READY: <FileText className="size-4 text-gray-500" />,
  ESIGN_REQUEST: <Pen className="size-4 text-blue-500" />,
  ESIGN_SIGNED: <Pen className="size-4 text-green-500" />,
  ESIGN_DECLINED: <Pen className="size-4 text-red-500" />,
};

function getDeepLink(n: Notification): string | null {
  switch (n.type) {
    case "LEAVE_REQUESTED":
      return `/leave/requests/${n.metadata?.leaveRequestId}`;
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
      return `/leave/my-requests`;
    case "PAYSLIP_READY":
      return `/payroll/payslips`;
    case "POLICY_PUBLISHED":
      return `/compliance/policies`;
    case "AUDIT_EXPORT_READY":
      return null;
    case "ESIGN_REQUEST":
      return `/esign/${n.metadata?.esignRequestId}`;
    case "ESIGN_SIGNED":
    case "ESIGN_DECLINED":
      return `/esign`;
    default:
      return null;
  }
}

interface NotificationItemProps {
  notification: Notification;
  onNavigate: () => void;
}

export function NotificationItem({
  notification,
  onNavigate,
}: NotificationItemProps) {
  const router = useRouter();
  const markReadMutation = useMarkRead();
  const addToast = useToastStore((s) => s.addToast);

  const handleClick = () => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.type === "AUDIT_EXPORT_READY") {
      const signedUrl = notification.metadata?.signedUrl as
        | string
        | undefined;
      if (signedUrl) {
        window.open(signedUrl, "_blank");
      } else {
        addToast({
          message:
            "Export link has expired. Please re-run the export.",
          variant: "warning",
          duration: 3000,
        });
      }
    } else {
      const deepLink = getDeepLink(notification);
      if (deepLink) {
        router.push(deepLink);
      }
    }

    onNavigate();
  };

  const icon = iconMap[notification.type] ?? (
    <Bell className="size-4 text-gray-500" />
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 transition-colors hover:bg-muted/50 ${
        !notification.isRead
          ? "border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "bg-background"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{notification.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {!notification.isRead && (
          <span className="size-2 rounded-full bg-blue-500 shrink-0 mt-2" />
        )}
      </div>
    </button>
  );
}

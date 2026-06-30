export type NotificationType =
  | 'LEAVE_REQUESTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'PAYSLIP_READY'
  | 'POLICY_PUBLISHED'
  | 'AUDIT_EXPORT_READY'
  | 'ESIGN_REQUEST'
  | 'ESIGN_SIGNED'
  | 'ESIGN_DECLINED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
}

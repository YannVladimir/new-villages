export type NotificationType = 'MESSAGE' | 'INVITATION' | 'EVENT' | 'ANNOUNCEMENT' | 'SYSTEM';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
}

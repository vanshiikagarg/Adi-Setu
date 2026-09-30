export type NotificationType =
  | 'deadline'
  | 'application'
  | 'pending'
  | 'document'
  | 'verification'
  | 'scholarship'
  | 'dbt'
  | 'jago'
  | 'system'
  | 'warning'
  | 'error';

export type NotificationDestination =
  | '/scholarship/post-matric'
  | '/applications'
  | '/(tabs)/documents'
  | '/(tabs)/assistant';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  destination?: NotificationDestination;
};

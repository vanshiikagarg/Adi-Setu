import { AppNotification } from '../types/notifications';

// Demo data only. Replace this provider with GET /api/notifications when that
// endpoint is implemented; these entries are not live or government notices.
const mockNotifications: AppNotification[] = [
  {
    id: 'demo-deadline',
    type: 'deadline',
    title: 'Check scheme deadline',
    message: 'No deadline is configured in this prototype. Check the current official scheme information before applying.',
    time: '2 hours ago',
    unread: true,
    destination: '/scholarship/post-matric',
  },
  {
    id: 'demo-application',
    type: 'application',
    title: 'Review application tracking',
    message: 'Application stages shown in ADI SETU are prototype records unless an authorized portal source is connected.',
    time: 'Yesterday',
    unread: true,
    destination: '/applications',
  },
  {
    id: 'demo-document',
    type: 'document',
    title: 'Document wallet information',
    message: 'Review each document source and status. Prototype selections are not verified documents.',
    time: 'Yesterday',
    unread: false,
    destination: '/(tabs)/documents',
  },
  {
    id: 'demo-verification',
    type: 'verification',
    title: 'Verification source unavailable',
    message: 'No authorized certificate source is configured in this prototype. Manual verification may be required.',
    time: '1 day ago',
    unread: true,
    destination: '/(tabs)/documents',
  },
  {
    id: 'demo-jago',
    type: 'jago',
    title: 'JAGO support',
    message: 'JAGO can explain scheme terms and app navigation. No personal reminder is configured.',
    time: '2 days ago',
    unread: false,
    destination: '/(tabs)/assistant',
  },
  {
    id: 'demo-dbt',
    type: 'dbt',
    title: 'Payment status unavailable',
    message: 'No DBT source is connected, so ADI SETU has no payment or disbursement status to report.',
    time: '3 days ago',
    unread: false,
    destination: '/applications',
  },
];

export async function loadNotifications(): Promise<AppNotification[]> {
  // Keep this async boundary so a future API can be substituted without
  // changing notification state or screen components.
  return mockNotifications.map(notification => ({ ...notification }));
}

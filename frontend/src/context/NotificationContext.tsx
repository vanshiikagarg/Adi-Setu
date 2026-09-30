import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppNotification } from '../types/notifications';
import { loadNotifications } from '../services/notifications';
import { useThemeRevision } from '../theme';

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: boolean;
  reload: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setNotifications(await loadNotifications());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const unreadCount = useMemo(() => notifications.reduce((count, item) => count + (item.unread ? 1 : 0), 0), [notifications]);
  const markRead = useCallback((id: string) => {
    setNotifications(current => current.map(item => item.id === id ? { ...item, unread: false } : item));
  }, []);
  const markAllRead = useCallback(() => {
    setNotifications(current => current.map(item => item.unread ? { ...item, unread: false } : item));
  }, []);

  return <NotificationContext.Provider value={{ notifications, unreadCount, loading, error, reload, markRead, markAllRead }}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  useThemeRevision();
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used inside NotificationProvider');
  return context;
}

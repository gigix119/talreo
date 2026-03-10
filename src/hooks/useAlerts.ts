/**
 * useAlerts — fetch, mark as read, delete, unread count.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { alertsService } from '@/services/alerts';
import type { Alert } from '@/types/database';

export function useAlerts(limit?: number) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await alertsService.getAlerts(user.id, limit);
      setAlerts(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load alerts.');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const markAlertAsRead = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await alertsService.markAlertAsRead(user.id, id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    },
    [user?.id]
  );

  const markAllAlertsAsRead = useCallback(async () => {
    if (!user?.id) return;
    await alertsService.markAllAlertsAsRead(user.id);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  }, [user?.id]);

  const deleteAlert = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      await alertsService.deleteAlert(user.id, id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    },
    [user?.id]
  );

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return {
    alerts,
    unreadCount,
    loading,
    error,
    refetch,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
  };
}


import { useEffect, useState } from 'react';

import { useAuth } from 'src/hooks/useAuth';

import { supabase } from 'src/lib/supabase';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return undefined;

    if (user.role === 'project_lead') {
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'work_sessions',
            filter: `status=eq.completed`,
          },
          async (payload) => {
            const { data: project } = await supabase
              .from('projects')
              .select('created_by')
              .eq('id', payload.new.project_id)
              .single();

            if (project?.created_by === user.id) {
              const newNotification = {
                id: crypto.randomUUID(),
                type: 'work_completed',
                message: `Work completed on project`,
                data: payload.new,
                timestamp: new Date(),
                read: false,
              };
              setNotifications((prev) => [newNotification, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
    return undefined;
  }, [user]);

  return { notifications, setNotifications };
};

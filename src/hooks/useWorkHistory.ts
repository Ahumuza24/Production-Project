
import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

import { WorkSession } from 'src/types/work-session';

export const useWorkHistory = (userId: string) => {
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    if (!userId) return undefined;

    const fetchWorkSessions = async () => {
      const { data, error } = await supabase
        .from('work_sessions')
        .select(`
          *,
          projects(name),
          components(name),
          processes(name)
        `)
        .eq('assembler_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching work sessions:', error);
      } else {
        setWorkSessions(data as WorkSession[]);
      }
    };

    fetchWorkSessions();

    const subscription = supabase
      .channel(`work_history_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_sessions',
          filter: `assembler_id=eq.${userId}`,
        },
        () => {
          fetchWorkSessions();
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId]);

  return { workSessions };
};
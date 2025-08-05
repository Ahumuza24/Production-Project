import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

import { WorkSession } from 'src/types/work-session';

export const useWorkSessions = (userId: string) => {
  const [activeSessions, setActiveSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    if (!userId) return undefined;

    const fetchWorkSessions = async () => {
      const { data, error } = await supabase
        .from('work_sessions')
        .select(
          `
          *,
          projects(name),
          components(name),
          processes(name)
        `
        )
        .eq('assembler_id', userId)
        .eq('status', 'in_progress');

      if (error) {
        console.error('Error fetching work sessions:', error);
      } else {
        setActiveSessions(data as WorkSession[]);
      }
    };

    fetchWorkSessions();

    const subscription = supabase
      .channel('work_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_sessions',
          filter: `assembler_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setActiveSessions((prev) => [...prev, payload.new as WorkSession]);
          } else if (payload.eventType === 'UPDATE') {
            setActiveSessions((prev) =>
              prev.map((session) =>
                session.id === payload.new.id ? (payload.new as WorkSession) : session
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setActiveSessions((prev) => prev.filter((session) => session.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const startWorkSession = async (sessionData: Partial<WorkSession>) => {
    const { data, error } = await supabase
      .from('work_sessions')
      .insert({
        ...sessionData,
        assembler_id: userId,
        start_time: new Date().toISOString(),
      })
      .select();

    return { data, error };
  };

  const endWorkSession = async (sessionId: string, partsCompleted: number) => {
    const { data, error } = await supabase
      .from('work_sessions')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
        parts_completed: partsCompleted,
      })
      .eq('id', sessionId)
      .select();

    if (error) {
      console.error('Error ending work session:', error);
    } else {
      console.log('Work session ended:', data);
      // Invoke the Edge Function to send notifications
      const { error: invokeError } = await supabase.functions.invoke('send-notifications', {
        body: JSON.stringify({ workSessionId: sessionId }),
      });

      if (invokeError) {
        console.error('Error invoking send-notifications function:', invokeError);
      }
    }
    return { data, error };
  };

  return { activeSessions, startWorkSession, endWorkSession };
};


import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

export const useAssemblerAnalytics = (userId: string) => {
  const [assemblerPerformance, setAssemblerPerformance] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return undefined;

    const fetchAssemblerPerformance = async () => {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('created_at, parts_completed')
        .eq('assembler_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching assembler performance:', error);
      } else {
        setAssemblerPerformance(data);
      }
    };

    fetchAssemblerPerformance();

    const subscription = supabase
      .channel(`assembler_performance_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_sessions',
          filter: `assembler_id=eq.${userId}`,
        },
        () => {
          fetchAssemblerPerformance();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { assemblerPerformance };
};

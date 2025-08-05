
import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

export const useAnalytics = () => {
  const [projectProgress, setProjectProgress] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjectProgress = async () => {
      const { data, error } = await supabase.from('project_progress').select('*');

      if (error) {
        console.error('Error fetching project progress:', error);
      } else {
        setProjectProgress(data);
      }
    };

    fetchProjectProgress();

    const subscription = supabase
      .channel('project_progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_progress' }, () => {
        fetchProjectProgress();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProjectAnalytics = async (projectId: string) => {
    const { data, error } = await supabase.rpc('get_project_analytics', { project_uuid: projectId });
    if (error) {
      console.error('Error fetching project analytics:', error);
      return null;
    }
    return data;
  };

  return { projectProgress, fetchProjectAnalytics };
};

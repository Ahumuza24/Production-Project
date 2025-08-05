
import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

import { Project } from 'src/types/project';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          components (*),
          profiles!created_by (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data as Project[]);
      }
    };

    fetchProjects();

    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return { projects };
};

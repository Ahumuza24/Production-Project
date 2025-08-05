
import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

export const useComponents = (projectId: string) => {
  const [components, setComponents] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId) {
      setComponents([]);
      return;
    }

    const fetchComponents = async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching components:', error);
      } else {
        setComponents(data);
      }
    };

    fetchComponents();
  }, [projectId]);

  return { components };
};

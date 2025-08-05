
import { useEffect, useState } from 'react';

import { supabase } from 'src/lib/supabase';

export const useProcesses = () => {
  const [processes, setProcesses] = useState<any[]>([]);

  useEffect(() => {
    const fetchProcesses = async () => {
      const { data, error } = await supabase.from('processes').select('*');

      if (error) {
        console.error('Error fetching processes:', error);
      } else {
        setProcesses(data);
      }
    };

    fetchProcesses();
  }, []);

  return { processes };
};

export interface Project {
  id: string;
  name: string;
  total_quantity: number;
  status: 'active' | 'completed' | 'paused';
  created_by: string;
  created_at: string;
  updated_at: string;
  components: any[]; 
  profiles: { name: string };
}

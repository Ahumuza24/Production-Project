export interface WorkSession {
  id: string;
  project_id: string;
  component_id: string;
  process_id: string;
  assembler_id: string;
  start_time: string;
  end_time?: string;
  parts_completed: number;
  status: 'in_progress' | 'completed' | 'paused';
  duration_minutes?: number;
  created_at: string;
  projects: { name: string };
  components: { name: string };
  processes: { name: string };
}

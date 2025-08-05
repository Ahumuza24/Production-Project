
import { useState } from 'react';

import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import { supabase } from 'src/lib/supabase';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from 'src/hooks/useAuth';
import { useProjects } from 'src/hooks/useProjects';
import { useComponents } from 'src/hooks/useComponents';
import { useProcesses } from 'src/hooks/useProcesses';

export function StartWorkSessionForm() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState('');
  const { components } = useComponents(selectedProject);
  const { processes } = useProcesses();

  const [componentId, setComponentId] = useState('');
  const [processId, setProcessId] = useState('');
  const [partsCompleted, setPartsCompleted] = useState(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data, error } = await supabase
      .from('work_sessions')
      .insert([
        {
          project_id: selectedProject,
          component_id: componentId,
          process_id: processId,
          parts_completed: partsCompleted,
          assembler_id: user?.id,
        },
      ])
      .select();

    if (error) {
      console.error('Error starting work session:', error);
    } else {
      console.log('Work session started:', data);
      setSelectedProject('');
      setComponentId('');
      setProcessId('');
      setPartsCompleted(0);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6">Start Work Session</Typography>
      <TextField
        select
        label="Project"
        value={selectedProject}
        onChange={(e) => setSelectedProject(e.target.value)}
        required
      >
        {projects.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Component"
        value={componentId}
        onChange={(e) => setComponentId(e.target.value)}
        required
        disabled={!selectedProject}
      >
        {components.map((component) => (
          <MenuItem key={component.id} value={component.id}>
            {component.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Process"
        value={processId}
        onChange={(e) => setProcessId(e.target.value)}
        required
      >
        {processes.map((process) => (
          <MenuItem key={process.id} value={process.id}>
            {process.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Parts Completed"
        type="number"
        value={partsCompleted}
        onChange={(e) => setPartsCompleted(Number(e.target.value))}
        required
      />
      <Button type="submit" variant="contained">
        Start Session
      </Button>
    </Box>
  );
}


import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

import { supabase } from 'src/lib/supabase';



export function CreateProjectForm() {
  const [projectName, setProjectName] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [components, setComponents] = useState([{ name: '', quantity_per_unit: 1 }]);

  const handleAddComponent = () => {
    setComponents([...components, { name: '', quantity_per_unit: 1 }]);
  };

  const handleRemoveComponent = (index: number) => {
    const newComponents = [...components];
    newComponents.splice(index, 1);
    setComponents(newComponents);
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    const newComponents = [...components];
    (newComponents[index] as any)[field] = value;
    setComponents(newComponents);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([{ name: projectName, total_quantity: totalQuantity }])
      .select();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return;
    }

    const projectId = projectData[0].id;
    const componentData = components.map((c) => ({ ...c, project_id: projectId }));

    const { error: componentError } = await supabase.from('components').insert(componentData);

    if (componentError) {
      console.error('Error creating components:', componentError);
    } else {
      console.log('Project and components created:');
      setProjectName('');
      setTotalQuantity(0);
      setComponents([{ name: '', quantity_per_unit: 1 }]);
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
      <Typography variant="h6">Create New Project</Typography>
      <TextField
        label="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        required
      />
      <TextField
        label="Total Quantity"
        type="number"
        value={totalQuantity}
        onChange={(e) => setTotalQuantity(Number(e.target.value))}
        required
      />
      <Typography variant="subtitle1">Components</Typography>
      {components.map((component, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Component Name"
            value={component.name}
            onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
            required
          />
          <TextField
            label="Quantity Per Unit"
            type="number"
            value={component.quantity_per_unit}
            onChange={(e) => handleComponentChange(index, 'quantity_per_unit', Number(e.target.value))}
            required
          />
          <IconButton onClick={() => handleRemoveComponent(index)}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Box>
      ))}
      <Button onClick={handleAddComponent}>Add Component</Button>
      <Button type="submit" variant="contained">
        Create Project
      </Button>
    </Box>
  );
}

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { useProjects } from 'src/hooks/useProjects';

import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';

import { ProjectTableRow } from 'src/sections/overview/project-table-row';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { CreateProjectForm } from 'src/sections/overview/create-project-form';
import { ProjectAnalytics } from 'src/sections/overview/project-analytics';

// ----------------------------------------------------------------------

export function ProjectsView() {
  const settings = useSettingsContext();
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleViewAnalytics = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  const TABLE_HEAD = [
    { id: 'name', label: 'Name' },
    { id: 'total_quantity', label: 'Total Quantity' },
    { id: 'status', label: 'Status' },
    { id: 'created_by', label: 'Created By' },
    { id: '' },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Projects
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage your FundiBots manufacturing projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => setShowCreateForm(!showCreateForm)}
          sx={{ height: 'fit-content' }}
        >
          {showCreateForm ? 'Cancel' : 'New Project'}
        </Button>
      </Box>

      {/* Create Project Form */}
      {showCreateForm && (
        <Box sx={{ mb: 4 }}>
          <CreateProjectForm 
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </Box>
      )}

      {/* Project Analytics */}
      {selectedProjectId && (
        <Box sx={{ mb: 4 }}>
          <ProjectAnalytics projectId={selectedProjectId} />
        </Box>
      )}

      {/* Projects Table or Empty State */}
      {projects.length > 0 || showCreateForm ? (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                All Projects ({projects.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:chart-bold" />}
                  onClick={() => setSelectedProjectId(selectedProjectId ? null : projects[0]?.id)}
                >
                  {selectedProjectId ? 'Hide Analytics' : 'Show Analytics'}
                </Button>
              </Box>
            </Box>
            
            <TableContainer sx={{ overflow: 'unset' }}>
              <Table sx={{ minWidth: 800 }}>
                <UserTableHead headLabel={TABLE_HEAD} rowCount={projects.length} />
                <TableBody>
                  {projects.map((row) => (
                    <ProjectTableRow
                      key={row.id}
                      row={row}
                      selected={false}
                      onSelectRow={() => {}}
                      onViewAnalytics={handleViewAnalytics}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Box 
          sx={{ 
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 4,
            gap: 3
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Iconify 
              icon="solar:pen-bold" 
              width={40} 
              sx={{ color: 'primary.main' }}
            />
          </Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            No projects yet
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: '1.1rem'
            }}
          >
            Get started by creating your first FundiBots manufacturing project to track components, manage work sessions, and monitor progress all in one place.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Iconify icon="solar:pen-bold" />}
            onClick={() => setShowCreateForm(true)}
            sx={{
              px: 8,
              py: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              minWidth: 280,
              mt: 1
            }}
          >
            Create Your First Project
          </Button>
        </Box>
      )}
    </Container>
  );
}
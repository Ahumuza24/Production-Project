import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { useProjects } from 'src/hooks/useProjects';

import { useSettingsContext } from 'src/components/settings';

import { ProjectTableRow } from '../project-table-row';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { ProjectProgressChart } from '../project-progress-chart';
import { CreateProjectForm } from '../create-project-form';
import { NotificationSystem } from 'src/components/notifications/NotificationSystem';
import { ProjectAnalytics } from '../project-analytics';

// ----------------------------------------------------------------------

export function ProjectLeadDashboardView() {
  const settings = useSettingsContext();
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
      <NotificationSystem />
      <h1>Project Lead Dashboard</h1>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <ProjectProgressChart title="Project Progress" />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <CreateProjectForm />
          </Box>
        </Box>
        {selectedProjectId && (
          <Box>
            <ProjectAnalytics projectId={selectedProjectId} />
          </Box>
        )}
        <Box>
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
        </Box>
      </Box>
    </Container>
  );
}


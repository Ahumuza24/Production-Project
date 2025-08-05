import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { useAuth } from 'src/hooks/useAuth';

import { useSettingsContext } from 'src/components/settings';

import { useWorkSessions } from 'src/hooks/useWorkSessions';
import { WorkSessionTableRow } from '../work-session-table-row';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { AssemblerPerformanceChart } from '../assembler-performance-chart';
import { StartWorkSessionForm } from '../start-work-session-form';

// ----------------------------------------------------------------------

export function AssemblerDashboardView() {
  const settings = useSettingsContext();
  const { user } = useAuth();
  const { activeSessions } = useWorkSessions(user?.id || '');

  const TABLE_HEAD = [
    { id: 'project_name', label: 'Project' },
    { id: 'component_name', label: 'Component' },
    { id: 'process_name', label: 'Process' },
    { id: 'parts_completed', label: 'Parts Completed' },
    { id: 'status', label: 'Status' },
    { id: '' },
  ];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <h1>Assembler Dashboard</h1>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <AssemblerPerformanceChart title="My Performance" />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <StartWorkSessionForm />
          </Box>
        </Box>
        <Box>
          <h2>Active Work Sessions</h2>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead headLabel={TABLE_HEAD} rowCount={activeSessions.length} />
              <TableBody>
                {activeSessions.map((row) => (
                  <WorkSessionTableRow
                    key={row.id}
                    row={row}
                    selected={false}
                    onSelectRow={() => {}}
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

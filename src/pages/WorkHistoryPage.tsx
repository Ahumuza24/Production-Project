import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { useAuth } from 'src/hooks/useAuth';
import { useWorkHistory } from 'src/hooks/useWorkHistory';
import { WorkSessionTableRow } from 'src/sections/overview/work-session-table-row';
import { UserTableHead } from 'src/sections/user/user-table-head';

export default function WorkHistoryPage() {
  const { user } = useAuth();
  const { workSessions } = useWorkHistory(user?.id || '');

  const TABLE_HEAD = [
    { id: 'project_name', label: 'Project' },
    { id: 'component_name', label: 'Component' },
    { id: 'process_name', label: 'Process' },
    { id: 'parts_completed', label: 'Parts Completed' },
    { id: 'status', label: 'Status' },
    { id: '' },
  ];

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Work History
      </Typography>

      <TableContainer sx={{ overflow: 'unset' }}>
        <Table sx={{ minWidth: 800 }}>
          <UserTableHead headLabel={TABLE_HEAD} rowCount={workSessions.length} />
          <TableBody>
            {workSessions.map((row) => (
              <WorkSessionTableRow key={row.id} row={row} selected={false} onSelectRow={() => {}} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

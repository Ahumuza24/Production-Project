import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableBody from '@mui/material/TableBody';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';

import { useProjects } from 'src/hooks/useProjects';
import { useAuth } from 'src/hooks/useAuth';

import { useSettingsContext } from 'src/components/settings';
import { Iconify } from 'src/components/iconify';

import { ProjectTableRow } from '../project-table-row';
import { UserTableHead } from 'src/sections/user/user-table-head';
import { ProjectProgressChart } from '../project-progress-chart';
import { NotificationSystem } from 'src/components/notifications/NotificationSystem';
import { ProjectAnalytics } from '../project-analytics';

// ----------------------------------------------------------------------

// Statistics Card Component
function StatCard({ title, value, change, icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: 'solar:chart-bold' | 'solar:check-circle-bold' | 'solar:pen-bold' | 'solar:eye-bold';
  color: string;
}) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.lighter`,
              color: `${color}.main`,
            }}
          >
            <Iconify icon={icon} width={24} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Iconify 
                icon={isPositive ? 'solar:restart-bold' : 'solar:restart-bold'} 
                width={16} 
                sx={{ transform: isPositive ? 'rotate(0deg)' : 'rotate(180deg)' }}
              />
              {change}
            </Typography>
          </Box>
        </Box>
        <Typography variant="h3" sx={{ mb: 0.5, fontWeight: 700 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function ProjectLeadDashboardView() {
  const settings = useSettingsContext();
  const { projects } = useProjects();
  const { user } = useAuth();
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

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalComponents = projects.reduce((sum, p) => sum + (p.components?.length || 0), 0);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <NotificationSystem />
      
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Hi, Welcome back 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Here&apos;s what&apos;s happening with your FundiBots projects today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 3,
        mb: 4 
      }}>
        <StatCard
          title="Active Projects"
          value={activeProjects.toString()}
          change="+2.6%"
          icon="solar:chart-bold"
          color="primary"
        />
        <StatCard
          title="Completed Projects"
          value={completedProjects.toString()}
          change="+1.2%"
          icon="solar:check-circle-bold"
          color="success"
        />
        <StatCard
          title="Total Components"
          value={totalComponents.toString()}
          change="+3.1%"
          icon="solar:pen-bold"
          color="warning"
        />
        <StatCard
          title="Active Assemblers"
          value="8"
          change="+0.5%"
          icon="solar:eye-bold"
          color="info"
        />
      </Box>

      {/* Charts */}
      <Box sx={{ mb: 4 }}>
        <ProjectProgressChart title="Project Progress Overview" />
      </Box>

      {/* Project Analytics */}
      {selectedProjectId && (
        <Box sx={{ mb: 4 }}>
          <ProjectAnalytics projectId={selectedProjectId} />
        </Box>
      )}

      {/* Projects Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Recent Projects
          </Typography>
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
    </Container>
  );
}


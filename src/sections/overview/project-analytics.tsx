
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { useAnalytics } from 'src/hooks/useAnalytics';

type ProjectAnalyticsProps = {
  projectId: string;
};

export function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const { fetchProjectAnalytics } = useAnalytics();
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const getAnalytics = async () => {
      const data = await fetchProjectAnalytics(projectId);
      setAnalyticsData(data);
    };
    getAnalytics();
  }, [projectId, fetchProjectAnalytics]);

  if (!analyticsData) {
    return <Typography>Loading analytics...</Typography>;
  }

  return (
    <Card>
      <CardHeader title="Project Analytics" />
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle1">Total Components: {analyticsData.total_components}</Typography>
        <Typography variant="subtitle1">Completed Components: {analyticsData.completed_components}</Typography>
        <Typography variant="subtitle1">Overall Progress: {analyticsData.overall_progress?.toFixed(2)}%</Typography>
        <Typography variant="subtitle1">Active Assemblers: {analyticsData.active_assemblers}</Typography>
        <Typography variant="subtitle1">Total Hours: {analyticsData.total_hours?.toFixed(2)}</Typography>
      </Box>
    </Card>
  );
}

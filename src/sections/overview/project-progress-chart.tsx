
import type { CardProps } from '@mui/material/Card';
import type { ChartOptions } from 'src/components/chart';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useAnalytics } from 'src/hooks/useAnalytics';

import { Chart, useChart } from 'src/components/chart';

type Props = CardProps & {
  title?: string;
  subheader?: string;
};

export function ProjectProgressChart({ title, subheader, sx, ...other }: Props) {
  const theme = useTheme();
  const { projectProgress } = useAnalytics();

  const chartColors = [hexAlpha(theme.palette.primary.dark, 0.8)];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 2, colors: ['transparent'] },
    xaxis: { categories: projectProgress.map((p) => p.project_name) },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => `${value}%` } },
  });

  const series = [
    {
      name: 'Completion Percentage',
      data: projectProgress.map((p) => p.completion_percentage),
    },
  ];

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar"
        series={series}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{
          pl: 1,
          py: 2.5,
          pr: 2.5,
          height: 364,
        }}
      />
    </Card>
  );
}

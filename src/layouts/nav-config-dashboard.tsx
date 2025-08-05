// ...existing code...
import { SvgColor } from 'src/components/svg-color';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Projects',
    path: '/dashboard',
    icon: <Iconify icon="solar:pen-bold" />,
  },
  {
    title: 'Work Sessions',
    path: '/work-history',
    icon: <Iconify icon="solar:share-bold" />,
  },
  {
    title: 'Analytics',
    path: '/dashboard',
    icon: <Iconify icon="solar:chart-bold" />,
  },
  {
    title: 'Team',
    path: '/user',
    icon: <Iconify icon="solar:eye-bold" />,
  },
];

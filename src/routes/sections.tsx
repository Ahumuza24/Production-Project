import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import { ProtectedRoute, RoleBasedRedirect } from 'src/components/auth';

// ----------------------------------------------------------------------

export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProjectLeadDashboardPage = lazy(() => import('src/pages/ProjectLeadDashboard'));
export const AssemblerDashboardPage = lazy(() => import('src/pages/AssemblerDashboard'));
export const WorkHistoryPage = lazy(() => import('src/pages/WorkHistoryPage'));
export const ProjectsPage = lazy(() => import('src/pages/ProjectsPage'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    index: true,
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true,
        element: <RoleBasedRedirect />
      },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute requiredRole="project_lead">
            <ProjectLeadDashboardPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'assembler', 
        element: (
          <ProtectedRoute requiredRole="assembler">
            <AssemblerDashboardPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'projects', 
        element: (
          <ProtectedRoute requiredRole="project_lead">
            <ProjectsPage />
          </ProtectedRoute>
        ) 
      },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'work-history', element: <WorkHistoryPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <AuthLayout>
        <SignUpPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];

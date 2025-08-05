import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'project_lead' | 'assembler';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to sign in
        navigate('/sign-in');
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        if (user.role === 'project_lead') {
          navigate('/dashboard');
        } else {
          navigate('/assembler');
        }
        return;
      }
    }
  }, [user, loading, navigate, requiredRole]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect to sign in
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
}
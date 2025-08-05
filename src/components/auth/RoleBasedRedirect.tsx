import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuth } from 'src/contexts/AuthContext';

// ----------------------------------------------------------------------

export function RoleBasedRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/sign-in');
      } else if (user.role === 'project_lead') {
        navigate('/dashboard');
      } else {
        navigate('/assembler');
      }
    }
  }, [user, loading, navigate]);

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
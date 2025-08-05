
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { SelectChangeEvent } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'assembler',
    terms: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setFormState(prevState => ({
      ...prevState,
      [name!]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSignUp = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { name, email, password, role } = formState;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) {
        console.error('Error signing up:', error);
        alert(`Signup error: ${error.message}`);
        return;
      }

      // Profile should be created automatically by database trigger
      console.log('User and profile created successfully!');
      
      // Wait a moment for the profile to be created, then redirect to role-based dashboard
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (err) {
      console.error('Signup error:', err);
      alert(`Unexpected error: ${err}`);
    }
  }, [router, formState]);

  const renderForm = (
    <Box
      component="form"
      onSubmit={handleSignUp}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <TextField
        fullWidth
        name="name"
        label="Full name"
        value={formState.name}
        onChange={handleChange}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={formState.email}
        onChange={handleChange}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={formState.password}
        onChange={handleChange}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
       <FormControl fullWidth>
        <InputLabel id="role-select-label">Role</InputLabel>
        <Select
          labelId="role-select-label"
          id="role-select"
          label="Role"
          name="role"
          value={formState.role}
          onChange={handleChange}
        >
          <MenuItem value="project_lead">Project Lead</MenuItem>
          <MenuItem value="assembler">Assembler/Machine Operator</MenuItem>
        </Select>
      </FormControl>

      <FormControlLabel
        control={<Checkbox name="terms" checked={formState.terms} onChange={handleChange} />}
        label={
          <Typography variant="body2">
            I agree to the <Link color="inherit" href="#">Terms of Service</Link> and <Link color="inherit" href="#">Privacy Policy</Link>.
          </Typography>
        }
        sx={{
            alignSelf: 'flex-start'
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
      >
        Sign up
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign up</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Already have an account?
          <Link href="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}

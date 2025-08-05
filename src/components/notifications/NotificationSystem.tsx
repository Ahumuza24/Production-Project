import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNotifications } from 'src/hooks/useNotifications';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export function NotificationSystem() {
  const { notifications } = useNotifications();

  return (
    <Box sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
      <Typography variant="h6">Notifications</Typography>
      <List>
        {notifications.map((notification) => (
          <ListItem key={notification.id}>
            <ListItemText primary={notification.message} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

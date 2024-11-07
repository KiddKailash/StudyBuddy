import React from 'react';

import { List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';

export default function Sidebar() {
  return (
    <List component="nav" sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.default' }}>
      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Home" />
        </ListItemButton>
      </ListItem>
      <Divider />

      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>
      <Divider />

      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </ListItem>
      <Divider />

      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </ListItem>
      <Divider />

      <ListItem disablePadding>
        <ListItemButton>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

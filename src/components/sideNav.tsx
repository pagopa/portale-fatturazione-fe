import React from 'react';
import { useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Divider,
} from '@mui/material';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

export default function SideNavComponent() {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const handleListItemClick = (index : number) => {
    setSelectedIndex(index);
  };

  return (
    <Box sx={{
      height: '100%',
      maxWidth: 360,
      backgroundColor: 'background.paper',
    }}
    >
      <List component="nav" aria-label="main piattaforma-notifiche sender">
        <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0)}>
          <ListItemIcon>
            <DnsIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Dati Fatturazione" />
        </ListItemButton>
        <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(1)}>
          <ListItemIcon>
            <ViewModuleIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Modulo Commessa" />
        </ListItemButton>
        <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2)}>
          <ListItemIcon>
            <PlaylistRemoveIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Contestazioni" />
        </ListItemButton>
      </List>
      <Divider />
    </Box>

  );
}

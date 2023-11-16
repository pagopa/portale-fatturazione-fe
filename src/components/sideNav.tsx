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
import { useNavigate } from "react-router-dom";
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

export default function SideNavComponent() {
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (index : number, route : string) => {
        navigate(route);
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
                <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(0,'/')}>
                    <ListItemIcon>
                        <DnsIcon fontSize="inherit"></DnsIcon>
                        
                    </ListItemIcon>
                    <ListItemText primary="Dati di fatturazione" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(1, '/8')}>
                    <ListItemIcon>
                        <ViewModuleIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Modulo Commessa" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(2,'/4')}>
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

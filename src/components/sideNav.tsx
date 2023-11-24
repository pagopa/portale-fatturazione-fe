import React from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import DnsIcon from '@mui/icons-material/Dns';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

export default function SideNavComponent() {
    const navigate = useNavigate();
    const location : any = useLocation();
    console.log({location});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (index : number, route : string) => {
        navigate(route);
        setSelectedIndex(index);
    };

    const currentLocation = location.pathname;

    useEffect(()=>{
        if(currentLocation === '/'){
            setSelectedIndex(0);
        }else if(currentLocation === '/8'){
            setSelectedIndex(1);
        }else if(currentLocation === '/4'){
            setSelectedIndex(2);
        }
        
    },[currentLocation]);

    

    return (
        <>
            {(location.pathname === '/login' || location.pathname === '/auth') ? null : 
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
                            <ListItemText primary="Modulo commessa" />
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
            }
        </>

    );
}

import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import {  useEffect, useState } from "react";
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachEmailIcon from '@mui/icons-material/AttachEmail';

const SideNavPagopa = () => {
    const navigate = useNavigate();

    const [selectedIndex, setSelectedIndex] = useState<number|null>(0);

    const handleListItemClick = async(pathToGo) => {
        navigate(pathToGo);
          
    };

    const currentLocation = location.pathname;
    useEffect(()=>{
        if(currentLocation === PathPf.ANAGRAFICAPSP){
            setSelectedIndex(0);
        }else if(currentLocation === PathPf.DOCUMENTICONTABILI){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.KPI){
            setSelectedIndex(2);
        }else if(currentLocation === PathPf.EMAIL_PSP){
            setSelectedIndex(3);
        }else if(currentLocation === "/messaggi"){
            setSelectedIndex(null);
        }
    },[currentLocation]);

    return (
        <Box sx={{
            height: '100%',
            maxWidth: 360,
            backgroundColor: 'background.paper',
        }}
        >
            <List component="nav" aria-label="main piattaforma-notifiche sender">
                <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClick(PathPf.ANAGRAFICAPSP)}>
                    <ListItemIcon>
                        <ReceiptIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Anagrafica PSP" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClick(PathPf.DOCUMENTICONTABILI)}>
                    <ListItemIcon>
                        <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
                    </ListItemIcon>
                    <ListItemText primary="Documenti contabili" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClick(PathPf.KPI)}>
                    <ListItemIcon>
                        <PaymentsIcon fontSize="inherit"></PaymentsIcon>
                    </ListItemIcon>
                    <ListItemText primary="KPI Pagamenti" />
                </ListItemButton>
                <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClick(PathPf.EMAIL_PSP)}>
                    <ListItemIcon>
                        <AttachEmailIcon fontSize="inherit"></AttachEmailIcon>
                    </ListItemIcon>
                    <ListItemText primary="Invio email PSP" />
                </ListItemButton>
            </List>
            <Divider />
        </Box>
    );
};
export default SideNavPagopa;
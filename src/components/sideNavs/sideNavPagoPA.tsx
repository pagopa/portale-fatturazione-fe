import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { getProfilo } from "../../reusableFunction/actionLocalStorage";
import { useEffect, useState } from "react";
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";

const SideNavPagopa = () => {

    const profilo = getProfilo();
    const navigate = useNavigate();

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    const hideShowSidenav = location.pathname === '/auth' ||
    location.pathname === '/azure' ||
    location.pathname === '/auth/azure'||
    location.pathname === '/azureLogin'||
    !profilo.auth;


    const handleListItemClickAnagrafica = () =>{
        console.log('ecco');
        navigate(PathPf.ANAGRAFICAPSP);
    };

    const currentLocation = location.pathname;
    useEffect(()=>{
        if(currentLocation === PathPf.ANAGRAFICAPSP){
            setSelectedIndex(0);
        }else if(currentLocation === 'prova2'){
            setSelectedIndex(1);
        }
       
    },[currentLocation]);

    return (
        <>
            {hideShowSidenav ? null :
                <Box sx={{
                    height: '100%',
                    maxWidth: 360,
                    backgroundColor: 'background.paper',
                }}
                >
                    <List component="nav" aria-label="main piattaforma-notifiche sender">
                        <ListItemButton selected={selectedIndex === 0} onClick={() => handleListItemClickAnagrafica()}>
                            <ListItemIcon>
                                <ReceiptIcon fontSize="inherit" />
                            </ListItemIcon>
                            <ListItemText primary="Anagrafica PSP" />
                        </ListItemButton>
                          
                        <ListItemButton selected={selectedIndex === 1} onClick={() => console.log(999)}>
                            <ListItemIcon>
                                <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
                            </ListItemIcon>
                            <ListItemText primary="Documenti contabili" />
                        </ListItemButton>
                    </List>
                    <Divider />
                </Box>
            }
        </>
    );
};
export default SideNavPagopa;
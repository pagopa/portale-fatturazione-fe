import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { deleteFilterToLocalStorageAnagrafica, deleteFilterToLocalStorageDocConPA, deleteFilterToLocalStorageDocConPaginationPA, getProfilo } from "../../reusableFunction/actionLocalStorage";
import { useContext, useEffect, useState } from "react";
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import { GlobalContext } from "../../store/context/globalContext";
import PaymentsIcon from '@mui/icons-material/Payments';

const SideNavPagopa = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState} = globalContextObj;
 
    
    const profilo =  mainState.profilo;
    const navigate = useNavigate();

    const [selectedIndex, setSelectedIndex] = useState<number|null>(0);

    const hideShowSidenav = location.pathname === '/auth' ||
    location.pathname === '/azure' ||
    location.pathname === '/auth/azure'||
    location.pathname === '/azureLogin'||
    !profilo.auth;


    const handleListItemClickAnagrafica = () =>{
        navigate(PathPf.ANAGRAFICAPSP);
        deleteFilterToLocalStorageDocConPA();
        deleteFilterToLocalStorageDocConPaginationPA();
    };

    const handleListItemClickDocContabili = () =>{
        navigate(PathPf.DOCUMENTICONTABILI);
        deleteFilterToLocalStorageAnagrafica();
    };

    const handleListItemClickKpi = () => {
        navigate(PathPf.KPI);
    };

    const currentLocation = location.pathname;
    useEffect(()=>{
        if(currentLocation === PathPf.ANAGRAFICAPSP){
            setSelectedIndex(0);
        }else if(currentLocation === PathPf.DOCUMENTICONTABILI){
            setSelectedIndex(1);
        }else if(currentLocation === PathPf.KPI){
            setSelectedIndex(2);
        }else if(currentLocation === "/messaggi"){
            setSelectedIndex(null);
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
                          
                        <ListItemButton selected={selectedIndex === 1} onClick={() => handleListItemClickDocContabili()}>
                            <ListItemIcon>
                                <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
                            </ListItemIcon>
                            <ListItemText primary="Documenti contabili" />
                        </ListItemButton>
                        <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClickKpi()}>
                            <ListItemIcon>
                                <PaymentsIcon fontSize="inherit"></PaymentsIcon>
                            </ListItemIcon>
                            <ListItemText primary="KPI Pagamenti" />
                        </ListItemButton>
                    </List>
                    <Divider />
                </Box>
            }
        </>
    );
};
export default SideNavPagopa;
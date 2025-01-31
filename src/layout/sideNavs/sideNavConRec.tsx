import React, { useContext } from 'react';
import { useState, useEffect } from 'react';
import {
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Box,
    Divider
} from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import { GlobalContext } from '../../store/context/globalContext';
import { PathPf } from '../../types/enum';

const SideNavRecCon: React.FC = () => {

    const globalContextObj = useContext(GlobalContext);
    const {mainState,setOpenBasicModal_DatFat_ModCom} = globalContextObj;
    const navigate = useNavigate();
    const location = useLocation();
    const currentLocation = location.pathname;

    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
    
    const handleListItemClickNotifiche = () => {
        if((mainState.statusPageDatiFatturazione === 'mutable'&& location.pathname === PathPf.DATI_FATTURAZIONE)||(mainState.statusPageInserimentoCommessa === 'mutable' && location.pathname === PathPf.MODULOCOMMESSA)){
            setOpenBasicModal_DatFat_ModCom(prev => ({...prev, ...{visible:true,clickOn:PathPf.LISTA_NOTIFICHE}}));
        }else{
            navigate(PathPf.LISTA_NOTIFICHE);
        }
    };

    useEffect(()=>{
        if(currentLocation === PathPf.LISTA_NOTIFICHE){
            setSelectedIndex(2);
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
                <ListItemButton selected={selectedIndex === 2} onClick={() => handleListItemClickNotifiche()}>
                    <ListItemIcon>
                        <MarkUnreadChatAltIcon fontSize="inherit" />
                    </ListItemIcon>
                    <ListItemText primary="Notifiche" />
                </ListItemButton>
            </List>
            <Divider />
        </Box>
    );
};
export default SideNavRecCon;
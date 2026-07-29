import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";
import PaymentsIcon from '@mui/icons-material/Payments';
import SendIcon from '@mui/icons-material/Send';

const SideNavPagopa = () => {
  const navigate = useNavigate();


  const handleListItemClick = async(pathToGo) => {
    navigate(pathToGo);    
  };

  const currentLocation = location.pathname;


  return (
    <Box sx={{
      height: '100%',
      maxWidth: 360,
      backgroundColor: 'background.paper',
    }}
    >
      <List component="nav">
        <ListItemButton selected={currentLocation === PathPf.ANAGRAFICAPSP } onClick={() => handleListItemClick(PathPf.ANAGRAFICAPSP)}>
          <ListItemIcon>
            <ReceiptIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Anagrafica PSP" />
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.DOCUMENTICONTABILI || currentLocation === PathPf.DETTAGLIO_DOC_CONTABILE} onClick={() => handleListItemClick(PathPf.DOCUMENTICONTABILI)}>
          <ListItemIcon>
            <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
          </ListItemIcon>
          <ListItemText primary="Documenti contabili" />
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.KPI} onClick={() => handleListItemClick(PathPf.KPI)}>
          <ListItemIcon>
            <PaymentsIcon fontSize="inherit"></PaymentsIcon>
          </ListItemIcon>
          <ListItemText primary="KPI Pagamenti" />
        </ListItemButton>
        {/* 
                <ListItemButton selected={selectedIndex === 3} onClick={() => handleListItemClick(PathPf.EMAIL_PSP)}>
                    <ListItemIcon>
                        <SendIcon fontSize="inherit"></SendIcon>
                    </ListItemIcon>
                    <ListItemText primary="Mail PSP" />
                </ListItemButton>
                */}
      </List>
      <Divider />
    </Box>
  );
};
export default SideNavPagopa;
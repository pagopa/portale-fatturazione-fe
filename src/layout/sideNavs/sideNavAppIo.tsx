import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useNavigate } from "react-router";
import { PathPf } from "../../types/enum";

const SideNavAppIo = () => {
  const navigate = useNavigate();
  const currentLocation = location.pathname;
  const handleListItemClick = async(pathToGo) => {
    navigate(pathToGo);    
  };

  return (
    <Box sx={{
      height: '100%',
      maxWidth: 360,
      backgroundColor: 'background.paper',
    }}
    >
      <List component="nav">
        <ListItemButton selected={currentLocation === PathPf.ANAGRAFICAAPPIO } onClick={() => handleListItemClick(PathPf.ANAGRAFICAAPPIO)}>
          <ListItemIcon>
            <ReceiptIcon fontSize="inherit" />
          </ListItemIcon>
          <ListItemText primary="Anagrafica App IO" />
        </ListItemButton>
        <ListItemButton selected={currentLocation === PathPf.DOCUMENTICONTABILIAPPIO || currentLocation === PathPf.DETTAGLIO_DOC_CONTABILE_APPIO} onClick={() => handleListItemClick(PathPf.DOCUMENTICONTABILIAPPIO)}>
          <ListItemIcon>
            <ManageSearchIcon fontSize="inherit"></ManageSearchIcon>
          </ListItemIcon>
          <ListItemText primary="Documenti contabili" />
        </ListItemButton>
      </List>
      <Divider />
    </Box>
  );
};
export default SideNavAppIo;
import { Box, Chip, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "./conf_GridDocEmessiEnte";
import FingerprintIcon from '@mui/icons-material/Fingerprint';

export const headerNamesEnte: HeaderGridCustom[] = [
    {label:"Contestazione", align:"center", width:"100px"},
    {label:"Id", align:"center", width:"80px",headerTooltip:(title,label,color) => <Tooltip
            placement="bottom"
            title={label}
        ><span><Chip  variant="outlined" label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FingerprintIcon />
        </Box>
    }  sx={{backgroundColor:"#D6E8FB"}}   /></span></Tooltip>},
    {label:"Onere", align:"center", width:"100px"},
    {label:"Recipient ID", align:"center", width:"100px"},
    {label:"Anno", align:"center", width:"100px"},
    {label:"Mese", align:"center", width:"100px"},
    {label:"Data", align:"center", width:"150px",headerActionSort:true},
    {label:"Tipo Notifica", align:"center", width:"100px"},
    {label:"IUN", align:"center", width:"100px"},
    {label:"Data invio", align:"center", width:"100px"},
    {label:"Stato estero", align:"center", width:"100px"},
    {label:"CAP", align:"center", width:"100px"},
    {label:"Costo", align:"center", width:"100px"},
    {label:"", align:"center", width:"80px"},
];

export const headerNamesAdmin: HeaderGridCustom[] = [
    {label:"Contestazione", align:"center", width:"100px"},
    {label:"Id", align:"center", width:"80px",headerTooltip:(title,label,color) => <Tooltip
            placement="bottom"
            title={label}
        ><span><Chip  variant="outlined" label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FingerprintIcon />
        </Box>
    }  sx={{backgroundColor:"#D6E8FB"}}   /></span></Tooltip>},
    {label:"Onere", align:"center", width:"100px"},
    {label:"Recipient ID", align:"center", width:"100px"},
    {label:"Anno", align:"center", width:"100px"},
    {label:"Mese", align:"center", width:"100px"},
    {label:"Data", align:"center", width:"150px",headerActionSort:true},
    {label:"Ragione Sociale", align:"center", width:"100px"},
    {label:"Tipo Notifica", align:"center", width:"100px"},
    {label:"IUN", align:"center", width:"100px"},
    {label:"Data invio", align:"center", width:"100px"},
    {label:"Stato estero", align:"center", width:"100px"},
    {label:"CAP", align:"center", width:"100px"},
    {label:"Costo", align:"center", width:"100px"},
    {label:"", align:"center", width:"80px"},
];

 


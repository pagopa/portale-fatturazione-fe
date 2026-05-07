import { Alert, Box, Chip, IconButton, Snackbar, Tooltip } from "@mui/material";
import { HeaderGridCustom } from "./conf_GridDocEmessiEnte";
import ArticleIcon from '@mui/icons-material/Article';
import { useState } from "react";

export const headerNamesEnte: HeaderGridCustom[] = [
    {label:"Contestazione", align:"center", width:"100px"},
    {label:"Onere", align:"center", width:"100px"},
    {label:"Recipient ID", align:"center", width:"100px"},
    {label:"Anno", align:"center", width:"100px"},
    {label:"Mese", align:"center", width:"100px"},
    {label:"Data Evento", align:"center", width:"150px",headerActionSort:false},
    {label:"Tipo Notifica", align:"center", width:"100px"},
    {label:"IUN", align:"center", width:"100px"},
    {label:"Data Postalizzazione", align:"center", width:"100px"},
    {label:"Stato estero", align:"center", width:"100px"},
    {label:"CAP", align:"center", width:"100px"},
    {label:"Costo", align:"center", width:"100px"},
    {label:"", align:"center", width:"80px"},
];

export const headerNamesAdmin: HeaderGridCustom[] = [
    {label:"Contestazione", align:"center", width:"100px"},
    {label:"Event ID", align:"center", width:"80px",headerTooltip:(title,label,color) => {

    const [open, setOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(label);
        setOpen(true);
    };
       return( <>
            <Tooltip  title={label}>
                <IconButton onClick={handleCopy}>
                    <ArticleIcon sx={{color:"default"}} fontSize="small" />
                </IconButton>
            </Tooltip>
            <Snackbar
                open={open}
                onClose={() => setOpen(false)}
                autoHideDuration={2000}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            ><Alert 
                onClose={() => setOpen(false)} 
                severity="success" 
                >Event ID Copiato!
            </Alert></Snackbar>
        </>)
    }
    },
    {label:"Onere", align:"center", width:"100px"},
    {label:"Recipient ID", align:"center", width:"100px"},
    {label:"Anno", align:"center", width:"100px"},
    {label:"Mese", align:"center", width:"100px"},
    {label:"Data Evento", align:"center", width:"150px",headerActionSort:false},
    {label:"Ragione Sociale", align:"center", width:"100px"},
    {label:"Tipo Notifica", align:"center", width:"100px"},
    {label:"IUN", align:"center", width:"100px"},
    {label:"Data Postalizzazione", align:"center", width:"100px"},
    {label:"Stato estero", align:"center", width:"100px"},
    {label:"CAP", align:"center", width:"100px"},
    {label:"Costo", align:"center", width:"100px"},
    {label:"", align:"center", width:"80px"},
];

 

/*  // {label:"Id", align:"center", width:"80px",headerTooltip:(title,label,color) => <Tooltip
            placement="bottom"
            title={label}
        ><span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <ArticleIcon fontSize="small" />
         </span>
         </Tooltip>}, */
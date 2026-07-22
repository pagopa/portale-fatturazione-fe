import { Alert, IconButton, Snackbar, Tooltip } from "@mui/material";
import ArticleIcon from '@mui/icons-material/Article';
import { useState } from "react";
import { HeaderGridCustom } from "../../components/reusableComponents/grid/gridCustom";
import { getOnereLabel } from "../../reusableFunction/function";

export const headerNamesEnte: HeaderGridCustom[] = [
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
    </>);
  }
  },
  {label:"Onere", align:"center", width:"100px"},
  {label:"Recipient ID", align:"center", width:"100px"},
  {label:"Anno", align:"center", width:"100px"},
  {label:"Mese", align:"center", width:"100px"},
  {label:"Data Evento", align:"center", width:"150px",headerActionSort:true},
  {label:"Tipo Notifica", align:"center", width:"100px"},
  {label:"IUN", align:"center", width:"100px"},
  {label:"Data Postalizzazione", align:"center", width:"100px"},
  {label:"Stato estero", align:"center", width:"100px"},
  {label:"CAP", align:"center", width:"100px"},
  {label:"Costo", align:"center", width:"100px"},
  {label:"", align:"center", width:"80px"},
];


export const headerNamesAdmin: HeaderGridCustom[] = [
  {label:"Contestazione", align:"center", width:"100px", keyValue:"contestazione", typeColumn:"string",makeAction:true},
  {label:"Event ID", align:"center", width:"80px", keyValue:"id", typeColumn:"snackbar"},
  {label:"Onere", align:"center", width:"100px", keyValue:"onere", typeColumn:"string", funToManipulateValue:getOnereLabel},
  {label:"Recipient ID", align:"center", width:"100px", keyValue:"recipientId", typeColumn:"string"},
  {label:"Anno", align:"center", width:"100px", keyValue:"anno", typeColumn:"string"},
  {label:"Mese", align:"center", width:"100px", keyValue:"mese", typeColumn:"mese-number"},
  {label:"Data Evento", align:"center", width:"150px", headerActionSort:true, keyValue:"data", typeColumn:"data"},
  {label:"Ragione Sociale", align:"center", width:"100px", keyValue:"ragioneSociale", typeColumn:"ragionesociale",makeAction:false},
  {label:"Tipo Notifica", align:"center", width:"100px", keyValue:"tipoNotifica", typeColumn:"string"},
  {label:"IUN", align:"center", width:"100px", keyValue:"iun", typeColumn:"string"},
  {label:"Data Postalizzazione", align:"center", width:"100px", keyValue:"dataInvio", typeColumn:"data"},
  {label:"Stato estero", align:"center", width:"100px", keyValue:"statoEstero", typeColumn:"string"},
  {label:"CAP", align:"center", width:"100px", keyValue:"cap", typeColumn:"string"},
  {label:"Costo", align:"center", width:"100px", keyValue:"costEuroInCentesimi", typeColumn:"euro-centesimi"},
  {label:"", align:"center", width:"80px", keyValue:"arrow", typeColumn:"arrow"}
];



